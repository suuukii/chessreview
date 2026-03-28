import { Position, TeamType, Piece } from "../Constants"
import { isTileEmptyOrOccupiedByOpponent } from "../Rules"

export function  knightMove(
    initialPosition : Position,
    desiredPosition : Position,
    team: TeamType,
    boardState: Piece[],
  ):boolean{
    //MOVMENT AND ATTACK LOGIC
      for (let i:number = -1; i < 2 ; i += 2){
        for (let j:number = -1; j < 2 ; j += 2){
          if(desiredPosition.y - initialPosition.y === 2*i){
            if (desiredPosition.x - initialPosition.x === j){
              if(isTileEmptyOrOccupiedByOpponent(desiredPosition,boardState,team)){
                return true;
              }
            }
          }
          
          if(desiredPosition.x - initialPosition.x === 2*i){
            if (desiredPosition.y - initialPosition.y === j){
              if(isTileEmptyOrOccupiedByOpponent(desiredPosition,boardState,team)){
                return true;
              }
            }
          }
        }
      }
      return false;
  }