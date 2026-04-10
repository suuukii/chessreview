import { TeamType, Piece, Position, isSamePosition, PieceType } from "../Constants";
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
        { x: desiredPosition.x, y: desiredPosition.y - pawnDirection },
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
  pawn: Piece,
  boardState: Piece[],
): Position[] {
  const possibleMoves: Position[] = [];
  const pawnDirection = pawn.team === TeamType.OUR ? 1 : -1;
  const specialRow = pawn.team === TeamType.OUR ? 1 : 6;

  const normalMove: Position = {
    x: pawn.position.x,
    y: pawn.position.y + pawnDirection,
  };
  const specialMove: Position = {
    x: pawn.position.x,
    y: pawn.position.y + pawnDirection * 2,
  };
  const upperLeftAttack: Position = {
    x: pawn.position.x - 1,
    y: pawn.position.y + 1,
  };
  const upperRightAttack: Position = {
    x: pawn.position.x + 1,
    y: pawn.position.y + 1,
  };

  const leftPosition : Position = {x:pawn.position.x - 1, y:pawn.position.y};
  const rightPosition : Position = {x:pawn.position.x + 1, y:pawn.position.y};

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
      const leftPiece = boardState.find(p => isSamePosition(p.position, leftPosition));
      if(leftPiece != null && leftPiece.type == PieceType.PAWN && leftPiece.enPassant){
        possibleMoves.push(upperLeftAttack);
      }
    }

    if (isTileOccupiedByOpponent(upperRightAttack, boardState, pawn.team)){
      possibleMoves.push(upperRightAttack);
    } else if(!isTileOccupied(upperRightAttack, boardState)){
      const rightPiece = boardState.find(p => isSamePosition(p.position, rightPosition));
      if(rightPiece != null && rightPiece.type == PieceType.PAWN && rightPiece.enPassant){
        possibleMoves.push(upperRightAttack);
      }
    }

  }
  return possibleMoves;
}
