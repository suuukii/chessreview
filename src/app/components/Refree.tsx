"use client";

import { useState } from "react";
import { Piece } from "../models/Piece";
import { Position } from "../models/Position";
import { TeamType, PieceType, MoveResult } from "../services/Types";
import { initialBoard, playSound, GRID_SIZE } from "../services/Constants";

import Board from "./Board";
import { pawnMove } from "../services/pieces/PawnRules";
import { knightMove } from "../services/pieces/KnightRules";
import { bishopMove } from "../services/pieces/BishopRules";
import { rookMove } from "../services/pieces/RookRules";
import { queenMove } from "../services/pieces/QueenRules";
import { kingMove } from "../services/pieces/KingRules";
import { Chessboard } from "../models/Chessboard";
import { Pawn } from "../models/Pawn";

export default function Referee() {
  const [board, setBoard] = useState<Chessboard>(initialBoard);

  function isEnPassantMove(
    initialPosition: Position,
    desiredPosition: Position,
    type: PieceType,
    team: TeamType,
  ): boolean {
    const pawnDirection = team === TeamType.OUR ? 1 : -1;
    if (type !== PieceType.PAWN) return false;

    const isDiagonal =
      Math.abs(desiredPosition.x - initialPosition.x) === 1 &&
      desiredPosition.y - initialPosition.y === pawnDirection;

    if (!isDiagonal) return false;

    return board.pieces.some(
      (p) =>
        p.position.x === desiredPosition.x &&
        p.position.y === desiredPosition.y - pawnDirection &&
        (p as Pawn).enPassant,
    );
  }

  function isValidMove(
    initialPosition: Position,
    desiredPosition: Position,
    type: PieceType,
    team: TeamType,
  ): boolean {
    switch (type) {
      case PieceType.PAWN: return pawnMove(initialPosition, desiredPosition, team, board.pieces);
      case PieceType.BISHOP: return bishopMove(initialPosition, desiredPosition, team, board.pieces);
      case PieceType.KNIGHT: return knightMove(initialPosition, desiredPosition, team, board.pieces);
      case PieceType.ROOK: return rookMove(initialPosition, desiredPosition, team, board.pieces);
      case PieceType.QUEEN: return queenMove(initialPosition, desiredPosition, team, board.pieces);
      case PieceType.KING: return kingMove(initialPosition, desiredPosition, team, board.pieces);
      default: return false;
    }
  }

  function playMove(
    piece: Piece,
    destination: Position,
    onAnimationStart: (from: Position, tx: number, ty: number) => void,
    onPromotionNeeded: (piece: Piece) => void,
    isDragging: boolean,
  ): boolean {
    const enPassant = isEnPassantMove(piece.position, destination, piece.type, piece.team);
    const valid = isValidMove(piece.position, destination, piece.type, piece.team);

    if (!enPassant && !valid) return false;

    if (!isDragging) {
      const translateX = (destination.x - piece.position.x) * GRID_SIZE;
      const translateY = (piece.position.y - destination.y) * GRID_SIZE;
      onAnimationStart(piece.position, translateX, translateY);
    }

    setTimeout(() => {
      const newBoard = new Chessboard([...board.pieces]);
      const result = newBoard.playMove(enPassant, valid, piece, destination);

      if (result !== MoveResult.INVALID) {
        switch (result) {
          case MoveResult.CAPTURE:
          case MoveResult.EN_PASSANT:
            playSound("capture.mp3");
            break;
          case MoveResult.MOVE:
            if (piece.team === TeamType.OUR) playSound("move-self.mp3");
            else playSound("move-opponent.mp3");
            break;
        }

        const promotionRow = piece.team === TeamType.OUR ? 7 : 0;
        if (piece.type === PieceType.PAWN && destination.y === promotionRow) {
          const pieceAtDestination = newBoard.pieces.find(p => p.position.isSamePosition(destination));
          if (pieceAtDestination) {
            onPromotionNeeded(pieceAtDestination);
          }
        }
        setBoard(newBoard);
      }
    }, isDragging ? 0 : 200);

    return true;
  }

  function promotePawn(promotionPawn: Piece, pieceType: string): void {
    const typeMap: Record<string, PieceType> = {
      q: PieceType.QUEEN,
      r: PieceType.ROOK,
      b: PieceType.BISHOP,
      n: PieceType.KNIGHT,
    };

    const selectedType = typeMap[pieceType.toLowerCase()];
    if (selectedType !== undefined) {
      const newBoard = new Chessboard([...board.pieces]);
      newBoard.promotePawn(promotionPawn, selectedType);
      playSound("promote.mp3");
      setBoard(newBoard);
    }
  }

  return (
    <Board
      pieces={board.pieces}
      updatePossibleMoves={() => board.calculateAllMoves()}
      playMove={playMove}
      promotePawn={promotePawn}
    />
  );
}