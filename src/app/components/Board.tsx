"use client";

import "../styles/board.css";
import Tile from "./Tile";
import { useRef, useState } from "react";
import Rules from "../logic/Rules";
import { VERTICAL_AXIS,HORIZONTAL_AXIS,Piece,PieceType,TeamType, initialBoardState, Position, GRID_SIZE, isSamePosition } from "../logic/Constants"


export default function Board() {
  const board = [];
  const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
  const [grabPosition , setGrabPosition] = useState<Position>({x:-1,y:-1});
  const [pieces, setPieces] = useState<Piece[]>(initialBoardState);
  const chessBoardRef = useRef<HTMLDivElement>(null);
  const rules = new Rules();

  function grabPiece(e: React.MouseEvent): void {
    const element = e.target as HTMLElement;
    const chessBoard = chessBoardRef.current;
    if (element.classList.contains("chess-piece") && chessBoard) {
      const grabX = Math.floor((e.clientX - chessBoard.offsetLeft) / GRID_SIZE);
      const grabY = Math.abs(Math.ceil((e.clientY - chessBoard.offsetTop - 800) / GRID_SIZE))
      setGrabPosition({x: grabX,y: grabY})


      const x = e.clientX - GRID_SIZE/2;
      const y = e.clientY - GRID_SIZE/2;

      element.style.position = "absolute";
      element.style.left = String(x) + "px";
      element.style.top = String(y) + "px";

      setActivePiece(element);
    }
  }

  function movePiece(e: React.MouseEvent): void {
    const chessBoard = chessBoardRef.current;
    if (activePiece && chessBoard) {
      const minX = chessBoard.offsetLeft - 50;
      const minY = chessBoard.offsetTop - 50;
      const maxX = chessBoard.offsetLeft + chessBoard.clientWidth - 50;
      const maxY = chessBoard.offsetTop + chessBoard.clientHeight - 50;

      const x = e.clientX - 50;
      const y = e.clientY - 50;

      activePiece.style.position = "absolute";

      //horizontal
      if (x < minX) {
        activePiece.style.left = `${minX}px`;
      } else if (x > maxX) {
        activePiece.style.left = `${maxX}px`;
      } else {
        activePiece.style.left = `${x}px`;
      }

      if (y < minY) {
        activePiece.style.top = `${minY - 50}px`;
      } else if (y > maxY) {
        activePiece.style.top = `${maxY + 50}px`;
      } else {
        activePiece.style.top = `${y}px`;
      }
    }
  }

  function dropPiece(e: React.MouseEvent): void {
    const chessBoard = chessBoardRef.current;

    if (activePiece && chessBoard) {
      const x = Math.floor((e.clientX - chessBoard.offsetLeft) / GRID_SIZE);
      const y = Math.abs(Math.ceil((e.clientY - chessBoard.offsetTop - 800) / GRID_SIZE));
      console.log(x, y);

      const currentPiece = pieces.find(
        (p) => isSamePosition(p.position, grabPosition)
      );
      console.log(currentPiece)

      if (currentPiece) {
        const isValidMove = rules.isValidMove(
          grabPosition,
          {x,y},
          currentPiece.type,
          currentPiece.team,
          pieces,
        );
        const isEnPassantMove = rules.isEnPassantMove(
          grabPosition,
          {x,y},
          pieces,
          currentPiece.type,
          currentPiece.team,
        );

        const pawnDirection = currentPiece.team === TeamType.OUR ? 1 : -1;

        if(isEnPassantMove){
          const updatedPieces = pieces.reduce((results,piece) => {
            if(isSamePosition(piece.position, grabPosition)){
              piece.enPassant = false;
              piece.position.x = x;
              piece.position.y = y;
              results.push(piece);
            }else if(!(isSamePosition(piece.position, {x, y: y-pawnDirection} ))){
              if(piece.type === PieceType.PAWN){
                piece.enPassant = false;
              }
              results.push(piece);
            }
            return results
          },[] as Piece[]);

          setPieces(updatedPieces);
        }else if(isValidMove) {
          const updatedPieces = pieces.reduce((results, piece) => {
            if (isSamePosition(piece.position,grabPosition)) {

              piece.enPassant = Math.abs(grabPosition.y - y) === 2 && piece.type === PieceType.PAWN

              piece.position.x = x;
              piece.position.y = y;
              results.push(piece);
            } else if (!(isSamePosition(piece.position,{x,y}))) {
              if(piece.type === PieceType.PAWN){
                piece.enPassant = false;
              }
              results.push(piece);
            }
            return results;
          }, [] as Piece[]);

          setPieces(updatedPieces);
        } else {
          //resets the piece position
          activePiece.style.position = "relative";
          activePiece.style.removeProperty("top");
          activePiece.style.removeProperty("left");
        }
      }
      setActivePiece(null);
    }
  }

  for (let i = VERTICAL_AXIS.length - 1; i >= 0; i--) {
    for (let j = 0; j < HORIZONTAL_AXIS.length; j++) {
      const number = j + i + 2;
      const piece = pieces.find(p => isSamePosition(p.position,{x:j,y:i}))
      const image = piece ? piece.image : undefined;


      board.push(
        <Tile
          number={number}
          image={image}
          key={HORIZONTAL_AXIS[j] + VERTICAL_AXIS[i]}
        />,
      );
    }
  }
  return (
    <div
      onMouseDown={(e) => grabPiece(e)}
      onMouseMove={(e) => movePiece(e)}
      onMouseUp={(e) => dropPiece(e)}
      className="board"
      ref={chessBoardRef}
    >
      {board}
    </div>
  );
}
