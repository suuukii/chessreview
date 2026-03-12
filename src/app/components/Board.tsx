import "../styles/board.css";
import Tile from "./Tile";

interface Piece {
  image: string;
  horizontalAxis: number;
  verticalAxis: number;
}

export default function Board() {
  const horizontalAxis: string[] = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const verticalAxis: string[] = ["1", "2", "3", "4", "5", "6", "7", "8"];

  const board = [];
  const pieces: Piece[] = [];

  const pathPieces: Record<string, string> = {
    blackPawn: "/imgs/pieces/pawn_b.png",
    whitePawn: "/imgs/pieces/pawn_w.png",
    blackRook: "/imgs/pieces/rook_b.png",
    whiteRook: "/imgs/pieces/rook_w.png",
    blackBishop: "/imgs/pieces/bishop_b.png",
    whiteBishop: "/imgs/pieces/bishop_w.png",
    blackKnight: "/imgs/pieces/knight_b.png",
    whiteKnight: "/imgs/pieces/knight_w.png",
    blackQueen: "/imgs/pieces/queen_b.png",
    whiteQueen: "/imgs/pieces/queen_w.png",
    blackKing: "/imgs/pieces/king_b.png",
    whiteKing: "/imgs/pieces/king_w.png",
  };

  function pieceInserction(piece: string, h: number, v: number): void {
    pieces.push({
      image: pathPieces[piece],
      horizontalAxis: h,
      verticalAxis: v,
    });
  }

  function boardInitialize(): void {
    //Pawns
    for (let i = 7; i >= 0; i--) {
      pieceInserction("blackPawn", i, 6);
    }

    for (let i = 7; i >= 0; i--) {
      pieceInserction("whitePawn", i, 1);
    }

    //Rooks
    pieceInserction("whiteRook", 0, 0);
    pieceInserction("whiteRook", 7, 0);
    pieceInserction("blackRook", 0, 7);
    pieceInserction("blackRook", 7, 7);

    //Knights
    pieceInserction("whiteKnight", 1, 0);
    pieceInserction("whiteKnight", 6, 0);
    pieceInserction("blackKnight", 1, 7);
    pieceInserction("blackKnight", 6, 7);

    //Bishops
    pieceInserction("whiteBishop", 2, 0);
    pieceInserction("whiteBishop", 5, 0);
    pieceInserction("blackBishop", 2, 7);
    pieceInserction("blackBishop", 5, 7);

    //Kings
    pieceInserction("whiteKing", 3, 0);
    pieceInserction("blackKing", 3, 7);

    //Queens
    pieceInserction("whiteQueen", 4, 0);
    pieceInserction("blackQueen", 4, 7);
  }

  boardInitialize();

  for (let i = verticalAxis.length - 1; i >= 0; i--) {
    for (let j = horizontalAxis.length - 1; j >= 0; j--) {
      const number = j + i + 2;

      let image = undefined;

      pieces.forEach((p) => {
        if (p.horizontalAxis === j && p.verticalAxis === i) {
          image = p.image;
        }
      });

      board.push(
        <Tile
          number={number}
          image={image}
          key={horizontalAxis[j] + verticalAxis[i]}
        />,
      );
    }
  }
  return <div className="board">{board}</div>;
}
