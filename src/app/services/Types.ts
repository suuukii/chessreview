export enum PieceType {
  PAWN = 'p',
  BISHOP = 'b',
  KNIGHT = 'n',
  ROOK = 'r',
  KING = 'k',
  QUEEN = 'q',
}

export enum MoveResult {
  INVALID,
  MOVE,
  CHECK,
  CAPTURE,
  EN_PASSANT,
  PROMOTION,
  CASTLE,
  CHECKMATE,
  STALEMATE,
  DRAW,
}

export enum MoveClassification {
  BRILLIANT,
  GREAT,
  BEST,
  BOOK,
  EXCELLENT,
  GOOD,
  MISS,
  INACCURACY,
  MISTAKE,
  BLUNDER
}

export const TeamType = {
  OUR:      'w',
  OPPONENT: 'b',
} as const;
export type TeamType = typeof TeamType[keyof typeof TeamType];
