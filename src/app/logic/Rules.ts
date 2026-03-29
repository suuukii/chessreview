import { Position, Piece, TeamType, isSamePosition } from "./Constants";

export function isTileOccupied(
  position: Position,
  boardState: Piece[],
): boolean {
  const piece = boardState.find((p) => isSamePosition(p.position, position));
  if (piece) {
    return true;
  }
  return false;
}

export function isTileOccupiedByOpponent(
  position: Position,
  boardState: Piece[],
  team: TeamType,
): boolean {
  const piece = boardState.find(
    (p) => isSamePosition(p.position, position) && p.team !== team,
  );
  if (piece) {
    return true;
  }
  return false;
}

export function isTileEmptyOrOccupiedByOpponent(
  position: Position,
  boardState: Piece[],
  team: TeamType,
): boolean {
  return (
    !isTileOccupied(position, boardState) ||
    isTileOccupiedByOpponent(position, boardState, team)
  );
}
