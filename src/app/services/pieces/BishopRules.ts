import { Piece } from "@/app/models/Piece";
import { Position } from "@/app/models/Position";
import {TeamType } from "../Types"
import { isTileEmptyOrOccupiedByOpponent, isTileOccupied, isTileOccupiedByOpponent } from "../Rules";

export function bishopMove(
  initialPosition: Position,
  desiredPosition: Position,
  team: TeamType,
  boardState: Piece[],
): boolean {
  const multiplierX = desiredPosition.x < initialPosition.x ? -1 : 1;
  const multiplierY = desiredPosition.y < initialPosition.y ? -1 : 1;
  for (let i: number = 1; i < 8; i++) {
    if ( desiredPosition.x != initialPosition.x && desiredPosition.y != initialPosition.y) {
      const passedPosition = new Position(
        initialPosition.x + i * multiplierX,
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
  }
  return false;
}

export function getPossibleBishopMoves(bishop: Piece, boardState: Piece[]): Position[]{
  const possibleMoves: Position[] = [];
  //Upper Right Movement 
  for (let i: number = 1; i < 8; i++) {
    const destination = new Position(bishop.position.x + i, bishop.position.y + i);
    if(!isTileOccupied(destination, boardState)){
      possibleMoves.push(destination);
    } else if(isTileOccupiedByOpponent(destination, boardState, bishop.team)){
        possibleMoves.push(destination);
        break;
    } else {
      break;
    }
  }
  //bottom right
  for (let i: number = 1; i < 8; i++) {
    const destination = new Position(bishop.position.x + i, bishop.position.y - i);
    if(!isTileOccupied(destination, boardState)){
      possibleMoves.push(destination);
    } else if(isTileOccupiedByOpponent(destination, boardState, bishop.team)){
        possibleMoves.push(destination);
        break;
    } else {
      break;
    }
  }
  //up left
  for (let i: number = 1; i < 8; i++) {
    const destination = new Position(bishop.position.x - i, bishop.position.y + i);
    if(!isTileOccupied(destination, boardState)){
      possibleMoves.push(destination);
    } else if(isTileOccupiedByOpponent(destination, boardState, bishop.team)){
        possibleMoves.push(destination);
        break;
    } else {
      break;
    }
  }
  //bottom left
  for (let i: number = 1; i < 8; i++) {
    const destination = new Position(bishop.position.x - i, bishop.position.y - i);
    if(!isTileOccupied(destination, boardState)){
      possibleMoves.push(destination);
    } else if(isTileOccupiedByOpponent(destination, boardState, bishop.team)){
        possibleMoves.push(destination);
        break;
    } else {
      break;
    }
  }
  return possibleMoves;
}