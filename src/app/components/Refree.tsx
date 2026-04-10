"use client";
 
import { useState } from "react";
import {
  GRID_SIZE,
  initialBoardState,
  isSamePosition,
  Piece,
  PieceType,
  playSound,
  Position,
  TeamType,
} from "../services/Constants";
 
import Board from "./Board";
import { getPossiblePawnMoves, pawnMove } from "../services/pieces/Pawn";
import { getPossibleKnightMoves, knightMove } from "../services/pieces/Knight";
import { bishopMove, getPossibleBishopMoves } from "../services/pieces/Bishop";
import { getPossibleRookMoves, rookMove } from "../services/pieces/Rook";
import { getPossibleQueenMoves, queenMove } from "../services/pieces/Queen";
import { getPossibleKingMoves, kingMove } from "../services/pieces/King";
 
export default function Referee() {
  const [pieces, setPieces] = useState<Piece[]>(initialBoardState);
 
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
 
    return pieces.some(
      (p) =>
        p.position.x === desiredPosition.x &&
        p.position.y === desiredPosition.y - pawnDirection &&
        p.enPassant,
    );
  }
 
  function isValidMove(
    initialPosition: Position,
    desiredPosition: Position,
    type: PieceType,
    team: TeamType,
  ): boolean {
    switch (type) {
      case PieceType.PAWN:
        return pawnMove(initialPosition, desiredPosition, team, pieces);
      case PieceType.BISHOP:
        return bishopMove(initialPosition, desiredPosition, team, pieces);
      case PieceType.KNIGHT:
        return knightMove(initialPosition, desiredPosition, team, pieces);
      case PieceType.ROOK:
        return rookMove(initialPosition, desiredPosition, team, pieces);
      case PieceType.QUEEN:
        return queenMove(initialPosition, desiredPosition, team, pieces);
      case PieceType.KING:
        return kingMove(initialPosition, desiredPosition, team, pieces);
      default:
        return false;
    }
  }
 
  function getPossibleMoves(piece: Piece, currentPieces: Piece[]): Position[] {
    switch (piece.type) {
      case PieceType.PAWN:
        return getPossiblePawnMoves(piece, currentPieces);
      case PieceType.KNIGHT:
        return getPossibleKnightMoves(piece, currentPieces);
      case PieceType.BISHOP:
        return getPossibleBishopMoves(piece, currentPieces);
      case PieceType.ROOK:
        return getPossibleRookMoves(piece, currentPieces);
      case PieceType.QUEEN:
        return getPossibleQueenMoves(piece, currentPieces);
      case PieceType.KING:
        return getPossibleKingMoves(piece, currentPieces);
      default:
        return [];
    }
  }
 
 
  function updatePossibleMoves(): void {
    setPieces((current) =>
      current.map((p) => ({ ...p, possibleMoves: getPossibleMoves(p, current) })),
    );
  }

  function playMove(
    piece: Piece,
    destination: Position,
    onAnimationStart: (from: Position, translateX: number, translateY: number) => void,
    onPromotionNeeded: (piece: Piece) => void,
    isDragging: boolean,
  ): boolean {
    const enPassantMove = isEnPassantMove(
      piece.position,
      destination,
      piece.type,
      piece.team,
    );
    const validMove = isValidMove(
      piece.position,
      destination,
      piece.type,
      piece.team,
    );
 
    if (!enPassantMove && !validMove) return false;
 
    const pawnDirection = piece.team === TeamType.OUR ? 1 : -1;
    const from = { ...piece.position };
 
    if (!isDragging) {
      const translateX = (destination.x - from.x) * GRID_SIZE;
      const translateY = (from.y - destination.y) * GRID_SIZE;
      onAnimationStart(from, translateX, translateY);
    }
 
    setTimeout(
      () => {
        if (enPassantMove) {
          const updatedPieces = pieces.reduce((results, p) => {
            if (isSamePosition(p.position, from)) {
              results.push({ ...p, enPassant: false, position: { ...destination } });
            } else if (
              !isSamePosition(p.position, {
                x: destination.x,
                y: destination.y - pawnDirection,
              })
            ) {
              results.push(p.type === PieceType.PAWN ? { ...p, enPassant: false } : p);
            }
            return results;
          }, [] as Piece[]);
 
          setPieces(updatedPieces);
          playSound("capture.mp3");
        } else {
          const targetPiece = pieces.find((p) =>
            isSamePosition(p.position, destination),
          );
          const capture = !!targetPiece && targetPiece.team !== piece.team;
          const promotionRow = piece.team === TeamType.OUR ? 7 : 0;
 
          const updatedPieces = pieces.reduce((results, p) => {
            if (isSamePosition(p.position, from)) {
              const moved: Piece = {
                ...p,
                enPassant:
                  Math.abs(from.y - destination.y) === 2 &&
                  p.type === PieceType.PAWN,
                position: { ...destination },
              };
              if (destination.y === promotionRow && p.type === PieceType.PAWN) {
                onPromotionNeeded(moved);
              }
              results.push(moved);
            } else if (!isSamePosition(p.position, destination)) {
              results.push(p.type === PieceType.PAWN ? { ...p, enPassant: false } : p);
            }
            return results;
          }, [] as Piece[]);
 
          setPieces(updatedPieces);
 
          if (capture) playSound("capture.mp3");
          else if (piece.team === TeamType.OUR) playSound("move-self.mp3");
          else playSound("move-opponent.mp3");
        }
      },
      isDragging ? 0 : 100,
    );
 
    return true;
  }
 
  function promotePawn(promotionPawn: Piece, pieceType: string): void {
    const typeMap: Record<string, PieceType> = {
      q: PieceType.QUEEN,
      r: PieceType.ROOK,
      b: PieceType.BISHOP,
      n: PieceType.KNIGHT,
    };
    const team = promotionPawn.team === TeamType.OUR ? "w" : "b";
 
    setPieces((current) =>
      current.map((p) =>
        isSamePosition(p.position, promotionPawn.position)
          ? { ...p, type: typeMap[pieceType], image: `/imgs/pieces/${team}${pieceType}.png` }
          : p,
      ),
    );
 
    playSound("promote.mp3");
  }
 
 
  return (
    <Board
      pieces={pieces}
      updatePossibleMoves={updatePossibleMoves}
      playMove={playMove}
      promotePawn={promotePawn}
    />
  );
}


  //TODO
  //Pawn promotion
  //prevent the king to move on attacked squares
  //add castling
  //add check and checkmate
  //add stalemate
  //add 50 move rule