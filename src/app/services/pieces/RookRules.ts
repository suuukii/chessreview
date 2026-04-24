import { Piece } from "@/app/models/Piece";
import { Position } from "@/app/models/Position";
import {TeamType } from "../Types"
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
      const passedPosition = new Position(
        initialPosition.x,
        initialPosition.y + i * multiplierY,
      );
      if (passedPosition.isSamePosition(desiredPosition)) {
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
      const passedPosition = new Position(
        initialPosition.x + i * multiplierX,
        initialPosition.y,
      );
      if (passedPosition.isSamePosition(desiredPosition)) {
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
    const destination = new Position(rook.position.x, rook.position.y + i);
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
    const destination = new Position(rook.position.x, rook.position.y - i);
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
    if(rook.position.x - i < 0) break;
    const destination = new Position(rook.position.x - i, rook.position.y);
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
    if(rook.position.x + i > 7) break;
    const destination = new Position(rook.position.x + i, rook.position.y);
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
