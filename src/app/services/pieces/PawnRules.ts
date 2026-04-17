import { Pawn } from "@/app/models/Pawn";
import { Piece } from "@/app/models/Piece";
import { Position } from "@/app/models/Position";
import { TeamType } from "../Types"
import { isTileOccupied, isTileOccupiedByOpponent } from "../Rules";

export function pawnMove(
  initialPosition: Position,
  desiredPosition: Position,
  team: TeamType,
  boardState: Piece[],
): boolean {
  const specialRow = team === TeamType.OUR ? 1 : 6;
  const pawnDirection = team === TeamType.OUR ? 1 : -1;

  //MOVMENT LOGIC
  if (
    initialPosition.x === desiredPosition.x &&
    initialPosition.y === specialRow &&
    desiredPosition.y - initialPosition.y === 2 * pawnDirection
  ) {
    if (
      !isTileOccupied(desiredPosition, boardState) &&
      !isTileOccupied(
        new Position(desiredPosition.x, desiredPosition.y - pawnDirection),
        boardState,
      )
    ) {
      return true;
    }
  } else if (
    initialPosition.x === desiredPosition.x &&
    desiredPosition.y - initialPosition.y === pawnDirection
  ) {
    if (!isTileOccupied(desiredPosition, boardState)) {
      return true;
    }
  }

  //ATTACK LOGIC
  if (
    desiredPosition.x - initialPosition.x === -1 &&
    desiredPosition.y - initialPosition.y === pawnDirection
  ) {
    if (isTileOccupiedByOpponent(desiredPosition, boardState, team)) {
      return true;
    }
  } else if (
    desiredPosition.x - initialPosition.x === 1 &&
    desiredPosition.y - initialPosition.y === pawnDirection
  ) {
    if (isTileOccupiedByOpponent(desiredPosition, boardState, team)) {
      return true;
    }
  }
  return false;
}

export function getPossiblePawnMoves(
  pawn: Pawn,
  boardState: Piece[],
): Position[] {
  const possibleMoves: Position[] = [];
  const pawnDirection = pawn.team === TeamType.OUR ? 1 : -1;
  const specialRow = pawn.team === TeamType.OUR ? 1 : 6;

  const normalMove = new Position(pawn.position.x, pawn.position.y + pawnDirection);
  const specialMove = new Position(pawn.position.x, pawn.position.y + pawnDirection * 2);
  const upperLeftAttack = new Position(pawn.position.x - 1, pawn.position.y + 1);
  const upperRightAttack = new Position(pawn.position.x + 1, pawn.position.y + 1);

  const leftPosition = new Position(pawn.position.x - 1, pawn.position.y);
  const rightPosition = new Position(pawn.position.x + 1, pawn.position.y);

  if (!isTileOccupied(normalMove, boardState)) {
    possibleMoves.push(normalMove);
    if (
      pawn.position.y === specialRow &&
      !isTileOccupied(specialMove, boardState)
    ) {
      possibleMoves.push(specialMove);
    }

    if (isTileOccupiedByOpponent(upperLeftAttack, boardState, pawn.team)) {
      possibleMoves.push(upperLeftAttack);
    } else if(!isTileOccupied(upperLeftAttack, boardState)){
      const leftPiece = boardState.find(p => p.position.isSamePosition(leftPosition));
      if(leftPiece != null && leftPiece.isPawn && (leftPiece as Pawn).enPassant){
        possibleMoves.push(upperLeftAttack);
      }
    }

    if (isTileOccupiedByOpponent(upperRightAttack, boardState, pawn.team)){
      possibleMoves.push(upperRightAttack);
    } else if(!isTileOccupied(upperRightAttack, boardState)){
      const rightPiece = boardState.find(p => p.position.isSamePosition(rightPosition));
      if(rightPiece != null && rightPiece.isPawn && (rightPiece as Pawn).enPassant){
        possibleMoves.push(upperRightAttack);
      }
    }

  }
  return possibleMoves;
}
