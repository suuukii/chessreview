export const HORIZONTAL_AXIS: string[] = ["a","b","c","d","e","f","g","h"];
export const VERTICAL_AXIS: string[] = ["1", "2", "3", "4", "5", "6", "7", "8"];

export const GRID_SIZE:number  = 100;

export function isSamePosition(p1:Position, p2:Position) : boolean{
  return p1.x === p2.x && p1.y === p2.y;
}

export interface Position{
  x:number;
  y:number;
}

export enum PieceType {
  PAWN,
  BISHOP,
  KNIGHT,
  ROOK,
  KING,
  QUEEN,
}

export enum TeamType {
  OUR,
  OPPONENT,
}

export interface Piece {
  image: string;
  position: Position
  type: PieceType;
  team: TeamType;
  enPassant?: boolean;
}

export const initialBoardState: Piece[] = [
  //Black pawns
  {
    image: `/imgs/pieces/bp.png`,
    position: {
      x:0,
      y:6
    },
    type: PieceType.PAWN,
    team: TeamType.OPPONENT,
  },
  {
    image: `/imgs/pieces/bp.png`,
    position: {
      x:1,
      y:6
    },
    type: PieceType.PAWN,
    team: TeamType.OPPONENT,
  },
  {
    image: `/imgs/pieces/bp.png`,
    position: {
      x:2,
      y:6
    },
    type: PieceType.PAWN,
    team: TeamType.OPPONENT,
  },
  {
    image: `/imgs/pieces/bp.png`,
    position: {
      x:3,
      y:6
    },
    type: PieceType.PAWN,
    team: TeamType.OPPONENT,
  },
  {
    image: `/imgs/pieces/bp.png`,
    position: {
      x:4,
      y:6
    },
    type: PieceType.PAWN,
    team: TeamType.OPPONENT,
  },
  {
    image: `/imgs/pieces/bp.png`,
     position: {
      x:5,
      y:6
    },
    type: PieceType.PAWN,
    team: TeamType.OPPONENT,
  },
  {
    image: `/imgs/pieces/bp.png`,
    position: {
      x:6,
      y:6
    },
    type: PieceType.PAWN,
    team: TeamType.OPPONENT,
  },
  {
    image: `/imgs/pieces/bp.png`,
    position: {
      x:7,
      y:6
    },
    type: PieceType.PAWN,
    team: TeamType.OPPONENT,
  },
  //White pawns
  {
    image: `/imgs/pieces/wp.png`,
    position: {
      x:0,
      y:1
    },
    type: PieceType.PAWN,
    team: TeamType.OUR,
  },
  {
    image: `/imgs/pieces/wp.png`,
    position: {
      x:1,
      y:1
    },
    type: PieceType.PAWN,
    team: TeamType.OUR,
  },
  {
    image: `/imgs/pieces/wp.png`,
    position: {
      x:2,
      y:1
    },
    type: PieceType.PAWN,
    team: TeamType.OUR,
  },
  {
    image: `/imgs/pieces/wp.png`,
    position: {
      x:3,
      y:1
    },
    type: PieceType.PAWN,
    team: TeamType.OUR,
  },
  {
    image: `/imgs/pieces/wp.png`,
    position: {
      x:4,
      y:1
    },
    type: PieceType.PAWN,
    team: TeamType.OUR,
  },
  {
    image: `/imgs/pieces/wp.png`,
    position: {
      x:5,
      y:1
    },
    type: PieceType.PAWN,
    team: TeamType.OUR,
  },
  {
    image: `/imgs/pieces/wp.png`,
    position: {
      x:6,
      y:1
    },
    type: PieceType.PAWN,
    team: TeamType.OUR,
  },
  {
    image: `/imgs/pieces/wp.png`,
    position: {
      x:7,
      y:1
    },
    type: PieceType.PAWN,
    team: TeamType.OUR,
  },
  //ROOKS
  {
    image: `/imgs/pieces/wr.png`,
    position: {
      x:0,
      y:0
    },
    type: PieceType.ROOK,
    team: TeamType.OUR,
  },
  {
    image: `/imgs/pieces/wr.png`,
    position: {
      x:7,
      y:0
    },
    type: PieceType.ROOK,
    team: TeamType.OUR,
  },
  {
    image: `/imgs/pieces/br.png`,
    position: {
      x:0,
      y:7
    },
    type: PieceType.ROOK,
    team: TeamType.OPPONENT,
  },
  {
    image: `/imgs/pieces/br.png`,
    position: {
      x:7,
      y:7
    },
    type: PieceType.ROOK,
    team: TeamType.OPPONENT,
  },
  //Knights
  {
    image: `/imgs/pieces/wn.png`,
    position: {
      x:1,
      y:0
    },
    type: PieceType.KNIGHT,
    team: TeamType.OUR,
  },
  {
    image: `/imgs/pieces/wn.png`,
    position: {
      x:6,
      y:0
    },
    type: PieceType.KNIGHT,
    team: TeamType.OUR,
  },
  {
    image: `/imgs/pieces/bn.png`,
    position: {
      x:1,
      y:7
    },
    type: PieceType.KNIGHT,
    team: TeamType.OPPONENT,
  },
  {
    image: `/imgs/pieces/bn.png`,
    position: {
      x:6,
      y:7
    },
    type: PieceType.KNIGHT,
    team: TeamType.OPPONENT,
  },
  //Bishop's
  {
    image: `/imgs/pieces/wb.png`,
    position: {
      x:2,
      y:0
    },
    type: PieceType.BISHOP,
    team: TeamType.OUR,
  },
  {
    image: `/imgs/pieces/wb.png`,
    position: {
      x:5,
      y:0
    },
    type: PieceType.BISHOP,
    team: TeamType.OUR,
  },
  {
    image: `/imgs/pieces/bb.png`,
    position: {
      x:2,
      y:7
    },
    type: PieceType.BISHOP,
    team: TeamType.OPPONENT,
  },
  {
    image: `/imgs/pieces/bb.png`,
    position: {
      x:5,
      y:7
    },
    type: PieceType.BISHOP,
    team: TeamType.OPPONENT,
  },
  //King's
  {
    image: `/imgs/pieces/wk.png`,
    position: {
      x:4,
      y:0
    },
    type: PieceType.KING,
    team: TeamType.OUR,
  },
  {
    image: `/imgs/pieces/bk.png`,
    position: {
      x:4,
      y:7
    },
    type: PieceType.KING,
    team: TeamType.OPPONENT,
  },
  //Queen's
  {
    image: `/imgs/pieces/wq.png`,
    position: {
      x:3,
      y:0
    },
    type: PieceType.QUEEN,
    team: TeamType.OUR,
  },
  {
    image: `/imgs/pieces/bq.png`,
    position: {
      x:3,
      y:7
    },
    type: PieceType.QUEEN,
    team: TeamType.OPPONENT,
  },
];
