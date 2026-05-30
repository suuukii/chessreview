"use client";

import Image from "next/image";

import { Chessboard } from "../models/Chessboard";
import {
  MoveClassification,
  MoveResult,
  PieceType,
  TeamType,
} from "../services/Types";
import MenuControls from "./MenuControls";

interface MenuProps {
  board: Chessboard;
  historyIndex: number;
  historyLength: number;
  flipped: boolean;
  onNavigateMove: (direction: -1 | 1) => void;
  onToggleBoard: () => void;
}

const whitePieces: Record<PieceType, string> = {
  [PieceType.BISHOP]: "n",
  [PieceType.KING]: "l",
  [PieceType.QUEEN]: "w",
  [PieceType.ROOK]: "t",
  [PieceType.KNIGHT]: "j",
  [PieceType.PAWN]: "",
};

const blackPieces: Record<PieceType, string> = {
  [PieceType.BISHOP]: "b",
  [PieceType.KING]: "k",
  [PieceType.QUEEN]: "q",
  [PieceType.ROOK]: "r",
  [PieceType.KNIGHT]: "h",
  [PieceType.PAWN]: "",
};

const classificationIcons: Record<MoveClassification, string> = {
  [MoveClassification.BRILLIANT]: "/svgs/classifications/brilliant.svg",
  [MoveClassification.GREAT]: "/svgs/classifications/great.svg",
  [MoveClassification.BEST]: "/svgs/classifications/best.svg",
  [MoveClassification.BOOK]: "/svgs/classifications/book.svg",
  [MoveClassification.EXCELLENT]: "/svgs/classifications/excellent.svg",
  [MoveClassification.GOOD]: "/svgs/classifications/good.svg",
  [MoveClassification.MISS]: "/svgs/classifications/miss.svg",
  [MoveClassification.INACCURACY]: "/svgs/classifications/inaccuracy.svg",
  [MoveClassification.MISTAKE]: "/svgs/classifications/mistake.svg",
  [MoveClassification.BLUNDER]: "/svgs/classifications/blunder.svg",
};

const classificationLabels: Record<MoveClassification, string> = {
  [MoveClassification.BRILLIANT]: "brilliant",
  [MoveClassification.GREAT]: "great",
  [MoveClassification.BEST]: "best",
  [MoveClassification.BOOK]: "book",
  [MoveClassification.EXCELLENT]: "excellent",
  [MoveClassification.GOOD]: "good",
  [MoveClassification.MISS]: "miss",
  [MoveClassification.INACCURACY]: "inaccuracy",
  [MoveClassification.MISTAKE]: "mistake",
  [MoveClassification.BLUNDER]: "blunder",
};

function getClassificationPhrase(classification: MoveClassification): string {
  if (classification === MoveClassification.BEST) return "is the best move";
  if (classification === MoveClassification.BOOK) return "is a book move";

  return `is a ${classificationLabels[classification]}`;
}

export default function Menu({
  board,
  historyIndex,
  historyLength,
  flipped,
  onNavigateMove,
  onToggleBoard,
}: MenuProps) {
  const currentOpening = [...board.moves]
    .reverse()
    .find((move) => move.openingName);
  const currentMove = board.moves[board.moves.length - 1];
  const currentClassification = currentMove?.classification;
  const showBestMoveText =
    currentMove?.bestMoveNotation &&
    currentMove.bestMoveNotation !== currentMove.notation &&
    currentClassification !== MoveClassification.BEST &&
    currentClassification !== MoveClassification.BOOK;

  return (
    <div className="menu">
      <p>Total Turns: {board.totalTurns - 1}</p>
      <p>
        Current Team:{" "}
        {board.currentTeam === TeamType.OPPONENT ? "Black" : "White"}
      </p>
      {currentOpening && (
        <div className="opening-name">
          {currentOpening.openingName}
        </div>
      )}
      {currentMove?.notation && currentClassification !== undefined && (
        <div
          className={`move-classification-card move-classification-card-${classificationLabels[currentClassification]}`}
        >
          <div className="move-classification-headline">
            <Image
              src={classificationIcons[currentClassification]}
              alt=""
              aria-hidden="true"
              width={28}
              height={28}
            />
            {currentMove.moveType !== MoveResult.CASTLE && (
              <span className="piece-icon">
                {currentMove.team === TeamType.OUR
                  ? whitePieces[currentMove.piece]
                  : blackPieces[currentMove.piece]}
              </span>
            )}
            <span>{currentMove.notation}</span>
            <span>{getClassificationPhrase(currentClassification)}</span>
          </div>
          {showBestMoveText && (
            <div className="move-classification-best">
              the best move was {currentMove.bestMoveNotation}
            </div>
          )}
        </div>
      )}
      <div className="move-history">
        {(() => {
          const moves = board.moves;
          const moveRows = [];
          for (let i = 0; i < moves.length; i += 2) {
            const moveNumber = Math.floor(i / 2) + 1;
            const whiteMove = moves[i];
            const blackMove = moves[i + 1];
            moveRows.push(
              <p key={moveNumber}>
                <span className="move-number">{moveNumber}.</span>
                <span className="move-text">
                  {whiteMove?.notation && (
                    <span>
                      <span className="piece-icon">
                        {whiteMove.moveType === MoveResult.CASTLE
                          ? ""
                          : whitePieces[whiteMove.piece]}
                      </span>
                      {whiteMove.notation}
                    </span>
                  )}
                </span>
                {blackMove?.notation && (
                  <span className="move-text">
                    <span className="piece-icon">
                      {blackMove.moveType === MoveResult.CASTLE
                        ? ""
                        : blackPieces[blackMove.piece]}
                    </span>
                    {blackMove.notation}
                  </span>
                )}
              </p>,
            );
          }
          return moveRows;
        })()}
      </div>
      <MenuControls
        historyIndex={historyIndex}
        historyLength={historyLength}
        flipped={flipped}
        layout="inline"
        onNavigateMove={onNavigateMove}
        onToggleBoard={onToggleBoard}
      />
    </div>
  );
}
