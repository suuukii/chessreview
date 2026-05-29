"use client";

import { useEffect, useRef, useState } from "react";

type Evaluation =
  | { type: "cp"; value: number }
  | { type: "mate"; value: number };

interface EvaluationBarProps {
  fen: string;
  flipped?: boolean;
}

function parseStockfishEvaluation(line: string, sideToMove: "w" | "b"): Evaluation | null {
  const scoreMatch = line.match(/\bscore (cp|mate) (-?\d+)/);
  if (!scoreMatch) return null;


  const rawValue = Number(scoreMatch[2]);
  const whiteValue = sideToMove === "w" ? rawValue : -rawValue;

  return {
    type: scoreMatch[1] as "cp" | "mate",
    value: whiteValue,
  };
}

function getWhitePercent(evaluation: Evaluation | null): number {
  if (!evaluation) return 50;
  if (evaluation.type === "mate") return evaluation.value > 0 ? 100 : 0;

  const clamped = Math.max(-1000, Math.min(1000, evaluation.value));
  return 50 + clamped / 20;
}

function formatEvaluation(evaluation: Evaluation | null): string {
  if (!evaluation) return "0.0";
  if (evaluation.type === "mate") return `M${Math.abs(evaluation.value)}`;

  const pawns = evaluation.value / 100;
  return `${pawns > 0 ? "+" : ""}${pawns.toFixed(1)}`;
}

export default function EvaluationBar({ fen, flipped = false }: EvaluationBarProps) {
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const latestFenRef = useRef<string>(fen);
  const workerRef = useRef<Worker | null>(null);

  const whitePercent = getWhitePercent(evaluation);
  const blackPercent = 100 - whitePercent;

  // Initialize worker once
  useEffect(() => {
    const worker = new Worker(
      "/stockfish/stockfish-18-lite-single.js",
    );

    worker.onmessage = (event: MessageEvent<string>) => {
      const line = event.data;
      const latestSideToMove =
        latestFenRef.current.split(" ")[1] === "b" ? "b" : "w";
      const parsedEvaluation = parseStockfishEvaluation(line, latestSideToMove);

      if (parsedEvaluation) {
        setEvaluation(parsedEvaluation);
      }
    };

    worker.postMessage("uci");
    worker.postMessage("isready");
    workerRef.current = worker;

    return () => {
      worker.postMessage("quit");
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  // Update position when FEN changes
  useEffect(() => {
    latestFenRef.current = fen;
    
    if (workerRef.current) {
      workerRef.current.postMessage(`position fen ${fen}`);
      workerRef.current.postMessage("go depth 18");
    }
  }, [fen]);

  return (
    <div
      className="evaluation-bar"
      aria-label="Avaliação Stockfish"
      style={{ flexDirection: flipped ? "column-reverse" : "column" }}
    >
      <div
        className="evaluation-black"
        style={{ height: `${blackPercent}%`, transition: "height 0.2s ease" }}
      />
      <div
        className="evaluation-white"
        style={{ height: `${whitePercent}%`, transition: "height 0.2s ease" }}
      />
    </div>
  );
}
