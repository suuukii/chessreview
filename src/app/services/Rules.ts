import { PieceType, TeamType, Piece } from "../components/Board";

export default class Rules{

    isTileOccupied(x:number, y:number, boardState: Piece[]): boolean{
        console.log("checking if tile is occupied...")
        const piece = boardState.find(p => p.horizontalAxis === x && p.verticalAxis === y)
        if (piece){
            return true;
        }
        return false;
    }

    isValidMove(px:number, py:number, x:number, y:number, type:PieceType, team: TeamType, boardState: Piece[]): boolean{
        console.log("refree is checking the move...")
        console.log(`Previous Location(${px},${py}) | Atempt position(${x},${y}) | PieceType(${type}) | TeamType(${team})`)

        //PAWN
        if(type === PieceType.PAWN){
            const specialRow = (team === TeamType.OUR) ? 1 : 6
            const pawnDirection = (team === TeamType.OUR) ? 1 : -1

            if(px === x && py === specialRow && y - py === 2*pawnDirection){
                if(!this.isTileOccupied(x,y, boardState) && !this.isTileOccupied(x,y - pawnDirection, boardState)){
                    return true;
                }
            } else if(px === x && y - py === pawnDirection) {
                if(!this.isTileOccupied(x,y,boardState)){
                    return true;
                }
            }
        }

        //ROOK
        return false;
    }
}