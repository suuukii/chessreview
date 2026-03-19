'use client';

import "../styles/board.css";
import Tile from "./Tile";
import {useRef,useState} from "react";
import Rules from "../services/Rules";

export interface Piece {
  image: string;
  horizontalAxis: number;
  verticalAxis: number;
  type: PieceType;
  team : TeamType
}

export enum PieceType{
  PAWN,
  BISHOP,
  KNIGHT,
  ROOK,
  KING,
  QUEEN
}

export enum TeamType{
  OUR,
  OPPONENT
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
  const rules = new Rules();


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
            const validMove = rules.isValidMove(gridX,gridY, x, y, p.type,p.team,value);
            if (validMove){
            p.horizontalAxis = x;
            p.verticalAxis = y;
            } else{
              activePiece.style.position = "relative";
              activePiece.style.removeProperty("top");
              activePiece.style.removeProperty("left");
            }
          }
          return p;
        })
        return pieces;
      })
      setActivePiece(null);
    }
  }

  for (let p:number = 0; p < 2; p++){
    const teamType = (p === 0)? TeamType.OPPONENT : TeamType.OUR;
    const type = (teamType === TeamType.OPPONENT) ? "b" : "w";
    const verticalAxis = (teamType === TeamType.OPPONENT)? 7 : 0;

    //ROOK's
    initialBoardState.push({image: `/imgs/pieces/${type}r.png`,horizontalAxis:0, verticalAxis, type: PieceType.ROOK, team: teamType})
    initialBoardState.push({image: `/imgs/pieces/${type}r.png`,horizontalAxis:7, verticalAxis, type: PieceType.ROOK, team: teamType})

    //KNIGHT's
    initialBoardState.push({image: `/imgs/pieces/${type}n.png`,horizontalAxis:1, verticalAxis, type: PieceType.KNIGHT, team: teamType})
    initialBoardState.push({image: `/imgs/pieces/${type}n.png`,horizontalAxis:6, verticalAxis, type: PieceType.KNIGHT, team: teamType})

    //BISHOP's
    initialBoardState.push({image: `/imgs/pieces/${type}b.png`,horizontalAxis:2, verticalAxis, type: PieceType.BISHOP, team: teamType})
    initialBoardState.push({image: `/imgs/pieces/${type}b.png`,horizontalAxis:5, verticalAxis, type: PieceType.BISHOP, team: teamType})

    //QUEEN
    initialBoardState.push({image: `/imgs/pieces/${type}q.png`,horizontalAxis:3, verticalAxis, type: PieceType.QUEEN, team: teamType})

    //KING
    initialBoardState.push({image: `/imgs/pieces/${type}k.png`,horizontalAxis:4, verticalAxis, type: PieceType.KING, team: teamType})
  }

  //PAWN's
  for(let i: number = 0; i < 8; i++){
    initialBoardState.push({image: `/imgs/pieces/bp.png`,horizontalAxis:i, verticalAxis: 6, type: PieceType.PAWN, team: TeamType.OPPONENT})
  }

  for(let i: number = 0; i < 8; i++){
    initialBoardState.push({image: `/imgs/pieces/wp.png`,horizontalAxis:i, verticalAxis: 1, type: PieceType.PAWN, team: TeamType.OUR})
  }



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
