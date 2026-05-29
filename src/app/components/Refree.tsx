"use client";

import "../styles/referee.css";
import { useState, useRef } from "react";
import { Piece } from "../models/Piece";
import { Position } from "../models/Position";
import { TeamType, PieceType, MoveResult } from "../services/Types";
import { initialBoard, playSound, GRID_SIZE } from "../services/Constants";
import { Chessboard } from "../models/Chessboard";
import { Pawn } from "../models/Pawn";
import { Move } from "../models/Move";

import Board from "./Board";
import EvaluationBar from "./EvaluationBar";
import Menu from "./Menu";

type PieceAnimation = {
  from: Position;
  translateX: number;
  translateY: number;
  variant?: "move" | "castle-king" | "castle-rook";
};

export default function Referee() {
  const [board, setBoard] = useState<Chessboard>(() => {
    const b = initialBoard.clone();
    b.calculateAllMoves();
    return b;
  });

  const [gameEnded, setGameEnded] = useState<boolean>(false);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [historyLength, setHistoryLength] = useState<number>(1);
  const [isBoardFlipped, setIsBoardFlipped] = useState<boolean>(false);
  const [replayAnimation, setReplayAnimation] = useState<{
    id: number;
    animations: PieceAnimation[];
    lastMove: { from: Position; to: Position };
  } | null>(null);

  const boardRef = useRef<Chessboard>(board);
  const boardTimelineRef = useRef<Chessboard[]>([board.clone()]);
  const historyIndexRef = useRef<number>(0);
  const replayAnimationIdRef = useRef<number>(0);
  const navigationInProgressRef = useRef<boolean>(false);
  const pendingPromotionRef = useRef<{
    piece: Piece;
    destination: Position;
    enPassant: boolean;
    valid: boolean;
    isCapture: boolean;
  } | null>(null);

  function syncBoard(newBoard: Chessboard) {
    boardRef.current = newBoard;
    setBoard(newBoard);
  }

  function hasGameEnded(currentBoard: Chessboard): boolean {
    const lastMove = currentBoard.moves[currentBoard.moves.length - 1];
    return (
      lastMove?.moveType === MoveResult.CHECKMATE ||
      lastMove?.moveType === MoveResult.STALEMATE ||
      lastMove?.moveType === MoveResult.DRAW
    );
  }

  function commitBoard(newBoard: Chessboard): void {
    const nextIndex = historyIndexRef.current + 1;
    boardTimelineRef.current = [
      ...boardTimelineRef.current.slice(0, nextIndex),
      newBoard.clone(),
    ];
    historyIndexRef.current = nextIndex;
    setHistoryIndex(nextIndex);
    setHistoryLength(boardTimelineRef.current.length);
    syncBoard(newBoard);
  }

  function getMoveAnimation(move: Move, direction: -1 | 1): PieceAnimation[] {
    const from = direction === 1 ? move.fromPosition : move.toPosition;
    const to = direction === 1 ? move.toPosition : move.fromPosition;
    const animations: PieceAnimation[] = [
      {
        from: from.clone(),
        translateX: (to.x - from.x) * GRID_SIZE,
        translateY: (from.y - to.y) * GRID_SIZE,
        variant: "move",
      },
    ];

    if (move.moveType !== MoveResult.CASTLE) return animations;

    const isKingSideCastle = move.toPosition.x > move.fromPosition.x;
    const originalRookPosition = new Position(
      isKingSideCastle ? 7 : 0,
      move.fromPosition.y,
    );
    const castledRookPosition = new Position(
      move.toPosition.x + (isKingSideCastle ? -1 : 1),
      move.toPosition.y,
    );
    const rookFrom =
      direction === 1 ? originalRookPosition : castledRookPosition;
    const rookTo =
      direction === 1 ? castledRookPosition : originalRookPosition;

    animations[0].variant = "castle-king";
    animations.push({
      from: rookFrom,
      translateX: (rookTo.x - rookFrom.x) * GRID_SIZE,
      translateY: (rookFrom.y - rookTo.y) * GRID_SIZE,
      variant: "castle-rook",
    });

    return animations;
  }

  function playReplaySound(move: Move, direction: -1 | 1): void {
    if (
      direction === -1 &&
      (
        move.moveType === MoveResult.CHECK ||
        move.moveType === MoveResult.CHECKMATE ||
        move.moveType === MoveResult.STALEMATE ||
        move.moveType === MoveResult.DRAW
      )
    ) {
      playSound(
        move.team === TeamType.OUR ? "move-self.mp3" : "move-opponent.mp3",
      );
      return;
    }

    switch (move.moveType) {
      case MoveResult.CAPTURE:
      case MoveResult.EN_PASSANT:
        playSound("capture.mp3");
        break;
      case MoveResult.CHECK:
      case MoveResult.CHECKMATE:
        playSound("move-check.mp3");
        break;
      case MoveResult.CASTLE:
        playSound("castle.mp3");
        break;
      case MoveResult.STALEMATE:
      case MoveResult.DRAW:
        playSound("game-end.mp3");
        break;
      default:
        playSound(
          move.team === TeamType.OUR ? "move-self.mp3" : "move-opponent.mp3",
        );
        break;
    }
  }

  function navigateMove(direction: -1 | 1): void {
    if (navigationInProgressRef.current) return;

    const nextIndex = historyIndexRef.current + direction;
    if (nextIndex < 0 || nextIndex >= boardTimelineRef.current.length) return;

    const nextBoard = boardTimelineRef.current[nextIndex].clone();
    const currentBoard = boardRef.current;
    const move =
      direction === 1
        ? nextBoard.moves[nextBoard.moves.length - 1]
        : currentBoard.moves[currentBoard.moves.length - 1];

    if (!move) {
      historyIndexRef.current = nextIndex;
      setHistoryIndex(nextIndex);
      setGameEnded(hasGameEnded(nextBoard));
      syncBoard(nextBoard);
      return;
    }

    pendingPromotionRef.current = null;
    navigationInProgressRef.current = true;
    replayAnimationIdRef.current += 1;
    setReplayAnimation({
      id: replayAnimationIdRef.current,
      animations: getMoveAnimation(move, direction),
      lastMove: {
        from: move.fromPosition.clone(),
        to: move.toPosition.clone(),
      },
    });
    playReplaySound(move, direction);

    setTimeout(() => {
      historyIndexRef.current = nextIndex;
      setHistoryIndex(nextIndex);
      setGameEnded(hasGameEnded(nextBoard));
      syncBoard(nextBoard);
      setReplayAnimation(null);
      navigationInProgressRef.current = false;
    }, 260);
  }

  function lockBoard(result: MoveResult): void {
    if (
      result === MoveResult.CHECKMATE ||
      result === MoveResult.STALEMATE ||
      result === MoveResult.DRAW
    ) {
      setGameEnded(true);
    }
  }

  function clearPossibleMoves(newBoard: Chessboard): void {
    for (const piece of newBoard.pieces) {
      piece.possibleMoves = [];
    }
  }

  function playPromotionSound(result: MoveResult, isCapture: boolean): void {
    switch (result) {
      case MoveResult.CHECK:
        playSound("move-check.mp3");
        break;
      case MoveResult.CHECKMATE:
        playSound("move-check.mp3");
        setTimeout(() => {
          playSound("game-end.mp3");
        }, 350);
        break;
      case MoveResult.STALEMATE:
      case MoveResult.DRAW:
        playSound("game-end.mp3");
        break;
      case MoveResult.CAPTURE:
        if (isCapture) {
          setTimeout(() => {
            playSound("capture.mp3");
          }, 350);
        }
        break;
      default:
        playSound("promote.mp3");
        break;
    }
  }

  function isEnPassantMove(
    initialPosition: Position,
    desiredPosition: Position,
    type: PieceType,
    team: TeamType,
  ): boolean {
    if (type !== PieceType.PAWN) return false;

    const pawnDirection = team === TeamType.OUR ? 1 : -1;
    const isDiagonal =
      Math.abs(desiredPosition.x - initialPosition.x) === 1 &&
      desiredPosition.y - initialPosition.y === pawnDirection;

    if (!isDiagonal) return false;

    return boardRef.current.pieces.some(
      (p) =>
        p.position.x === desiredPosition.x &&
        p.position.y === desiredPosition.y - pawnDirection &&
        p.team !== team &&
        (p as Pawn).enPassant,
    );
  }

  function playMove(
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
  ): "moved" | "pending-promotion" | false {
    if (navigationInProgressRef.current) return false;
    if (gameEnded) return false;
    if (piece.team === TeamType.OUR && board.totalTurns % 2 !== 1) return false;
    if (piece.team === TeamType.OPPONENT && board.totalTurns % 2 !== 0)
      return false;

    if (piece.possibleMoves === undefined) return false;

    const currentBoard = boardRef.current;

    const currentPiece = currentBoard.pieces.find((p) =>
      p.position.isSamePosition(piece.position),
    );

    if (!currentPiece || !currentPiece.possibleMoves) return false;

    const enPassant = isEnPassantMove(
      currentPiece.position,
      destination,
      currentPiece.type,
      currentPiece.team,
    );

    const valid = currentPiece.possibleMoves.some((m) =>
      m.isSamePosition(destination),
    );

    if (!enPassant && !valid) return false;

    const promotionRow = currentPiece.team === TeamType.OUR ? 7 : 0;
    const isPromotion =
      currentPiece.type === PieceType.PAWN && destination.y === promotionRow;

    if (isPromotion) {
      const targetPiece = currentBoard.pieces.find(
        (p) =>
          p.position.isSamePosition(destination) &&
          p.team !== currentPiece.team,
      );

      pendingPromotionRef.current = {
        piece: currentPiece.clone(),
        destination: destination.clone(),
        enPassant,
        valid,
        isCapture: !!targetPiece || enPassant,
      };

      onPromotionNeeded(
        new Piece(destination.clone(), PieceType.PAWN, currentPiece.team, true),
      );

      return "pending-promotion";
    }

    if (!isDragging) {
      const animations: {
        from: Position;
        translateX: number;
        translateY: number;
        variant?: "move" | "castle-king" | "castle-rook";
      }[] = [
        {
          from: currentPiece.position.clone(),
          translateX: (destination.x - currentPiece.position.x) * GRID_SIZE,
          translateY: (currentPiece.position.y - destination.y) * GRID_SIZE,
          variant: "move",
        },
      ];

      if (
        currentPiece.isKing &&
        Math.abs(destination.x - currentPiece.position.x) > 1
      ) {
        const isKingSideCastle = destination.x > currentPiece.position.x;
        const rookFrom = new Position(
          isKingSideCastle ? 7 : 0,
          currentPiece.position.y,
        );
        const rookTo = new Position(
          destination.x + (isKingSideCastle ? -1 : 1),
          destination.y,
        );

        animations[0].variant = "castle-king";
        animations.push({
          from: rookFrom,
          translateX: (rookTo.x - rookFrom.x) * GRID_SIZE,
          translateY: (rookFrom.y - rookTo.y) * GRID_SIZE,
          variant: "castle-rook",
        });
      }

      onAnimationStart(animations);
    }

    setTimeout(
      () => {
        const newBoard = boardRef.current.clone();

        const result = newBoard.playMove(
          enPassant,
          valid,
          currentPiece,
          destination,
        );

        if (result === MoveResult.INVALID) return;

        lockBoard(result);

        const targetPiece = boardRef.current.pieces.find(
          (p) =>
            p.position.isSamePosition(destination) &&
            p.team !== currentPiece.team,
        );
        const isCapture = !!targetPiece;

        switch (result) {
          case MoveResult.CAPTURE:
          case MoveResult.EN_PASSANT:
            playSound("capture.mp3");
            break;
          case MoveResult.CHECKMATE:
            playSound("move-check.mp3");
            setTimeout(() => {
              playSound("game-end.mp3");
            }, 350);
            break;
          case MoveResult.STALEMATE:
            playSound(
              currentPiece.team === TeamType.OUR
                ? "move-self.mp3"
                : "move-opponent.mp3",
            );
            playSound("game-end.mp3");
            break;
          case MoveResult.DRAW:
            const hasCheck = newBoard.isKingInAttack();

            if (isCapture && hasCheck) {
              playSound("capture.mp3");
              setTimeout(() => {
                playSound("move-check.mp3");
                setTimeout(() => {
                  playSound("game-end.mp3");
                }, 350);
              }, 350);
            } else if (isCapture) {
              playSound("capture.mp3");
              setTimeout(() => {
                playSound("game-end.mp3");
              }, 350);
            } else if (hasCheck) {
              playSound("move-check.mp3");
              setTimeout(() => {
                playSound("game-end.mp3");
              }, 350);
            } else {
              playSound("game-end.mp3");
            }
            break;
          case MoveResult.CHECK:
            playSound("move-check.mp3");
            break;
          case MoveResult.CASTLE:
            playSound("castle.mp3");
            break;
          case MoveResult.MOVE:
            playSound(
              currentPiece.team === TeamType.OUR
                ? "move-self.mp3"
                : "move-opponent.mp3",
            );
            break;
        }

        newBoard.calculateAllMoves();
        if (hasGameEnded(newBoard)) {
          clearPossibleMoves(newBoard);
        }
        commitBoard(newBoard);
      },
      isDragging ? 0 : 260,
    );

    return "moved";
  }

  function promotePawn(promotionPawn: Piece, pieceType: string): void {
    const typeMap: Record<string, PieceType> = {
      q: PieceType.QUEEN,
      r: PieceType.ROOK,
      b: PieceType.BISHOP,
      n: PieceType.KNIGHT,
    };

    const selectedType = typeMap[pieceType.toLowerCase()];
    if (selectedType === undefined) return;

    const pendingPromotion = pendingPromotionRef.current;
    const newBoard = boardRef.current.clone();

    if (pendingPromotion) {
      const result = newBoard.playMove(
        pendingPromotion.enPassant,
        pendingPromotion.valid,
        pendingPromotion.piece,
        pendingPromotion.destination,
      );

      if (result === MoveResult.INVALID) return;

      const movedPawn = newBoard.pieces.find((p) =>
        p.position.isSamePosition(pendingPromotion.destination),
      );

      if (!movedPawn) return;

      newBoard.promotePawn(movedPawn, selectedType);
      const promotionResult =
        newBoard.moves[newBoard.moves.length - 1]?.moveType ?? result;

      lockBoard(promotionResult);
      newBoard.calculateAllMoves();
      if (hasGameEnded(newBoard)) {
        clearPossibleMoves(newBoard);
      }
      pendingPromotionRef.current = null;
      playPromotionSound(promotionResult, pendingPromotion.isCapture);
      commitBoard(newBoard);
      return;
    }

    newBoard.promotePawn(promotionPawn, selectedType);
    newBoard.calculateAllMoves();
    playSound("promote.mp3");
    commitBoard(newBoard);
  }

  function cancelPromotion(): void {
    pendingPromotionRef.current = null;
  }

  const toggleBoard = () => setIsBoardFlipped((flipped) => !flipped);

  return (
    <>
      <main>
        <EvaluationBar fen={board.toFen()} flipped={isBoardFlipped} />

        <Board
          pieces={board.pieces}
          flipped={isBoardFlipped}
          replayAnimation={replayAnimation}
          playMove={playMove}
          promotePawn={promotePawn}
          cancelPromotion={cancelPromotion}
        />

        <Menu
          board={board}
          historyIndex={historyIndex}
          historyLength={historyLength}
          flipped={isBoardFlipped}
          onNavigateMove={navigateMove}
          onToggleBoard={toggleBoard}
        />
      </main>
    </>
  );
}
