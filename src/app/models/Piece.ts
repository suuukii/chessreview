import { TeamType, PieceType } from "../services/Types";
import { Position } from "./Position";

export class Piece {
  image: string;
  position: Position;
  type: PieceType;
  team: TeamType;
  possibleMoves?: Position[];

  constructor(
    position: Position,
    type: PieceType,
    team: TeamType,
    possibleMoves: Position[] = [],
  ) {
    this.image = `/imgs/pieces/${team}${type}.png`;
    this.position = position;
    this.type = type;
    this.team = team;
    this.possibleMoves = possibleMoves;
  }

  isSamePiecePosition(piece: Piece): boolean {
    return (
      this.position.x === piece.position.x &&
      this.position.y === piece.position.y
    );
  }

  get isPawn(): boolean {
    return this.type === PieceType.PAWN;
  }

  get isBishop(): boolean {
    return this.type === PieceType.BISHOP;
  }

  get isKnight(): boolean {
    return this.type === PieceType.KNIGHT;
  }

  get isRook(): boolean {
    return this.type === PieceType.ROOK;
  }

  get isQueen(): boolean {
    return this.type === PieceType.QUEEN;
  }

  get isKing(): boolean {
    return this.type === PieceType.KING;
  }

  clone(): Piece {
    return new Piece(
      this.position.clone(),
      this.type,
      this.team,
      this.possibleMoves?.map((m) => m.clone()),
    );
  }
}
