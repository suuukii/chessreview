"use client";

import "../styles/board.css";
import Tile from "./Tile";
import PawnPromotionBox from "./PawnPromotionBox";
import { useRef, useState } from "react";
import Referee from "../services/Referee";

import {
  VERTICAL_AXIS,
  HORIZONTAL_AXIS,
  Piece,
  PieceType,
  TeamType,
  initialBoardState,
  Position,
  GRID_SIZE,
  isSamePosition,
  playSound,
} from "../services/Constants";

export default function Board() {
  const board = [];
  const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
  const [grabPosition, setGrabPosition] = useState<Position>({ x: -1, y: -1 });
  const [pieces, setPieces] = useState<Piece[]>(initialBoardState);
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [promotionPawn, setPromotionPawn] = useState<Piece | null>(null);
  const chessBoardRef = useRef<HTMLDivElement>(null);
  const [hoverPosition, setHoverPosition] = useState<Position | null>(null);
  const selectedPieceRef = useRef<Piece | null>(null);
  const grabPositionRef = useRef<Position>({ x: -1, y: -1 });
  const [animatingPosition, setAnimatingPosition] = useState<{
    from: Position;
    translateX: number;
    translateY: number;
  } | null>(null);

  const referee = new Referee();

  function updateValidMove() {
    setPieces((currentPieces) => {
      return currentPieces.map((p) => {
        p.possibleMoves = referee.getValidMove(p, currentPieces);
        return p;
      });
    });
  }

  function updateSelectedPiece(piece: Piece | null | undefined) {
    selectedPieceRef.current = piece ?? null;
    setSelectedPiece(piece ?? null);
  }

  function grabPiece(e: React.MouseEvent): void {
  if (promotionPawn) return;

  updateValidMove();

  const element = e.target as HTMLElement;
  const chessBoard = chessBoardRef.current;
  if (element.classList.contains("chess-piece") && chessBoard) {
    const grabX = Math.floor((e.clientX - chessBoard.offsetLeft) / GRID_SIZE);
    const grabY = Math.abs(
      Math.ceil((e.clientY - chessBoard.offsetTop - 800) / GRID_SIZE),
    );

    grabPositionRef.current = { x: grabX, y: grabY };
    setGrabPosition({ x: grabX, y: grabY });

    const clickedPiece = pieces.find((p) =>
      isSamePosition(p.position, { x: grabX, y: grabY }),
    );

    if (selectedPiece && clickedPiece?.team === selectedPiece.team) {
      grabPositionRef.current = { x: grabX, y: grabY };
      setGrabPosition({ x: grabX, y: grabY });
      updateSelectedPiece(clickedPiece ?? null);
      return;
    }

    updateSelectedPiece(clickedPiece ?? null);

    const x = e.clientX - GRID_SIZE / 2;
    const y = e.clientY - GRID_SIZE / 2;

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

      const hoverX = Math.floor(
        (e.clientX - chessBoard.offsetLeft) / GRID_SIZE,
      );
      const hoverY = Math.abs(
        Math.ceil((e.clientY - chessBoard.offsetTop - 800) / GRID_SIZE),
      );
      setHoverPosition({ x: hoverX, y: hoverY });
    }
  }

  function dropPiece(e: React.MouseEvent): void {
    if (promotionPawn) return;

    const chessBoard = chessBoardRef.current;
    if (!chessBoard) return;

    const x = Math.floor((e.clientX - chessBoard.offsetLeft) / GRID_SIZE);
    const y = Math.abs(
      Math.ceil((e.clientY - chessBoard.offsetTop - 800) / GRID_SIZE),
    );

    if (!activePiece && selectedPiece) {
  const clickedPiece = pieces.find((p) =>
    isSamePosition(p.position, { x, y }),
  );

  if (clickedPiece && clickedPiece.team === selectedPiece.team) {
    return;
  }

  executeMove(selectedPiece, x, y);
  return;
}

    if (activePiece) {
      if (isSamePosition(grabPosition, { x, y })) {
        activePiece.style.position = "relative";
        activePiece.style.removeProperty("top");
        activePiece.style.removeProperty("left");
        setActivePiece(null);
        updateSelectedPiece(
          pieces.find((p) => isSamePosition(p.position, grabPosition)) ?? null,
        );
        return;
      }

      const currentPiece = pieces.find((p) =>
        isSamePosition(p.position, grabPosition),
      );

      if (currentPiece) {
        executeMove(currentPiece, x, y);
      } else {
        activePiece.style.position = "relative";
        activePiece.style.removeProperty("top");
        activePiece.style.removeProperty("left");
      }
      setActivePiece(null);
      setHoverPosition(null);
    }
  }

  function executeMove(piece: Piece, x: number, y: number): void {
    const isEnPassantMove = referee.isEnPassantMove(
      grabPosition,
      { x, y },
      pieces,
      piece.type,
      piece.team,
    );
    const isValidMove = referee.isValidMove(
      grabPosition,
      { x, y },
      piece.type,
      piece.team,
      pieces,
    );
    const pawnDirection = piece.team === TeamType.OUR ? 1 : -1;
    const isDragging = !!activePiece;

    if (isEnPassantMove || isValidMove) {
      if (!isDragging) {
        const translateX = (x - grabPosition.x) * GRID_SIZE;
        const translateY = (grabPosition.y - y) * GRID_SIZE;

        setAnimatingPosition({
          from: { ...grabPosition },
          translateX,
          translateY,
        });
      }

      setTimeout(
        () => {
          setAnimatingPosition(null);

          if (isEnPassantMove) {
            const updatedPieces = pieces.reduce((results, piece) => {
              if (isSamePosition(piece.position, grabPosition)) {
                piece.enPassant = false;
                piece.position.x = x;
                piece.position.y = y;
                results.push(piece);
              } else if (
                !isSamePosition(piece.position, { x, y: y - pawnDirection })
              ) {
                if (piece.type === PieceType.PAWN) piece.enPassant = false;
                results.push(piece);
              }
              return results;
            }, [] as Piece[]);
            setPieces(updatedPieces);
            playSound("capture.mp3");
          } else if (isValidMove) {
            const targetPiece = pieces.find((p) =>
              isSamePosition(p.position, { x, y }),
            );
            const capture = targetPiece && targetPiece.team !== piece.team;

            const updatedPieces = pieces.reduce((results, piece) => {
              if (isSamePosition(piece.position, grabPosition)) {
                piece.enPassant =
                  Math.abs(grabPosition.y - y) === 2 &&
                  piece.type === PieceType.PAWN;
                piece.position.x = x;
                piece.position.y = y;
                const promotionRow: number =
                  piece.team === TeamType.OUR ? 7 : 0;
                if (y === promotionRow && piece.type === PieceType.PAWN)
                  setPromotionPawn(piece);
                results.push(piece);
              } else if (!isSamePosition(piece.position, { x, y })) {
                if (piece.type === PieceType.PAWN) piece.enPassant = false;
                results.push(piece);
              }
              return results;
            }, [] as Piece[]);

            setPieces(updatedPieces);

            if (capture) playSound("capture.mp3");
            else if (piece.team === TeamType.OUR) playSound("move-self.mp3");
            else if (piece.team === TeamType.OPPONENT)
              playSound("move-opponent.mp3");
          }
        },
        isDragging ? 0 : 100,
      );
    } else {
      if (activePiece) {
        activePiece.style.position = "relative";
        activePiece.style.removeProperty("top");
        activePiece.style.removeProperty("left");
      }
    }

    updateSelectedPiece(null);
  }

  const chessBoard = chessBoardRef.current;

  const promotionBoxLeft = promotionPawn
    ? (chessBoard?.offsetLeft ?? 0) + promotionPawn.position.x * GRID_SIZE
    : 0;
  const promotionBoxTop =
    promotionPawn?.team === TeamType.OUR
      ? (chessBoard?.offsetTop ?? 0)
      : (chessBoard?.offsetTop ?? 0) + 7 * GRID_SIZE;

  function promotePawn(pieceType: string): void {
    if (!promotionPawn) return;

    const typeMap: Record<string, PieceType> = {
      q: PieceType.QUEEN,
      r: PieceType.ROOK,
      b: PieceType.BISHOP,
      n: PieceType.KNIGHT,
    };

    const updatedPieces = pieces.map((p) => {
      if (isSamePosition(p.position, promotionPawn.position)) {
        const team = promotionPawn.team === TeamType.OUR ? "w" : "b";
        return {
          ...p,
          type: typeMap[pieceType],
          image: `/imgs/pieces/${team}${pieceType}.png`,
        };
      }
      return p;
    });

    playSound("promote.mp3");
    setPieces(updatedPieces);
    setPromotionPawn(null);
  }

  for (let i = VERTICAL_AXIS.length - 1; i >= 0; i--) {
    for (let j = 0; j < HORIZONTAL_AXIS.length; j++) {
      const number = j + i + 2;
      const piece = pieces.find((p) =>
        isSamePosition(p.position, { x: j, y: i }),
      );
      const image = piece ? piece.image : undefined;
      const currentPiece = pieces.find((p) =>
        isSamePosition(p.position, grabPosition),
      );
      const hint = currentPiece?.possibleMoves
        ? currentPiece.possibleMoves.some((p) =>
            isSamePosition(p, { x: j, y: i }),
          )
        : false;

      const isAnimating = animatingPosition
        ? isSamePosition(animatingPosition.from, { x: j, y: i })
        : false;

      const isHovered =
        hoverPosition && activePiece
          ? isSamePosition(hoverPosition, { x: j, y: i })
          : false;

      const isSelected = selectedPieceRef.current
        ? isSamePosition({ x: j, y: i }, grabPositionRef.current)
        : false;

      board.push(
        <Tile
          number={number}
          image={image}
          key={HORIZONTAL_AXIS[j] + VERTICAL_AXIS[i]}
          hint={hint}
          translateX={isAnimating ? animatingPosition!.translateX : 0}
          translateY={isAnimating ? animatingPosition!.translateY : 0}
          hovered={isHovered}
          selected={isSelected}
        />,
      );
    }
  }

  return (
    <>
      <PawnPromotionBox
        promotionPawn={promotionPawn}
        promotionBoxLeft={promotionBoxLeft}
        promotionBoxTop={promotionBoxTop}
        onPromote={promotePawn}
      />
      <div
        onMouseDown={(e) => grabPiece(e)}
        onMouseMove={(e) => movePiece(e)}
        onMouseUp={(e) => dropPiece(e)}
        className="board"
        ref={chessBoardRef}
      >
        {board}
      </div>
    </>
  );
}
