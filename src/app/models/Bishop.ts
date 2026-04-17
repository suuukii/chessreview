import { PieceType, TeamType } from "../services/Types";
import { Piece } from "./Piece";
import { Position } from "./Position";

export class Bishop extends Piece{
    constructor(position:Position, team:TeamType){
        super(position, PieceType.BISHOP , team)
    }
}