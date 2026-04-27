"use client";

import "../styles/board.css";
import Tile from "./Tile";
import PawnPromotionBox from "./PawnPromotionBox";
import { useRef, useState, useEffect } from "react";

import { Piece } from "../models/Piece";
import { Position } from "@/app/models/Position";
import { TeamType } from "../services/Types";
import {
  VERTICAL_AXIS,
  HORIZONTAL_AXIS,
  GRID_SIZE,
} from "../services/Constants";

interface Props {
  pieces: Piece[];
  playMove: (
    piece: Piece,
    destination: Position,
    onAnimationStart: (
      animations: {
        from: Position;
        translateX: number;
        translateY: number;
        variant?: "move" | "castle-king" | "castle-rook";
      }[],
    ) => void,
    onPromotionNeeded: (piece: Piece) => void,
    isDragging: boolean,
  ) => boolean;
  promotePawn: (promotionPawn: Piece, pieceType: string) => void;
}

type PieceAnimation = {
  from: Position;
  translateX: number;
  translateY: number;
  variant?: "move" | "castle-king" | "castle-rook";
};

export default function Board({ pieces, playMove, promotePawn }: Props) {
  const [grabPosition, setGrabPosition]       = useState<Position>(new Position(-1, -1));
  const [selectedPiece, setSelectedPiece]     = useState<Piece | null>(null);
  const [promotionPawn, setPromotionPawn]     = useState<Piece | null>(null);
  const [hoverPosition, setHoverPosition]     = useState<Position | null>(null);
  const [lastMove, setLastMove]               = useState<{ from: Position; to: Position } | null>(null);
  const [animatingPieces, setAnimatingPieces] = useState<PieceAnimation[]>([]);
  const [boardOffset, setBoardOffset]         = useState<{ left: number; top: number }>({ left: 0, top: 0 });

  const chessBoardRef    = useRef<HTMLDivElement>(null);
  const activePieceRef   = useRef<HTMLElement | null>(null);
  const selectedPieceRef = useRef<Piece | null>(null);
  const grabPositionRef  = useRef<Position>(new Position(-1, -1));
  const hasDraggedRef    = useRef<boolean>(false);

  useEffect(() => {
    if (promotionPawn && chessBoardRef.current) {
      setBoardOffset({
        left: chessBoardRef.current.offsetLeft,
        top:  chessBoardRef.current.offsetTop,
      });
    }
  }, [promotionPawn]);

  function updateSelectedPiece(piece: Piece | null | undefined) {
    selectedPieceRef.current = piece ?? null;
    setSelectedPiece(piece ?? null);
  }

  function updateGrabPosition(pos: Position) {
    grabPositionRef.current = pos;
    setGrabPosition(pos);
  }

  function resetActivePiece() {
    const activePiece = activePieceRef.current;
    if (activePiece) {
      activePiece.style.position = "relative";
      activePiece.style.removeProperty("top");
      activePiece.style.removeProperty("left");
      activePiece.style.removeProperty("z-index");
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

  function handleAnimationStart(animations: PieceAnimation[]) {
    setAnimatingPieces(animations);
    setTimeout(() => setAnimatingPieces([]), 260);
  }

  function handlePromotionNeeded(piece: Piece) {
    setPromotionPawn(piece);
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
      setLastMove({
        from: grabPositionRef.current.clone(),
        to:   dest.clone(),
      });
    } else {
      resetActivePiece();
    }

    updateSelectedPiece(null);
    updateGrabPosition(new Position(-1, -1));
    activePieceRef.current = null;
    setHoverPosition(null);
  }

  function grabPiece(e: React.MouseEvent): void {
  if (promotionPawn) return;
  e.preventDefault();

  const element = (e.target as HTMLElement).closest(".chess-piece") as HTMLElement | null;
  if (!element || !chessBoardRef.current) return;

  const pos          = getBoardCoords(e.clientX, e.clientY);
  const clickedPiece = pieces.find((p) => p.position.isSamePosition(pos));

  if (!clickedPiece) return;

  updateGrabPosition(pos);
  updateSelectedPiece(clickedPiece);
  hasDraggedRef.current = false;

  const tileRect = element.parentElement!.getBoundingClientRect();

  element.style.position = "absolute";
  element.style.left     = `${e.clientX - tileRect.left - GRID_SIZE / 2}px`;
  element.style.top      = `${e.clientY - tileRect.top  - GRID_SIZE / 2}px`;
  element.style.zIndex = "1000";
  activePieceRef.current = element;
}

 function movePiece(e: React.MouseEvent): void {
  e.preventDefault();
  const activePiece = activePieceRef.current;
  const chessBoard  = chessBoardRef.current;
  if (!activePiece || !chessBoard) return;

  hasDraggedRef.current = true;

  const tileRect  = activePiece.parentElement!.getBoundingClientRect();
  const boardRect = chessBoard.getBoundingClientRect();

  const x = e.clientX - tileRect.left - GRID_SIZE / 2;
  const y = e.clientY - tileRect.top  - GRID_SIZE / 2;

  const minX = boardRect.left - tileRect.left - GRID_SIZE / 2;
  const minY = boardRect.top  - tileRect.top  - GRID_SIZE / 2;
  const maxX = boardRect.right  - tileRect.left - GRID_SIZE / 2;
  const maxY = boardRect.bottom - tileRect.top  - GRID_SIZE / 2;

  activePiece.style.left = `${Math.min(Math.max(x, minX), maxX)}px`;
  activePiece.style.top  = `${Math.min(Math.max(y, minY), maxY)}px`;

  setHoverPosition(getBoardCoords(e.clientX, e.clientY));
}

  function dropPiece(e: React.MouseEvent): void {
    e.preventDefault();
    if (promotionPawn) return;

    const dest        = getBoardCoords(e.clientX, e.clientY);
    const wasDragged  = hasDraggedRef.current;
    const activePiece = activePieceRef.current;

    if (wasDragged && activePiece) {
      if (!grabPositionRef.current.isSamePosition(dest)) {
        const currentPiece = pieces.find((p) =>
          p.position.isSamePosition(grabPositionRef.current),
        );
        if (currentPiece) {
          executeMove(currentPiece, dest);
        } else {
          resetActivePiece();
          updateSelectedPiece(null);
        }
      } else {
        resetActivePiece();
        updateSelectedPiece(
          pieces.find((p) => p.position.isSamePosition(grabPositionRef.current)),
        );
      }
      activePieceRef.current = null;
      setHoverPosition(null);
      return;
    }

    resetActivePiece();
    activePieceRef.current = null;

    const clickedPiece = pieces.find((p) => p.position.isSamePosition(dest));

    if (selectedPieceRef.current) {
        if (clickedPiece && clickedPiece.team === selectedPieceRef.current.team) {
        updateGrabPosition(dest);
        updateSelectedPiece(clickedPiece);
        return;
      }

      const pieceToMove = pieces.find((p) =>
        p.position.isSamePosition(grabPositionRef.current),
      );

      if (pieceToMove) {
        executeMove(pieceToMove, dest);
        return;
      }
    } 

    if (clickedPiece) {
      updateGrabPosition(dest);
      updateSelectedPiece(clickedPiece);
    } else {
      updateSelectedPiece(null);
      updateGrabPosition(new Position(-1, -1));
    }
  }

  function handlePromote(pieceType: string): void {
    if (!promotionPawn) return;
    promotePawn(promotionPawn, pieceType);
    setPromotionPawn(null);
  }

  const promotionBoxLeft = promotionPawn
    ? promotionPawn.position.x * GRID_SIZE + boardOffset.left
    : 0;
  const promotionBoxTop = promotionPawn
  ? promotionPawn.team === TeamType.OUR
    ? boardOffset.top
    : boardOffset.top + 7 * GRID_SIZE - 3 * GRID_SIZE
  : 0;

  const board = [];

  for (let i = VERTICAL_AXIS.length - 1; i >= 0; i--) {
    for (let j = 0; j < HORIZONTAL_AXIS.length; j++) {
      const boardPosition = new Position(j, i);
      const piece         = pieces.find((p) => p.position.isSamePosition(boardPosition));
      const hint          = selectedPiece?.possibleMoves?.some((p) => p.isSamePosition(boardPosition)) ?? false;
      const animation     = animatingPieces.find(({ from }) => from.isSamePosition(boardPosition));
      const isAnimating   = !!animation;
      const isSelected    = !!selectedPiece && boardPosition.isSamePosition(grabPosition);

      board.push(
        <Tile
          key={HORIZONTAL_AXIS[j] + VERTICAL_AXIS[i]}
          number={j + i + 2}
          image={piece?.image}
          hint={hint}
          translateX={isAnimating ? animation!.translateX : 0}
          translateY={isAnimating ? animation!.translateY : 0}
          animationVariant={animation?.variant}
          hovered={!!hoverPosition && hoverPosition.isSamePosition(boardPosition)}
          selected={isSelected}
          lastMoveFrom={!!lastMove && boardPosition.isSamePosition(lastMove.from)}
          lastMoveTo={!!lastMove && boardPosition.isSamePosition(lastMove.to)}
        />,
      );
    }
  }

  return (
    <div
      className="board"
      ref={chessBoardRef}
      onMouseDown={grabPiece}
      onMouseMove={movePiece}
      onMouseUp={dropPiece}
      onDragStart={(e) => e.preventDefault()}
    >
      <PawnPromotionBox
        promotionPawn={promotionPawn}
        promotionBoxLeft={promotionBoxLeft}
        promotionBoxTop={promotionBoxTop}
        onPromote={handlePromote}
      />
      {board}
    </div>
  );
}
