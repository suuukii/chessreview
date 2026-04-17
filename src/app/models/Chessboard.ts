import { getPossibleBishopMoves } from "../services/pieces/BishopRules";
import { getPossibleKingMoves } from "../services/pieces/KingRules";
import { getPossibleKnightMoves } from "../services/pieces/KnightRules";
import { getPossiblePawnMoves } from "../services/pieces/PawnRules";
import { getPossibleQueenMoves } from "../services/pieces/QueenRules";
import { getPossibleRookMoves } from "../services/pieces/RookRules";
import { MoveResult, PieceType, TeamType } from "../services/Types";
import { Pawn } from "./Pawn";
import { Piece } from "./Piece";
import { Position } from "./Position";

export class Chessboard {
  pieces: Piece[];

  constructor(pieces: Piece[]) {
    this.pieces = pieces;
  }

  private updateEnPassantStatus(
    movedPiece: Piece | null,
    from: Position,
    destination: Position,
  ) {
    this.pieces.forEach((p) => {
      if (p.isPawn) {
        if (p === movedPiece) {
          (p as Pawn).enPassant = Math.abs(from.y - destination.y) === 2;
        } else {
          (p as Pawn).enPassant = false;
        }
      }
    });
  }

  calculateAllMoves(): void {
    for (const piece of this.pieces) {
      piece.possibleMoves = this.getValidMove(piece, this.pieces);
    }
  }

  getValidMove(piece: Piece, boardState: Piece[]): Position[]{
    switch (piece.type){
      case PieceType.PAWN: return getPossiblePawnMoves(piece, boardState)
      case PieceType.BISHOP: return getPossibleBishopMoves(piece, boardState)
      case PieceType.ROOK: return getPossibleRookMoves(piece, boardState)
      case PieceType.KING: return getPossibleKingMoves(piece, boardState)
      case PieceType.KNIGHT: return getPossibleKnightMoves(piece, boardState)
      case PieceType.QUEEN: return getPossibleQueenMoves(piece, boardState)
    }
    return []
  }

  promotePawn(piece: Piece, type: PieceType): void {
    this.pieces = this.pieces.map((p) => {
      if (p.position.x === piece.position.x && p.position.y === piece.position.y) {
        const promotedPiece = new Piece(p.position, type, p.team);
        promotedPiece.possibleMoves = [];
        return promotedPiece;
      }
      return p;
    });
  }

  playMove(
    enPassantMove: boolean,
    isValidMove: boolean,
    playedPiece: Piece,
    destination: Position
  ): MoveResult {
    const from = playedPiece.position;
    const pawnDirection = playedPiece.team === TeamType.OUR ? 1 : -1;

    if (!enPassantMove && !isValidMove) return MoveResult.INVALID;

    if (enPassantMove) {
      this.pieces = this.pieces.reduce((results, p) => {
        if (p.position.isSamePosition(from)) {
          results.push(new Piece(destination, p.type, p.team));
        } else if (!p.position.isSamePosition(new Position(destination.x, destination.y - pawnDirection))) {
          results.push(p);
        }
        return results;
      }, [] as Piece[]);
      
      this.updateEnPassantStatus(null, from, destination);
      return MoveResult.EN_PASSANT;
    }

    const targetPiece = this.pieces.find((p) => p.position.isSamePosition(destination));
    const isCapture = !!targetPiece && targetPiece.team !== playedPiece.team;

    this.pieces = this.pieces.reduce((results, p) => {
      if (p.position.isSamePosition(from)) {
        results.push(new Piece(destination, p.type, p.team));
      } else if (!p.position.isSamePosition(destination)) {
        results.push(p);
      }
      return results;
    }, [] as Piece[]);

    const movedPiece = this.pieces.find(p => p.position.isSamePosition(destination)) || null;
    this.updateEnPassantStatus(movedPiece, from, destination);

    return isCapture ? MoveResult.CAPTURE : MoveResult.MOVE;
  }

  copy(): Chessboard{
    const clonedPieces = this.pieces.map((p) => p.clone())
    return new Chessboard(clonedPieces)
  }
}