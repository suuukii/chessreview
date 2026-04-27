import { Piece } from "@/app/models/Piece";
import { Position } from "@/app/models/Position";
import { TeamType } from "../Types";
import {
  isTileEmptyOrOccupiedByOpponent,
  isTileOccupied,
  isTileOccupiedByOpponent,
} from "../Rules";

export function kingMove(
  initialPosition: Position,
  desiredPosition: Position,
  team: TeamType,
  boardState: Piece[],
): boolean {
  const multiplierY =
    desiredPosition.y < initialPosition.y
      ? -1
      : desiredPosition.y > initialPosition.y
        ? 1
        : 0;
  const multiplierX =
    desiredPosition.x < initialPosition.x
      ? -1
      : desiredPosition.x > initialPosition.x
        ? 1
        : 0;

  for (let i: number = 1; i < 2; i++) {
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
  return false;
}

export function getPossibleKingMoves(
  king: Piece,
  boardState: Piece[],
): Position[] {
  const possibleMoves: Position[] = [];

  
  for (let i: number = 1; i < 2; i++) {
    const destination = new Position(king.position.x, king.position.y + i);

    if(destination.x < 0 || destination.x > 7 || destination.y < 0 || destination.y > 7) break;

    if (!isTileOccupied(destination, boardState)) {
      possibleMoves.push(destination);
    } else if (isTileOccupiedByOpponent(destination, boardState, king.team)) {
      possibleMoves.push(destination);
      break;
    } else {
      break;
    }
  }

  //bottom movement
  for (let i: number = 1; i < 2; i++) {
    const destination = new Position(king.position.x, king.position.y - i);
    if(destination.x < 0 || destination.x > 7 || destination.y < 0 || destination.y > 7) break;
    if (!isTileOccupied(destination, boardState)) {
      possibleMoves.push(destination);
    } else if (isTileOccupiedByOpponent(destination, boardState, king.team)) {
      possibleMoves.push(destination);
      break;
    } else {
      break;
    }
  }

  //left movement
  for (let i: number = 1; i < 2; i++) {
    const destination = new Position(king.position.x - i, king.position.y);
    if(destination.x < 0 || destination.x > 7 || destination.y < 0 || destination.y > 7) break;
    if (!isTileOccupied(destination, boardState)) {
      possibleMoves.push(destination);
    } else if (isTileOccupiedByOpponent(destination, boardState, king.team)) {
      possibleMoves.push(destination);
      break;
    } else {
      break;
    }
  }

  //right movement
  for (let i: number = 1; i < 2; i++) {
    const destination = new Position(king.position.x + i, king.position.y);
    if(destination.x < 0 || destination.x > 7 || destination.y < 0 || destination.y > 7) break;
    if (!isTileOccupied(destination, boardState)) {
      possibleMoves.push(destination);
    } else if (isTileOccupiedByOpponent(destination, boardState, king.team)) {
      possibleMoves.push(destination);
      break;
    } else {
      break;
    }
  }

  //Upper Right Movement
  for (let i: number = 1; i < 2; i++) {
    const destination = new Position(king.position.x + i, king.position.y + i);
    if(destination.x < 0 || destination.x > 7 || destination.y < 0 || destination.y > 7) break;
    if (!isTileOccupied(destination, boardState)) {
      possibleMoves.push(destination);
    } else if (isTileOccupiedByOpponent(destination, boardState, king.team)) {
      possibleMoves.push(destination);
      break;
    } else {
      break;
    }
  }
  //bottom right
  for (let i: number = 1; i < 2; i++) {
    const destination = new Position(king.position.x + i, king.position.y - i);
    if(destination.x < 0 || destination.x > 7 || destination.y < 0 || destination.y > 7) break;
    if (!isTileOccupied(destination, boardState)) {
      possibleMoves.push(destination);
    } else if (isTileOccupiedByOpponent(destination, boardState, king.team)) {
      possibleMoves.push(destination);
      break;
    } else {
      break;
    }
  }
  //up left
  for (let i: number = 1; i < 2; i++) {
    const destination = new Position(king.position.x - i, king.position.y + i);
    if(destination.x < 0 || destination.x > 7 || destination.y < 0 || destination.y > 7) break;
    if (!isTileOccupied(destination, boardState)) {
      possibleMoves.push(destination);
    } else if (isTileOccupiedByOpponent(destination, boardState, king.team)) {
      possibleMoves.push(destination);
      break;
    } else {
      break;
    }
  }
  //bottom left
  for (let i: number = 1; i < 2; i++) {
    const destination = new Position(king.position.x - i, king.position.y - i);
    if(destination.x < 0 || destination.x > 7 || destination.y < 0 || destination.y > 7) break;
    if (!isTileOccupied(destination, boardState)) {
      possibleMoves.push(destination);
    } else if (isTileOccupiedByOpponent(destination, boardState, king.team)) {
      possibleMoves.push(destination);
      break;
    } else {
      break;
    }
  }

  return possibleMoves;
}

export function getCastlingMoves(king: Piece, pieces: Piece[]): Position[]{
  if(king.hasMoved) return [];
  
  const possibleMoves: Position[] = []

  const rooks = pieces.filter(p => p.isRook && p.team === king.team && !p.hasMoved)
  for(const rook of rooks){    

    const direction = (rook.position.x - king.position.x > 0) ? 1 : -1;

    const adjacentPosition = king.position.clone();
    adjacentPosition.x += direction;

    if(!rook.possibleMoves?.some(m => m.isSamePosition(adjacentPosition))) continue;

    const concernigTiles = rook.possibleMoves.filter(m => m.y === king.position.y);
    const enemyPieces = pieces.filter(p => p.team !== king.team)

    let valid = true;

    for(const enemy of enemyPieces){
      if(!enemy.possibleMoves) continue;
      for(const move of enemy.possibleMoves){
        if(concernigTiles.some(t => t.isSamePosition(move))){
          valid = false;
        }
        if(!valid) break;
      }
      if(!valid) break;
    }
    if(!valid) continue;
    possibleMoves.push(new Position(king.position.x + direction * 2, king.position.y))
  }
  return possibleMoves;
}