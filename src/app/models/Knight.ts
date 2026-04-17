import { PieceType, TeamType } from "../services/Types";
import { Piece } from "./Piece";
import { Position } from "./Position";

export class Knight extends Piece {
    constructor(position: Position, team: TeamType){
        super(position, PieceType.KNIGHT, team)
    }
}