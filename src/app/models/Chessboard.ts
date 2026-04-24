import { getPossibleBishopMoves } from "../services/pieces/BishopRules";
import { getCastlingMoves, getPossibleKingMoves } from "../services/pieces/KingRules";
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
  totalTurns: number;

  constructor(pieces: Piece[], totalTurns: number) {
    this.pieces = pieces;
    this.totalTurns = totalTurns;
  }

  get currentTeam(): TeamType{
    return this.totalTurns % 2 === 0 ? TeamType.OPPONENT : TeamType.OUR
  }

  clone(): Chessboard {
    return new Chessboard(
      this.pieces.map((p) => p.clone()),
      this.totalTurns,
    );
  }

  getValidMove(piece: Piece, boardState: Piece[]): Position[] {
    switch (piece.type) {
      case PieceType.PAWN:   return getPossiblePawnMoves(piece, boardState);
      case PieceType.BISHOP: return getPossibleBishopMoves(piece, boardState);
      case PieceType.ROOK:   return getPossibleRookMoves(piece, boardState);
      case PieceType.KING:   return getPossibleKingMoves(piece, boardState);
      case PieceType.KNIGHT: return getPossibleKnightMoves(piece, boardState);
      case PieceType.QUEEN:  return getPossibleQueenMoves(piece, boardState);
      default:               return [];
    }
  }

  calculateAllMoves(): void {
    for (const piece of this.pieces) {
      piece.possibleMoves = this.getValidMove(piece, this.pieces);
    }

    //catling move logic
    for(const king of this.pieces.filter(p => p.isKing)){
      if(!king.possibleMoves) continue;
      king.possibleMoves = [...king.possibleMoves,  ...getCastlingMoves(king, this.pieces)];
    }

    this.checkCurrentTeamMoves();

    for(const piece of this.pieces.filter((p) => p.team !== this.currentTeam)){
      piece.possibleMoves = [];
    }
  }

isKingInAttack(): boolean {
  const king = this.pieces.find(p => p.team === this.currentTeam && p.isKing)
  for(const piece of this.pieces){
    if(king && piece.possibleMoves){
      if(piece.team === king.team) continue;
      if(piece.possibleMoves.some(m => m.isSamePosition(king.position))){
        return true;
      }
    }
  }
  return false;
}

  checkCurrentTeamMoves(){
    for(const piece of this.pieces.filter(p => p.team === this.currentTeam)){
      if(piece.possibleMoves === undefined) continue;

      for(const move of piece.possibleMoves){
        const simulatedBoard = this.clone()
        
        simulatedBoard.pieces = simulatedBoard.pieces.filter(p => !p.isSamePosition(move))

        const simulatedPiece = simulatedBoard.pieces.find(p => p.isSamePiecePosition(piece))!
        simulatedPiece.position = move.clone()
        const simulatedKing = simulatedBoard.pieces.find(p => p.team === simulatedBoard.currentTeam && p.isKing)!

        for(const enemy of simulatedBoard.pieces.filter(p => p.team !== simulatedBoard.currentTeam)){
          enemy.possibleMoves = simulatedBoard.getValidMove(enemy, simulatedBoard.pieces)

          if(enemy.isPawn){
            if(enemy.possibleMoves.some(m => m.x !== enemy.position.x && m.isSamePosition(simulatedKing.position))){
              piece.possibleMoves = piece.possibleMoves?.filter(m => !m.isSamePosition(move))
            }
          } else {
            if(enemy.possibleMoves.some(m => m.isSamePosition(simulatedKing.position))){
              piece.possibleMoves = piece.possibleMoves?.filter(m => !m.isSamePosition(move))
            }
          }
        }
      }
    }
  }

  promotePawn(piece: Piece, type: PieceType): void {
    this.pieces = this.pieces.map((p) => {
      if (!p.position.isSamePosition(piece.position)) return p;
      const promoted = new Piece(p.position, type, p.team, true);
      promoted.possibleMoves = [];
      return promoted;
    });
  }

playMove(
  enPassantMove: boolean,
  isValidMove: boolean,
  playedPiece: Piece,
  destination: Position,
): MoveResult {
  if (!enPassantMove && !isValidMove) return MoveResult.INVALID;
  
  if(playedPiece.isKing && Math.abs(destination.x - playedPiece.position.x) > 1){
    
    const rook = destination.x > playedPiece.position.x ? 
      this.pieces.find(p => p.isSamePosition(new Position(7,playedPiece.position.y))) : 
        this.pieces.find(p => p.isSamePosition(new Position(0,playedPiece.position.y)))
    
    const direction = destination.x > playedPiece.position.x ? 1 : -1;

    this.pieces.map(p => {
      if(p.isSamePiecePosition(playedPiece)){
        p.position = destination;
        p.hasMoved = true;
      }

      if(p.isSamePiecePosition(rook!)){
        p.position.x = destination.x - direction;
        p.hasMoved = true;
      }
      return p;
      })
      this.totalTurns++;
      return MoveResult.CASTLE
  }

  const from = playedPiece.position;

  const targetPiece = this.pieces.find((p) => p.position.isSamePosition(destination));
  const isCapture = !!targetPiece && targetPiece.team !== playedPiece.team;

  this.pieces = this.pieces.reduce((results, p) => {
    if (p.position.isSamePosition(from)) {
      results.push(new Piece(destination, p.type, p.team, true));
    } else if (!p.position.isSamePosition(destination)) {
      results.push(p);
    }
    return results;
  }, [] as Piece[]);


  this.totalTurns++; 

  for (const piece of this.pieces) {
    piece.possibleMoves = this.getValidMove(piece, this.pieces);
  }


  if (this.isKingInAttack()) return MoveResult.CHECK;
  if (isCapture || enPassantMove) return MoveResult.CAPTURE;
  return MoveResult.MOVE;
}

  private updateEnPassantStatus(
    movedPiece: Piece | null,
    from: Position,
    destination: Position,
  ): void {
    this.pieces.forEach((p) => {
      if (!p.isPawn) return;
      if (p === movedPiece) {
        (p as Pawn).enPassant = Math.abs(from.y - destination.y) === 2;
      } else {
        (p as Pawn).enPassant = false;
      }
    });
  }
}
