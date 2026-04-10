import { Position, TeamType, Piece, isSamePosition} from "../Constants"
import {isTileEmptyOrOccupiedByOpponent, isTileOccupied, isTileOccupiedByOpponent} from "../Rules"

export function kingMove(
    initialPosition : Position,
    desiredPosition : Position,
    team: TeamType,
    boardState: Piece[],
  ):boolean{
    const multiplierY  = (desiredPosition.y < initialPosition.y)?  -1 : (desiredPosition.y > initialPosition.y)? 1 : 0;
    const multiplierX = (desiredPosition.x < initialPosition.x)? -1 : (desiredPosition.x > initialPosition.x)? 1 : 0;

    for(let i: number = 1; i < 2; i++){
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

  export function getPossibleKingMoves(king: Piece, boardState: Piece[]): Position[]{
    const possibleMoves: Position[] = [];

    for (let i: number = 1; i < 2; i++) {
          const destination: Position = {x: king.position.x, y: king.position.y + i};
          if(!isTileOccupied(destination, boardState)){
              possibleMoves.push(destination);
          } else if(isTileOccupiedByOpponent(destination, boardState, king.team)){ 
            possibleMoves.push(destination);
            break;
          } else {
            break;
          }
        }
      
        //bottom movement
        for (let i: number = 1; i < 2; i++) {
          const destination: Position = {x: king.position.x, y: king.position.y - i};
          if(!isTileOccupied(destination, boardState)){
              possibleMoves.push(destination);
          } else if(isTileOccupiedByOpponent(destination, boardState, king.team)){ 
            possibleMoves.push(destination);
            break;
          } else {
            break;
          }
        }
      
        //left movement
        for (let i: number = 1; i < 2; i++) {
          const destination: Position = {x: king.position.x - i, y: king.position.y};
          if(!isTileOccupied(destination, boardState)){
              possibleMoves.push(destination);
          } else if(isTileOccupiedByOpponent(destination, boardState, king.team)){ 
            possibleMoves.push(destination);
            break;
          } else {
            break;
          }
        }
          
          //right movement
        for (let i: number = 1; i < 2; i++) {
          const destination: Position = {x: king.position.x + i, y: king.position.y};
          if(!isTileOccupied(destination, boardState)){
              possibleMoves.push(destination);
          } else if(isTileOccupiedByOpponent(destination, boardState, king.team)){ 
            possibleMoves.push(destination);
            break;
          } else {
            break;
          }
        }
    
        //Upper Right Movement 
          for (let i: number = 1; i < 2; i++) {
            const destination: Position = {x:king.position.x + i, y:king.position.y + i};
            if(!isTileOccupied(destination, boardState)){
              possibleMoves.push(destination);
            } else if(isTileOccupiedByOpponent(destination, boardState,king.team)){
                possibleMoves.push(destination);
                break;
            } else {
              break;
            }
          }
          //bottom right
          for (let i: number = 1; i < 2; i++) {
            const destination: Position = {x:king.position.x + i, y:king.position.y - i};
            if(!isTileOccupied(destination, boardState)){
              possibleMoves.push(destination);
            } else if(isTileOccupiedByOpponent(destination, boardState,king.team)){
                possibleMoves.push(destination);
                break;
            } else {
              break;
            }
          }
          //up left
          for (let i: number = 1; i < 2; i++) {
            const destination: Position = {x:king.position.x - i, y:king.position.y + i};
            if(!isTileOccupied(destination, boardState)){
              possibleMoves.push(destination);
            } else if(isTileOccupiedByOpponent(destination, boardState,king.team)){
                possibleMoves.push(destination);
                break;
            } else {
              break;
            }
          }
          //bottom left
          for (let i: number = 1; i < 2; i++) {
            const destination: Position = {x:king.position.x - i, y:king.position.y - i};
            if(!isTileOccupied(destination, boardState)){
              possibleMoves.push(destination);
            } else if(isTileOccupiedByOpponent(destination, boardState,king.team)){
                possibleMoves.push(destination);
                break;
            } else {
              break;
            }
          }
    
    return possibleMoves;
  }