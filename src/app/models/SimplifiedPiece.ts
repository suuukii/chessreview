import { PieceType, TeamType } from "../services/Types";
import { Piece } from "./Piece";
import { Position } from "./Position";

export class SimplifiedPiece {
    position: Position;
    type: PieceType;      
    team: TeamType;
    possibleMoves?: Position[];
    
    constructor (piece: Piece){
        this.position = piece.position.clone();
        this.type = piece.type;
        this.team = piece.team;
        this.possibleMoves = piece.possibleMoves?.map(pm => pm.clone());
    }
}