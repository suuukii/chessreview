import {Position, TeamType, Piece, isSamePosition} from "../Constants"
import {isTileEmptyOrOccupiedByOpponent, isTileOccupied} from "../Rules"


export function queenMove(
    initialPosition : Position,
    desiredPosition : Position,
    team: TeamType,
    boardState: Piece[],
  ):boolean{
    const multiplierY  = (desiredPosition.y < initialPosition.y)?  -1 : (desiredPosition.y > initialPosition.y)? 1 : 0;
    const multiplierX = (desiredPosition.x < initialPosition.x)? -1 : (desiredPosition.x > initialPosition.x)? 1 : 0;

    for(let i: number = 1; i < 8; i++){
      const passedPosition: Position = {x: initialPosition.x + (i * multiplierX), y: initialPosition.y + (i * multiplierY)}
      
      if(isSamePosition(passedPosition, desiredPosition)){
        if(isTileEmptyOrOccupiedByOpponent(passedPosition, boardState, team)){
          return true;
        }
      } else {
        if(isTileOccupied(passedPosition, boardState)){
          break;
        }
      }  
    }
    return false;
  }