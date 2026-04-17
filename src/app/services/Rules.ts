import {TeamType } from "./Types"
import { Position } from "../models/Position";
import { Piece } from "../models/Piece";

export function isTileOccupied(
  position: Position,
  boardState: Piece[],
): boolean {
  const piece = boardState.find((p) => p.position.isSamePosition(position));
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
    (p) => p.position.isSamePosition(position) && p.team !== team,
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
