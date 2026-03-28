import { Position, TeamType, Piece, isSamePosition } from "../Constants";
import { isTileEmptyOrOccupiedByOpponent, isTileOccupied } from "../Rules";

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
      const passedPosition: Position = {
        x: initialPosition.x + i * multiplierX,
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
  }
  return false;
}
