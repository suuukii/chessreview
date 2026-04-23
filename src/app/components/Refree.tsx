"use client";

import { useState, useRef } from "react";
import { Piece } from "../models/Piece";
import { Position } from "../models/Position";
import { TeamType, PieceType, MoveResult } from "../services/Types";
import { initialBoard, playSound, GRID_SIZE } from "../services/Constants";
import { Chessboard } from "../models/Chessboard";
import { Pawn } from "../models/Pawn";

import Board from "./Board";

export default function Referee() {
  const [board, setBoard]   = useState<Chessboard>(() => {
    const b = initialBoard.clone();
    b.calculateAllMoves();
    return b;
  });
  
  const boardRef = useRef<Chessboard>(board);

  function syncBoard(newBoard: Chessboard) {
    boardRef.current = newBoard;
    setBoard(newBoard);
  }

  function isEnPassantMove(
    initialPosition: Position,
    desiredPosition: Position,
    type: PieceType,
    team: TeamType,
  ): boolean {
    if (type !== PieceType.PAWN) return false;

    const pawnDirection = team === TeamType.OUR ? 1 : -1;
    const isDiagonal    =
      Math.abs(desiredPosition.x - initialPosition.x) === 1 &&
      desiredPosition.y - initialPosition.y === pawnDirection;

    if (!isDiagonal) return false;

    return boardRef.current.pieces.some(
      (p) =>
        p.position.x === desiredPosition.x &&
        p.position.y === desiredPosition.y - pawnDirection &&
        (p as Pawn).enPassant,
    );
  }

  function playMove(
    piece: Piece,
    destination: Position,
    onAnimationStart: (from: Position, tx: number, ty: number) => void,
    onPromotionNeeded: (piece: Piece) => void,
    isDragging: boolean,
  ): boolean {

    if(piece.team === TeamType.OUR && board.totalTurns % 2 !== 1) return false;
    if(piece.team === TeamType.OPPONENT && board.totalTurns % 2 !== 0) return false;

    if(piece.possibleMoves === undefined) return false;

    const currentBoard = boardRef.current;

    const currentPiece = currentBoard.pieces.find((p) =>
      p.position.isSamePosition(piece.position),
    );

    if (!currentPiece || !currentPiece.possibleMoves) return false;

    const enPassant = isEnPassantMove(
      currentPiece.position,
      destination,
      currentPiece.type,
      currentPiece.team,
    );

    const valid = currentPiece.possibleMoves.some((m) =>
      m.isSamePosition(destination),
    );

    if (!enPassant && !valid) return false;

    if (!isDragging) {
      const translateX = (destination.x - currentPiece.position.x) * GRID_SIZE;
      const translateY = (currentPiece.position.y - destination.y) * GRID_SIZE;
      onAnimationStart(currentPiece.position.clone(), translateX, translateY);
    }

    setTimeout(() => {
      const newBoard = boardRef.current.clone();
    
      const result   = newBoard.playMove(enPassant, valid, currentPiece, destination);
      
      if (result === MoveResult.INVALID) return;

      switch (result) {
        case MoveResult.CAPTURE:
        case MoveResult.EN_PASSANT:
          playSound("capture.mp3");
          break;
        case MoveResult.CHECK:
          playSound("move-check.mp3")
          break;
        case MoveResult.MOVE:
          playSound(
            currentPiece.team === TeamType.OUR ? "move-self.mp3" : "move-opponent.mp3",
          );
          break;
      }

      const promotionRow = currentPiece.team === TeamType.OUR ? 7 : 0;

      if (currentPiece.type === PieceType.PAWN && destination.y === promotionRow) {
        const pieceAtDestination = newBoard.pieces.find((p) =>
          p.position.isSamePosition(destination),
        );
        if (pieceAtDestination) {
          onPromotionNeeded(pieceAtDestination);
        }
      }

      newBoard.calculateAllMoves();
      syncBoard(newBoard);
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
    if (selectedType === undefined) return;

    const newBoard = boardRef.current.clone();
    newBoard.promotePawn(promotionPawn, selectedType);
    newBoard.calculateAllMoves();
    playSound("promote.mp3");
    syncBoard(newBoard);
  }

  return (<>
    <p>{board.totalTurns}</p>
    <Board
      pieces={board.pieces}
      playMove={playMove}
      promotePawn={promotePawn}
    />
  </>
  );
}