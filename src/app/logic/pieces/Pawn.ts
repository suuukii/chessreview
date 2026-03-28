import { TeamType, Piece, Position}  from "../Constants";
import { isTileOccupied, isTileOccupiedByOpponent} from "../Rules";

export function pawnMove (
    initialPosition : Position,
    desiredPosition : Position,
    team: TeamType,
    boardState: Piece[],
  ): boolean {
    const specialRow = team === TeamType.OUR ? 1 : 6;
      const pawnDirection = team === TeamType.OUR ? 1 : -1;
      
      //MOVMENT LOGIC
      if (initialPosition.x === desiredPosition.x && initialPosition.y === specialRow && desiredPosition.y - initialPosition.y === 2 * pawnDirection) {
        if (
          !isTileOccupied(desiredPosition, boardState) &&
          !isTileOccupied({x:desiredPosition.x, y: desiredPosition.y - pawnDirection}, boardState)
        ) {
          return true;
        }
      } else if (initialPosition.x === desiredPosition.x && desiredPosition.y - initialPosition.y === pawnDirection) {
        if (!isTileOccupied(desiredPosition, boardState)) {
          return true;
        }
      }

      //ATTACK LOGIC
      if (desiredPosition.x - initialPosition.x === -1 && desiredPosition.y - initialPosition.y === pawnDirection) {
        if (isTileOccupiedByOpponent(desiredPosition, boardState, team)) {
          return true;
        }
      } else if (desiredPosition.x - initialPosition.x === 1 && desiredPosition.y - initialPosition.y === pawnDirection) {
        if (isTileOccupiedByOpponent(desiredPosition, boardState, team)) {
          return true;
        }
      }
      return false;
  }