'use client';

import "../styles/board.css";
import Tile from "./Tile";
import {useRef,useState} from "react";

interface Piece {
  image: string;
  horizontalAxis: number;
  verticalAxis: number;
}

export default function Board() {
  const horizontalAxis: string[] = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const verticalAxis: string[] = ["1", "2", "3", "4", "5", "6", "7", "8"];

  const initialBoardState: Piece[] = [];
  const board = [];
  const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
  const [pieces,setPieces] = useState<Piece[]>(initialBoardState);
  const [gridX,setGridX] = useState(0);
  const [gridY,setGridY] = useState(0);
  const chessBoardRef = useRef<HTMLDivElement> (null);

  const pathPieces: Record<string, string> = {
    bp: "/imgs/pieces/bp.png",
    wp: "/imgs/pieces/wp.png",
    br: "/imgs/pieces/br.png",
    wr: "/imgs/pieces/wr.png",
    bb: "/imgs/pieces/bb.png",
    wb: "/imgs/pieces/wb.png",
    bn: "/imgs/pieces/bn.png",
    wn: "/imgs/pieces/wn.png",
    bq: "/imgs/pieces/bq.png",
    wq: "/imgs/pieces/wq.png",
    bk: "/imgs/pieces/bk.png",
    wk: "/imgs/pieces/wk.png",
  };


  function grabPiece(e: React.MouseEvent): void{
    const element = e.target as HTMLElement
    const chessBoard = chessBoardRef.current;
    if(element.classList.contains("chess-piece") && chessBoard){
      setGridX(Math.floor((e.clientX - chessBoard.offsetLeft) / 100));
      setGridY(Math.abs(Math.ceil((e.clientY - chessBoard.offsetTop- 800) / 100)));

      const x = e.clientX  -50;
      const y = e.clientY  -50;


      element.style.position = "absolute";
      element.style.left = String(x)+"px";
      element.style.top = String(y)+"px";

      setActivePiece(element);
    }
  }

  function movePiece(e: React.MouseEvent): void{
    const chessBoard = chessBoardRef.current;
    if(activePiece && chessBoard){
      const minX = chessBoard.offsetLeft - 50;
      const minY = chessBoard.offsetTop - 50;
      const maxX = chessBoard.offsetLeft + chessBoard.clientWidth - 50;
      const maxY = chessBoard.offsetTop + chessBoard.clientHeight - 50;

      const x = e.clientX - 50;
      const y = e.clientY - 50;


      activePiece.style.position = "absolute";

      //horizontal
      if(x < minX){
        activePiece.style.left = `${minX}px`;
      } else if (x > maxX) {
        activePiece.style.left = `${maxX}px`;
      } else{
        activePiece.style.left = `${x}px`;
      }

      if(y < minY){
        activePiece.style.top = `${minY - 50}px`;
      } else if (y > maxY) {
        activePiece.style.top = `${maxY + 50}px`;
      } else{
        activePiece.style.top = `${y}px`;
      }
    }
  }

  function dropPiece(e: React.MouseEvent): void{
    const chessBoard = chessBoardRef.current;
    if (activePiece && chessBoard){
      const x = Math.floor((e.clientX - chessBoard.offsetLeft) / 100);
      const y = Math.abs(Math.ceil((e.clientY - chessBoard.offsetTop- 800) / 100));
      console.log(x, y)
      setPieces(value =>{
        const pieces = value.map(p => {
          if (p.horizontalAxis === gridX && p.verticalAxis === gridY){
            p.horizontalAxis = x;
            p.verticalAxis = y;
          }
          return p;
        })
        return pieces;
      })
      setActivePiece(null);
    }
  }

  function pieceInserction(piece: string, h: number, v: number): void {
    initialBoardState.push({
      image: pathPieces[piece],
      horizontalAxis: h,
      verticalAxis: v,
    });
  }

  function boardInitialize(): void {
    //Pawns
    for (let i = 7; i >= 0; i--) {
      pieceInserction("bp", i, 6);
    }

    for (let i = 7; i >= 0; i--) {
      pieceInserction("wp", i, 1);
    }

    //Rooks
    pieceInserction('wr', 0, 0);
    pieceInserction("wr", 7, 0);
    pieceInserction("br", 0, 7);
    pieceInserction("br", 7, 7);

    //Knights
    pieceInserction("wn", 1, 0);
    pieceInserction("wn", 6, 0);
    pieceInserction("bn", 1, 7);
    pieceInserction("bn", 6, 7);

    //Bishops
    pieceInserction("wb", 2, 0);
    pieceInserction("wb", 5, 0);
    pieceInserction("bb", 2, 7);
    pieceInserction("bb", 5, 7);

    //Kings
    pieceInserction("wk", 4, 0);
    pieceInserction("bk", 4, 7);

    //Queens
    pieceInserction("wq", 3, 0);
    pieceInserction("bq", 3, 7);
  }

  boardInitialize();

  for (let i = verticalAxis.length - 1; i >= 0; i--) {
    for (let j = 0; j < horizontalAxis.length; j++) {
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
  return <div 
  onMouseDown={e => grabPiece(e)}
  onMouseMove={e => movePiece(e)}
  onMouseUp={e => dropPiece(e)}
  className="board"
  ref={chessBoardRef}>
      {board}
      </div>;
}
