import { MoveResult, PieceType, TeamType } from "../services/Types";
import { Position } from "./Position";

export class Move {
    team: TeamType;
    piece: PieceType;
    moveType : MoveResult;
    fromPosition: Position;
    toPosition: Position;
    notation?: string;

    constructor(team: TeamType, piece: PieceType, moveType: MoveResult, fromPosition: Position, toPosition: Position, notation?: string){
        this.fromPosition = fromPosition;
        this.toPosition = toPosition;
        this.moveType = moveType;
        this.team = team;
        this.piece = piece;
        this.notation = notation;
    }

    clone() : Move {
        return new Move(this.team, this.piece, this.moveType,
             this.fromPosition.clone(), this.toPosition.clone(), this.notation);
    }
}