import { Piece } from "../models/Piece";
import { Pawn } from "../models/Pawn";
import { Position } from "../models/Position";
import { PieceType, TeamType } from "./Types";
import { Chessboard } from "../models/Chessboard";

export const HORIZONTAL_AXIS: string[] = ["a","b","c","d","e","f","g","h"];
export const VERTICAL_AXIS: string[] = ["1", "2", "3", "4", "5", "6", "7", "8"];

export const GRID_SIZE:number  = 100;

export function playSound(sound: string): void {
    const audio = new Audio(`/sounds/${sound}`);
    audio.play();
  }

export const initialBoard : Chessboard = (() => {
  const board = new Chessboard([
    // Black pawns
    new Pawn(new Position(0, 6),  TeamType.OPPONENT),
    new Pawn(new Position(1, 6),  TeamType.OPPONENT),
    new Pawn(new Position(2, 6),  TeamType.OPPONENT),
    new Pawn(new Position(3, 6),  TeamType.OPPONENT),
    new Pawn(new Position(4, 6),  TeamType.OPPONENT),
    new Pawn(new Position(5, 6),  TeamType.OPPONENT),
    new Pawn(new Position(6, 6),  TeamType.OPPONENT),
    new Pawn(new Position(7, 6),  TeamType.OPPONENT),

    // White pawns
    new Pawn(new Position(0, 1),  TeamType.OUR),
    new Pawn(new Position(1, 1),  TeamType.OUR),
    new Pawn(new Position(2, 1),  TeamType.OUR),
    new Pawn(new Position(3, 1),  TeamType.OUR),
    new Pawn(new Position(4, 1),  TeamType.OUR),
    new Pawn(new Position(5, 1),  TeamType.OUR),
    new Pawn(new Position(6, 1),  TeamType.OUR),
    new Pawn(new Position(7, 1),  TeamType.OUR),

    // Rooks
    new Piece(new Position(0, 0), PieceType.ROOK,   TeamType.OUR),
    new Piece(new Position(7, 0), PieceType.ROOK,   TeamType.OUR),
    new Piece(new Position(0, 7), PieceType.ROOK,   TeamType.OPPONENT),
    new Piece(new Position(7, 7), PieceType.ROOK,   TeamType.OPPONENT),

    // Knights
    new Piece(new Position(1, 0), PieceType.KNIGHT, TeamType.OUR),
    new Piece(new Position(6, 0), PieceType.KNIGHT, TeamType.OUR),
    new Piece(new Position(1, 7), PieceType.KNIGHT, TeamType.OPPONENT),
    new Piece(new Position(6, 7), PieceType.KNIGHT, TeamType.OPPONENT),

    // Bishops
    new Piece(new Position(2, 0), PieceType.BISHOP, TeamType.OUR),
    new Piece(new Position(5, 0), PieceType.BISHOP, TeamType.OUR),
    new Piece(new Position(2, 7), PieceType.BISHOP, TeamType.OPPONENT),
    new Piece(new Position(5, 7), PieceType.BISHOP, TeamType.OPPONENT),

    // Kings
    new Piece(new Position(4, 0), PieceType.KING,   TeamType.OUR),
    new Piece(new Position(4, 7), PieceType.KING,   TeamType.OPPONENT),

    // Queens
    new Piece(new Position(3, 0), PieceType.QUEEN,  TeamType.OUR),
    new Piece(new Position(3, 7), PieceType.QUEEN,  TeamType.OPPONENT),
  ], 1);
  board.calculateAllMoves();
  return board;
})();