"use client";

import "../styles/board.css";
import Tile from "./Tile";
import PawnPromotionBox from "./PawnPromotionBox";
import { useRef, useState, useEffect } from "react";

import { Piece } from "../models/Piece";
import { Position } from "@/app/models/Position";
import {
  VERTICAL_AXIS,
  HORIZONTAL_AXIS,
  GRID_SIZE,
} from "../services/Constants";
import { MoveClassification, MoveResult, TeamType } from "../services/Types";
import { Move } from "../models/Move";

interface Props {
  pieces: Piece[];
  flipped: boolean;
  replayAnimation?: {
    id: number;
    animations: PieceAnimation[];
    lastMove: { from: Position; to: Position };
  } | null;
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
  ) => "moved" | "pending-promotion" | false;
  promotePawn: (promotionPawn: Piece, pieceType: string) => void;
  cancelPromotion: () => void;
  lastMoveResult?: Move | null;
}

type PieceAnimation = {
  from: Position;
  translateX: number;
  translateY: number;
  variant?: "move" | "castle-king" | "castle-rook";
};

const classificationIcons: Record<MoveClassification, string> = {
  [MoveClassification.BRILLIANT]: "/svgs/classifications/brilliant.svg",
  [MoveClassification.GREAT]: "/svgs/classifications/great.svg",
  [MoveClassification.BEST]: "/svgs/classifications/best.svg",
  [MoveClassification.BOOK]: "/svgs/classifications/book.svg",
  [MoveClassification.EXCELLENT]: "/svgs/classifications/excellent.svg",
  [MoveClassification.GOOD]: "/svgs/classifications/good.svg",
  [MoveClassification.MISS]: "/svgs/classifications/miss.svg",
  [MoveClassification.INACCURACY]: "/svgs/classifications/inaccuracy.svg",
  [MoveClassification.MISTAKE]: "/svgs/classifications/mistake.svg",
  [MoveClassification.BLUNDER]: "/svgs/classifications/blunder.svg",
};

