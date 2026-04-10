import { Position, TeamType, Piece, isSamePosition } from "../Constants";
import { isTileEmptyOrOccupiedByOpponent, isTileOccupied, isTileOccupiedByOpponent } from "../Rules";

export function rookMove(
  initialPosition: Position,
  desiredPosition: Position,
  team: TeamType,
  boardState: Piece[],
): boolean {
  const multiplierX = desiredPosition.x < initialPosition.x ? -1 : 1;
  const multiplierY = desiredPosition.y < initialPosition.y ? -1 : 1;

  for (let i: number = 1; i < 8; i++) {
    //vertical
    if (initialPosition.x === desiredPosition.x) {
      const passedPosition: Position = {
        x: initialPosition.x,
        y: initialPosition.y + i * multiplierY,
      };
      if (isSamePosition(passedPosition, desiredPosition)) {
        if (isTileEmptyOrOccupiedByOpponent(passedPosition, boardState, team)) {
          return true;
        }
      } else {
        if (isTileOccupied(passedPosition, boardState)) {
          break;
        }
      }
    }
    //horizontal
    if (initialPosition.y === desiredPosition.y) {
      const passedPosition: Position = {
        x: initialPosition.x + i * multiplierX,
        y: initialPosition.y,
      };
      if (isSamePosition(passedPosition, desiredPosition)) {
        if (isTileEmptyOrOccupiedByOpponent(passedPosition, boardState, team)) {
          return true;
        }
      } else {
        if (isTileOccupied(passedPosition, boardState)) {
          break;
        }
      }
    }
  }
  return false;
}

export function getPossibleRookMoves(rook:Piece, boardState:Piece[]): Position[]{
  const possibleMoves: Position[] = [];

  //upper movement
  for (let i: number = 1; i < 8; i++) {
    const destination: Position = {x: rook.position.x, y: rook.position.y + i};
    if(!isTileOccupied(destination, boardState)){
        possibleMoves.push(destination);
    } else if(isTileOccupiedByOpponent(destination, boardState, rook.team)){ 
      possibleMoves.push(destination);
      break;
    } else {
      break;
    }
  }

  //bottom movement
  for (let i: number = 1; i < 8; i++) {
    const destination: Position = {x: rook.position.x, y: rook.position.y - i};
    if(!isTileOccupied(destination, boardState)){
        possibleMoves.push(destination);
    } else if(isTileOccupiedByOpponent(destination, boardState, rook.team)){ 
      possibleMoves.push(destination);
      break;
    } else {
      break;
    }
  }

  //left movement
  for (let i: number = 1; i < 8; i++) {
    const destination: Position = {x: rook.position.x - i, y: rook.position.y};
    if(!isTileOccupied(destination, boardState)){
        possibleMoves.push(destination);
    } else if(isTileOccupiedByOpponent(destination, boardState, rook.team)){ 
      possibleMoves.push(destination);
      break;
    } else {
      break;
    }
  }
    
    //right movement
  for (let i: number = 1; i < 8; i++) {
    const destination: Position = {x: rook.position.x + i, y: rook.position.y};
    if(!isTileOccupied(destination, boardState)){
        possibleMoves.push(destination);
    } else if(isTileOccupiedByOpponent(destination, boardState, rook.team)){ 
      possibleMoves.push(destination);
      break;
    } else {
      break;
    }
  }

  return possibleMoves;
}
