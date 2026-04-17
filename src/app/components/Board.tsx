"use client";

import "../styles/board.css";
import Tile from "./Tile";
import PawnPromotionBox from "./PawnPromotionBox";
import { useRef, useState, useEffect } from "react";

import { Piece } from "../models/Piece";
import { Position } from "@/app/models/Position";
import {TeamType } from "../services/Types"
import {
  VERTICAL_AXIS,
  HORIZONTAL_AXIS,
  GRID_SIZE,
} from "../services/Constants";

interface Props {
  pieces: Piece[];
  updatePossibleMoves: () => void;
  playMove: (
    piece: Piece,
    destination: Position,
    onAnimationStart: (from: Position, translateX: number, translateY: number) => void,
    onPromotionNeeded: (piece: Piece) => void,
    isDragging: boolean,
  ) => boolean;
  promotePawn: (promotionPawn: Piece, pieceType: string) => void;
}

export default function Board({ pieces, updatePossibleMoves, playMove, promotePawn }: Props) {
  const activePieceRef = useRef<HTMLElement | null>(null);
  const [grabPosition, setGrabPosition]     = useState<Position>(new Position(-1, -1));
  const [selectedPiece, setSelectedPiece]   = useState<Piece | null>(null);
  const [promotionPawn, setPromotionPawn]   = useState<Piece | null>(null);
  const [hoverPosition, setHoverPosition]   = useState<Position | null>(null);
  const [lastMove, setLastMove]             = useState<{ from: Position; to: Position } | null>(null);
  const [animatingPosition, setAnimatingPosition] = useState<{
    from: Position;
    translateX: number;
    translateY: number;
  } | null>(null);
  const [boardOffset, setBoardOffset] = useState<{ left: number; top: number }>({ left: 0, top: 0 });

  const chessBoardRef    = useRef<HTMLDivElement>(null);
  const selectedPieceRef = useRef<Piece | null>(null);
  const grabPositionRef  = useRef<Position>(new Position(-1, -1));

  useEffect(() => {
    if (promotionPawn && chessBoardRef.current) {
      setBoardOffset({
        left: chessBoardRef.current.offsetLeft,
        top: chessBoardRef.current.offsetTop,
      });
    }
  }, [promotionPawn]);

  function updateSelectedPiece(piece: Piece | null | undefined) {
    selectedPieceRef.current = piece ?? null;
    setSelectedPiece(piece ?? null);
  }

  function resetActivePiece() {
    const activePiece = activePieceRef.current;
    if (activePiece) {
      activePiece.style.position = "relative";
      activePiece.style.removeProperty("top");
      activePiece.style.removeProperty("left");
    }
    activePieceRef.current = null;
    setHoverPosition(null);
  }

  function getBoardCoords(clientX: number, clientY: number): Position {
    const chessBoard = chessBoardRef.current!;
    return new Position(
      Math.floor((clientX - chessBoard.offsetLeft) / GRID_SIZE),
      Math.abs(Math.ceil((clientY - chessBoard.offsetTop - 800) / GRID_SIZE)),
    );
  }
function handleAnimationStart(from: Position, translateX: number, translateY: number) {
  setAnimatingPosition({ from, translateX, translateY });
  setTimeout(() => {
    setAnimatingPosition(null);
  }, 200); 
}

  function handlePromotionNeeded(piece: Piece) {
    setPromotionPawn(piece);
  }

  function grabPiece(e: React.MouseEvent): void {
    if (promotionPawn) return;

    e.preventDefault();
    updatePossibleMoves();

    const element = (e.target as HTMLElement).closest(".chess-piece") as HTMLElement | null;
    const chessBoard = chessBoardRef.current;
    if (!element || !chessBoard) return;

    const pos = getBoardCoords(e.clientX, e.clientY);
    grabPositionRef.current = pos;
    setGrabPosition(pos);

    const clickedPiece = pieces.find((p) => p.position.isSamePosition(pos));

    // Clicking a friendly piece while another is selected → switch selection
    if (selectedPiece && clickedPiece?.team === selectedPiece.team) {
      updateSelectedPiece(clickedPiece);
      return;
    }

    updateSelectedPiece(clickedPiece);

    element.style.position = "absolute";
    element.style.left = `${e.clientX - GRID_SIZE / 2}px`;
    element.style.top  = `${e.clientY - GRID_SIZE / 2}px`;
    activePieceRef.current = element;
  }

  function movePiece(e: React.MouseEvent): void {
    e.preventDefault();
    const activePiece = activePieceRef.current;
    const chessBoard = chessBoardRef.current;
    if (!activePiece || !chessBoard) return;

    const minX = chessBoard.offsetLeft - 50;
    const minY = chessBoard.offsetTop  - 50;
    const maxX = chessBoard.offsetLeft + chessBoard.clientWidth  - 50;
    const maxY = chessBoard.offsetTop  + chessBoard.clientHeight - 50;

    const x = Math.min(Math.max(e.clientX - 50, minX), maxX);
    const y = Math.min(Math.max(e.clientY - 50, minY), maxY);

    activePiece.style.position = "absolute";
    activePiece.style.left = `${x}px`;
    activePiece.style.top  = `${y}px`;

    setHoverPosition(getBoardCoords(e.clientX, e.clientY));
  }

  function dropPiece(e: React.MouseEvent): void {
    e.preventDefault();
    if (promotionPawn) return;
    const activePiece = activePieceRef.current;
    if (!chessBoardRef.current) return;

    const dest = getBoardCoords(e.clientX, e.clientY);

    if (!activePiece && selectedPiece) {
      const clickedPiece = pieces.find((p) => p.position.isSamePosition(dest));
      if (clickedPiece?.team === selectedPiece.team) return; // clicked own piece — ignore
      executeMove(selectedPiece, dest);
      return;
    }

    if (!activePiece) return;

    if (grabPosition.isSamePosition(dest)) {
      resetActivePiece();
      updateSelectedPiece(pieces.find((p) => p.position.isSamePosition(grabPosition)));
      return;
    }

    const currentPiece = pieces.find((p) => p.position.isSamePosition(grabPosition));
    if (currentPiece) {
      executeMove(currentPiece, dest);
    } else {
      resetActivePiece();
    }

    activePieceRef.current = null;
    setHoverPosition(null);
  }

  function executeMove(piece: Piece, dest: Position): void {
    const isDragging = !!activePieceRef.current;

    const moved = playMove(
      piece,
      dest,
      handleAnimationStart,
      handlePromotionNeeded,
      isDragging,
    );

    if (moved) {
      setLastMove({ from: new Position(grabPositionRef.current.x, grabPositionRef.current.y), to: dest });
    } else if (activePieceRef.current) {
      resetActivePiece();
    }

    updateSelectedPiece(null);
    grabPositionRef.current = new Position(-1, -1);
  }

  const promotionBoxLeft = promotionPawn 
    ? promotionPawn.position.x * GRID_SIZE + boardOffset.left
    : 0;
  const promotionBoxTop = promotionPawn 
    ? (promotionPawn.team === TeamType.OUR ? 0 : 7 * GRID_SIZE) + boardOffset.top
    : 0;

  function handlePromote(pieceType: string): void {
    if (!promotionPawn) return;
    promotePawn(promotionPawn, pieceType);
    setPromotionPawn(null);
  }

  const board = [];

  for (let i = VERTICAL_AXIS.length - 1; i >= 0; i--) {
    for (let j = 0; j < HORIZONTAL_AXIS.length; j++) {
      const boardPosition = new Position(j, i);
      const piece       = pieces.find((p) => p.position.isSamePosition(boardPosition));
      const grabPiece_  = pieces.find((p) => p.position.isSamePosition(grabPosition));
      const hint        = grabPiece_?.possibleMoves?.some((p) => p.isSamePosition(boardPosition)) ?? false;
      const isAnimating = animatingPosition ? animatingPosition.from.isSamePosition(boardPosition) : false;

      board.push(
        <Tile
          key={HORIZONTAL_AXIS[j] + VERTICAL_AXIS[i]}
          number={j + i + 2}
          image={piece?.image}
          hint={hint}
          translateX={isAnimating ? animatingPosition!.translateX : 0}
          translateY={isAnimating ? animatingPosition!.translateY : 0}
          hovered={!!hoverPosition && hoverPosition.isSamePosition(boardPosition)}
          selected={!!selectedPiece && boardPosition.isSamePosition(grabPosition)}
          lastMoveFrom={!!lastMove && boardPosition.isSamePosition(lastMove.from)}
          lastMoveTo={!!lastMove && boardPosition.isSamePosition(lastMove.to)}
        />,
      );
    }
  }

  return (
    <>
      <div
        className="board"
        ref={chessBoardRef}
        onMouseDown={grabPiece}
        onMouseMove={movePiece}
        onMouseUp={dropPiece}
      >
        <PawnPromotionBox
          promotionPawn={promotionPawn}
          promotionBoxLeft={promotionBoxLeft}
          promotionBoxTop={promotionBoxTop}
          onPromote={handlePromote}
        />
        {board}
      </div>
    </>
  );
}