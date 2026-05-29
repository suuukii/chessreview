"use client";

import { Chessboard } from "../models/Chessboard";
import { MoveResult, PieceType, TeamType } from "../services/Types";
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

export default function Menu({
  board,
  historyIndex,
  historyLength,
  flipped,
  onNavigateMove,
  onToggleBoard,
}: MenuProps) {
  return (
    <div className="menu">
      <p>Total Turns: {board.totalTurns - 1}</p>
      <p>
        Current Team:{" "}
        {board.currentTeam === TeamType.OPPONENT ? "Black" : "White"}
      </p>
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
