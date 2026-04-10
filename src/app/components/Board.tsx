"use client";

import "../styles/board.css";
import Tile from "./Tile";
import PawnPromotionBox from "./PawnPromotionBox";
import { useRef, useState } from "react";

import {
  VERTICAL_AXIS,
  HORIZONTAL_AXIS,
  Piece,
  Position,
  GRID_SIZE,
  isSamePosition,
  TeamType,
} from "../services/Constants";

interface Props {
  pieces: Piece[];
  updatePossibleMoves: () => void;
  playMove: (
    piece: Piece,
    destination: Position,
    onAnimationStart: (from: Position, translateX: number, translateY: number) => void,
    onPromotionNeeded: (piece: Piece) => void,
    isDragging: boolean,
  ) => boolean;
  promotePawn: (promotionPawn: Piece, pieceType: string) => void;
}

export default function Board({ pieces, updatePossibleMoves, playMove, promotePawn }: Props) {
  const [activePiece, setActivePiece]       = useState<HTMLElement | null>(null);
  const [grabPosition, setGrabPosition]     = useState<Position>({ x: -1, y: -1 });
  const [selectedPiece, setSelectedPiece]   = useState<Piece | null>(null);
  const [promotionPawn, setPromotionPawn]   = useState<Piece | null>(null);
  const [hoverPosition, setHoverPosition]   = useState<Position | null>(null);
  const [lastMove, setLastMove]             = useState<{ from: Position; to: Position } | null>(null);
  const [animatingPosition, setAnimatingPosition] = useState<{
    from: Position;
    translateX: number;
    translateY: number;
  } | null>(null);

  const chessBoardRef    = useRef<HTMLDivElement>(null);
  const selectedPieceRef = useRef<Piece | null>(null);
  const grabPositionRef  = useRef<Position>({ x: -1, y: -1 });

  function updateSelectedPiece(piece: Piece | null | undefined) {
    selectedPieceRef.current = piece ?? null;
    setSelectedPiece(piece ?? null);
  }

  function resetActivePiece() {
    if (activePiece) {
      activePiece.style.position = "relative";
      activePiece.style.removeProperty("top");
      activePiece.style.removeProperty("left");
    }
    setActivePiece(null);
    setHoverPosition(null);
  }

  function getBoardCoords(clientX: number, clientY: number): Position {
    const chessBoard = chessBoardRef.current!;
    return {
      x: Math.floor((clientX - chessBoard.offsetLeft) / GRID_SIZE),
      y: Math.abs(Math.ceil((clientY - chessBoard.offsetTop - 800) / GRID_SIZE)),
    };
  }

  function handleAnimationStart(from: Position, translateX: number, translateY: number) {
    setAnimatingPosition({ from, translateX, translateY });
    setTimeout(() => setAnimatingPosition(null), 100);
  }

  function handlePromotionNeeded(piece: Piece) {
    setPromotionPawn(piece);
  }

  function grabPiece(e: React.MouseEvent): void {
    if (promotionPawn) return;

    updatePossibleMoves();

    const element = e.target as HTMLElement;
    const chessBoard = chessBoardRef.current;
    if (!element.classList.contains("chess-piece") || !chessBoard) return;

    const pos = getBoardCoords(e.clientX, e.clientY);
    grabPositionRef.current = pos;
    setGrabPosition(pos);

    const clickedPiece = pieces.find((p) => isSamePosition(p.position, pos));

    // Clicking a friendly piece while another is selected → switch selection
    if (selectedPiece && clickedPiece?.team === selectedPiece.team) {
      updateSelectedPiece(clickedPiece);
      return;
    }

    updateSelectedPiece(clickedPiece);

    element.style.position = "absolute";
    element.style.left = `${e.clientX - GRID_SIZE / 2}px`;
    element.style.top  = `${e.clientY - GRID_SIZE / 2}px`;
    setActivePiece(element);
  }

  function movePiece(e: React.MouseEvent): void {
    const chessBoard = chessBoardRef.current;
    if (!activePiece || !chessBoard) return;

    const minX = chessBoard.offsetLeft - 50;
    const minY = chessBoard.offsetTop  - 50;
    const maxX = chessBoard.offsetLeft + chessBoard.clientWidth  - 50;
    const maxY = chessBoard.offsetTop  + chessBoard.clientHeight - 50;

    const x = Math.min(Math.max(e.clientX - 50, minX), maxX);
    const y = Math.min(Math.max(e.clientY - 50, minY), maxY);

    activePiece.style.position = "absolute";
    activePiece.style.left = `${x}px`;
    activePiece.style.top  = `${y}px`;

    setHoverPosition(getBoardCoords(e.clientX, e.clientY));
  }

  function dropPiece(e: React.MouseEvent): void {
    if (promotionPawn) return;
    if (!chessBoardRef.current) return;

    const dest = getBoardCoords(e.clientX, e.clientY);

    if (!activePiece && selectedPiece) {
      const clickedPiece = pieces.find((p) => isSamePosition(p.position, dest));
      if (clickedPiece?.team === selectedPiece.team) return; // clicked own piece — ignore
      executeMove(selectedPiece, dest);
      return;
    }

    if (!activePiece) return;

    if (isSamePosition(grabPosition, dest)) {
      resetActivePiece();
      updateSelectedPiece(pieces.find((p) => isSamePosition(p.position, grabPosition)));
      return;
    }

    const currentPiece = pieces.find((p) => isSamePosition(p.position, grabPosition));
    if (currentPiece) {
      executeMove(currentPiece, dest);
    } else {
      resetActivePiece();
    }

    setActivePiece(null);
    setHoverPosition(null);
  }

  function executeMove(piece: Piece, dest: Position): void {
    const isDragging = !!activePiece;

    const moved = playMove(
      piece,
      dest,
      handleAnimationStart,
      handlePromotionNeeded,
      isDragging,
    );

    if (moved) {
      setLastMove({ from: { ...grabPositionRef.current }, to: dest });
    } else if (activePiece) {
      resetActivePiece();
    }

    updateSelectedPiece(null);
    grabPositionRef.current = { x: -1, y: -1 };
  }

  const chessBoard = chessBoardRef.current;

  const promotionBoxLeft = promotionPawn
    ? (chessBoard?.offsetLeft ?? 0) + promotionPawn.position.x * GRID_SIZE
    : 0;
  const promotionBoxTop = promotionPawn?.team === TeamType.OUR
    ? (chessBoard?.offsetTop ?? 0)
    : (chessBoard?.offsetTop ?? 0) + 7 * GRID_SIZE;

  function handlePromote(pieceType: string): void {
    if (!promotionPawn) return;
    promotePawn(promotionPawn, pieceType);
    setPromotionPawn(null);
  }

  const board = [];

  for (let i = VERTICAL_AXIS.length - 1; i >= 0; i--) {
    for (let j = 0; j < HORIZONTAL_AXIS.length; j++) {
      const piece       = pieces.find((p) => isSamePosition(p.position, { x: j, y: i }));
      const grabPiece_  = pieces.find((p) => isSamePosition(p.position, grabPosition));
      const hint        = grabPiece_?.possibleMoves?.some((p) => isSamePosition(p, { x: j, y: i })) ?? false;
      const isAnimating = animatingPosition ? isSamePosition(animatingPosition.from, { x: j, y: i }) : false;

      board.push(
        <Tile
          key={HORIZONTAL_AXIS[j] + VERTICAL_AXIS[i]}
          number={j + i + 2}
          image={piece?.image}
          hint={hint}
          translateX={isAnimating ? animatingPosition!.translateX : 0}
          translateY={isAnimating ? animatingPosition!.translateY : 0}
          hovered={!!hoverPosition && !!activePiece && isSamePosition(hoverPosition, { x: j, y: i })}
          selected={!!selectedPieceRef.current && isSamePosition({ x: j, y: i }, grabPositionRef.current)}
          lastMoveFrom={!!lastMove && isSamePosition({ x: j, y: i }, lastMove.from)}
          lastMoveTo={!!lastMove && isSamePosition({ x: j, y: i }, lastMove.to)}
        />,
      );
    }
  }

  return (
    <>
      <PawnPromotionBox
        promotionPawn={promotionPawn}
        promotionBoxLeft={promotionBoxLeft}
        promotionBoxTop={promotionBoxTop}
        onPromote={handlePromote}
      />
      <div
        className="board"
        ref={chessBoardRef}
        onMouseDown={grabPiece}
        onMouseMove={movePiece}
        onMouseUp={dropPiece}
      >
        {board}
      </div>
    </>
  );
}