export default function Board({
  pieces,
  flipped,
  replayAnimation,
  playMove,
  promotePawn,
  cancelPromotion,
  lastMoveResult,
}: Props) {
  const [grabPosition, setGrabPosition]       = useState<Position>(new Position(-1, -1));
  const [selectedPiece, setSelectedPiece]     = useState<Piece | null>(null);
  const [promotionPawn, setPromotionPawn]     = useState<Piece | null>(null);
  const [hoverPosition, setHoverPosition]     = useState<Position | null>(null);
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
    const rect = chessBoard.getBoundingClientRect();
    const visualX = Math.floor((clientX - rect.left) / GRID_SIZE);
    const visualY = Math.floor((clientY - rect.top) / GRID_SIZE);

    if (flipped) {
      return new Position(7 - visualX, visualY);
    }

    return new Position(visualX, 7 - visualY);
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

    const moveResult = playMove(
      piece,
      dest,
      handleAnimationStart,
      handlePromotionNeeded,
      isDragging,
    );

    if (moveResult === "pending-promotion") {
      resetActivePiece();
    } else if (moveResult === false) {
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

  if (
    selectedPieceRef.current &&
    !selectedPieceRef.current.position.isSamePosition(pos)
  ) {
    return;
  }

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

  function handleCancelPromotion(): void {
    cancelPromotion();
    setPromotionPawn(null);
  }

  function getPieceIcon(piece: Piece | undefined): string | undefined {
    if (!piece || !lastMoveResult) return undefined;

    if (piece.isKing) {
      if (
        lastMoveResult.moveType === MoveResult.DRAW ||
        lastMoveResult.moveType === MoveResult.STALEMATE
      ) {
        return piece.team === TeamType.OUR
          ? "/svgs/piece-icons/draw_white.svg"
          : "/svgs/piece-icons/draw_black.svg";
      }

      if (lastMoveResult.moveType === MoveResult.CHECKMATE) {
        if (piece.team === lastMoveResult.team) {
          return "/svgs/piece-icons/winner.svg";
        }

        return piece.team === TeamType.OUR
          ? "/svgs/piece-icons/checkmate_white.svg"
          : "/svgs/piece-icons/checkmate_black.svg";
      }
    }

    if (
      lastMoveResult.classification !== undefined &&
      piece.position.isSamePosition(lastMoveResult.toPosition)
    ) {
      return classificationIcons[lastMoveResult.classification];
    }

    return undefined;
  }

  function getMoveClassificationForTile(
    boardPosition: Position,
  ): MoveClassification | undefined {
    if (lastMoveResult?.classification === undefined) return undefined;

    if (
      boardPosition.isSamePosition(lastMoveResult.fromPosition) ||
      boardPosition.isSamePosition(lastMoveResult.toPosition)
    ) {
      return lastMoveResult.classification;
    }

    return undefined;
  }

  const promotionVisualX = promotionPawn
    ? flipped
      ? 7 - promotionPawn.position.x
      : promotionPawn.position.x
    : 0;
  const promotionVisualY = promotionPawn
    ? flipped
      ? promotionPawn.position.y
      : 7 - promotionPawn.position.y
    : 0;
  const promotionBoxLeft = promotionPawn
    ? promotionVisualX * GRID_SIZE + boardOffset.left
    : 0;
  const promotionBoxTop = promotionPawn
    ? boardOffset.top +
      (promotionVisualY <= 3 ? promotionVisualY : promotionVisualY - 3) *
        GRID_SIZE
    : 0;

  const board = [];
  const displayedAnimatingPieces =
    replayAnimation?.animations ?? animatingPieces;
  const displayedLastMove = replayAnimation?.lastMove
    ?? (lastMoveResult
      ? { from: lastMoveResult.fromPosition, to: lastMoveResult.toPosition }
      : null);

  const verticalIndexes = flipped
    ? VERTICAL_AXIS.map((_, index) => index)
    : VERTICAL_AXIS.map((_, index) => 7 - index);
  const horizontalIndexes = flipped
    ? HORIZONTAL_AXIS.map((_, index) => 7 - index)
    : HORIZONTAL_AXIS.map((_, index) => index);

  for (const i of verticalIndexes) {
    for (const j of horizontalIndexes) {
      const boardPosition = new Position(j, i);
      const piece         = pieces.find((p) => p.position.isSamePosition(boardPosition));
      const hint          = selectedPiece?.possibleMoves?.some((p) => p.isSamePosition(boardPosition)) ?? false;
      const animation     = displayedAnimatingPieces.find(({ from }) => from.isSamePosition(boardPosition));
      const isAnimating   = !!animation;
      const isSelected    = !!selectedPiece && boardPosition.isSamePosition(grabPosition);
      const pieceIcon     = getPieceIcon(piece);
      const moveClassification = getMoveClassificationForTile(boardPosition);

      board.push(
        <Tile
          key={HORIZONTAL_AXIS[j] + VERTICAL_AXIS[i]}
          number={j + i + 2}
          image={piece?.image}
          hint={hint}
          translateX={isAnimating ? animation!.translateX * (flipped ? -1 : 1) : 0}
          translateY={isAnimating ? animation!.translateY * (flipped ? -1 : 1) : 0}
          animationVariant={animation?.variant}
          hovered={!!hoverPosition && hoverPosition.isSamePosition(boardPosition)}
          selected={isSelected}
          lastMoveFrom={!!displayedLastMove && boardPosition.isSamePosition(displayedLastMove.from)}
          lastMoveTo={!!displayedLastMove && boardPosition.isSamePosition(displayedLastMove.to)}
          pieceIcon={pieceIcon}
          moveClassification={moveClassification}
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
        onCancel={handleCancelPromotion}
      />
      {board}
    </div>
  );
}
