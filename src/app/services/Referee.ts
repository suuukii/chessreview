import { PieceType, TeamType, Piece, Position } from "./Constants";

import { getPossiblePawnMoves, pawnMove } from "./pieces/Pawn";
import { getPossibleBishopMoves, bishopMove } from "./pieces/Bishop";
import { knightMove, getPossibleKnightMoves } from "./pieces/Knight";
import { rookMove, getPossibleRookMoves } from "./pieces/Rook";
import { queenMove, getPossibleQueenMoves } from "./pieces/Queen";
import { kingMove, getPossibleKingMoves } from "./pieces/King";

export default class Referee {
  isEnPassantMove(
    initialPosition: Position,
    desiredPosition: Position,
    boardState: Piece[],
    type: PieceType,
    team: TeamType,
  ): boolean {
    const pawnDirection = team === TeamType.OUR ? 1 : -1;

    if (type === PieceType.PAWN) {
      if (
        (desiredPosition.x - initialPosition.x === -1 ||
          desiredPosition.x - initialPosition.x === 1) &&
        desiredPosition.y - initialPosition.y === pawnDirection
      ) {
        const piece = boardState.find(
          (p) =>
            p.position.x === desiredPosition.x &&
            p.position.y === desiredPosition.y - pawnDirection &&
            p.enPassant,
        );
        if (piece) {
          return true;
        }
      }
    }
    return false;
  }

  //TODO
  //Pawn promotion
  //prevent the king to move on attacked squares
  //add castling
  //add check and checkmate
  //add stalemate
  //add 50 move rule

  isValidMove(
    initialPosition: Position,
    desiredPosition: Position,
    type: PieceType,
    team: TeamType,
    boardState: Piece[],
  ): boolean {
    let validMove = false;

    switch (type) {
      case PieceType.PAWN:
        validMove = pawnMove(
          initialPosition,
          desiredPosition,
          team,
          boardState,
        );
        break;
      case PieceType.BISHOP:
        validMove = bishopMove(
          initialPosition,
          desiredPosition,
          team,
          boardState,
        );
        break;
      case PieceType.KNIGHT:
        validMove = knightMove(
          initialPosition,
          desiredPosition,
          team,
          boardState,
        );
        break;
      case PieceType.ROOK:
        validMove = rookMove(
          initialPosition,
          desiredPosition,
          team,
          boardState,
        );
        break;
      case PieceType.QUEEN:
        validMove = queenMove(
          initialPosition,
          desiredPosition,
          team,
          boardState,
        );
        break;
      case PieceType.KING:
        validMove = kingMove(
          initialPosition,
          desiredPosition,
          team,
          boardState,
        );
    }
    return validMove;
  }

  getValidMove(piece: Piece, boardState: Piece[]): Position[] {
    switch (piece.type) {
      case PieceType.PAWN:
        return getPossiblePawnMoves(piece, boardState);
      case PieceType.KNIGHT:
        return getPossibleKnightMoves(piece, boardState);        
      case PieceType.BISHOP:
        return getPossibleBishopMoves(piece, boardState);
      case PieceType.ROOK:
        return getPossibleRookMoves(piece, boardState);
      case PieceType.QUEEN:
        return getPossibleQueenMoves(piece, boardState);
      case PieceType.KING:
        return getPossibleKingMoves(piece, boardState);
      default:
        return [];
    }
  }
}
