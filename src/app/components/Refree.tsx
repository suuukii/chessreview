"use client";

import "../styles/referee.css";
import { useState, useRef } from "react";
import { Piece } from "../models/Piece";
import { Position } from "../models/Position";
import { TeamType, PieceType, MoveResult } from "../services/Types";
import { initialBoard, playSound, GRID_SIZE } from "../services/Constants";
import { Chessboard } from "../models/Chessboard";
import { Pawn } from "../models/Pawn";

import Board from "./Board";

export default function Referee() {
  const [board, setBoard] = useState<Chessboard>(() => {
    const b = initialBoard.clone();
    b.calculateAllMoves();
    return b;
  });

  const [gameEnded, setGameEnded] = useState<boolean>(false);

  const boardRef = useRef<Chessboard>(board);
  const pendingPromotionRef = useRef<{
    piece: Piece;
    destination: Position;
    enPassant: boolean;
    valid: boolean;
    isCapture: boolean;
  } | null>(null);

  const whitePieces: Record<PieceType, string> = {
    [PieceType.BISHOP]: "n",
    [PieceType.KING]: "l",
    [PieceType.QUEEN]: "w",
    [PieceType.ROOK]: "t",
    [PieceType.KNIGHT]: "j",
    [PieceType.PAWN]: "",
  };

  const blackPieces: Record<PieceType, string> = {
    [PieceType.BISHOP]: "b",
    [PieceType.KING]: "k",
    [PieceType.QUEEN]: "q",
    [PieceType.ROOK]: "r",
    [PieceType.KNIGHT]: "h",
    [PieceType.PAWN]: "",
  };

  function syncBoard(newBoard: Chessboard) {
    boardRef.current = newBoard;
    setBoard(newBoard);
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
        syncBoard(newBoard);
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
      pendingPromotionRef.current = null;
      playPromotionSound(promotionResult, pendingPromotion.isCapture);
      syncBoard(newBoard);
      return;
    }

    newBoard.promotePawn(promotionPawn, selectedType);
    newBoard.calculateAllMoves();
    playSound("promote.mp3");
    syncBoard(newBoard);
  }

  function cancelPromotion(): void {
    pendingPromotionRef.current = null;
  }
  return (
    <>
      <main>
        <Board
          pieces={board.pieces}
          playMove={playMove}
          promotePawn={promotePawn}
          cancelPromotion={cancelPromotion}
        />

        <div className="menu">
          <p>Total Turns: {board.totalTurns - 1}</p>
          <p>
            Current Team:{" "}
            {board.currentTeam === TeamType.OPPONENT ? "Black" : "White"}
          </p>
          <div className="move-history">
            {(() => {
              const moves = board.moves;
              const moveRows = [];
              for (let i = 0; i < moves.length; i += 2) {
                const moveNumber = Math.floor(i / 2) + 1;
                const whiteMove = moves[i];
                const blackMove = moves[i + 1];
                moveRows.push(
                  <p key={moveNumber}>
                    <span className="move-number">{moveNumber}.</span>
                    <span className="move-text">
                      {whiteMove?.notation && (
                        <span>
                          <span className="piece-icon">
                            {whiteMove.moveType === MoveResult.CASTLE
                              ? ""
                              : whitePieces[whiteMove.piece]}
                          </span>
                          {whiteMove.notation}
                        </span>
                      )}
                    </span>
                    {blackMove?.notation && (
                      <span className="move-text">
                        <span className="piece-icon">
                          {blackMove.moveType === MoveResult.CASTLE
                            ? ""
                            : blackPieces[blackMove.piece]}
                        </span>
                        {blackMove.notation}
                      </span>
                    )}
                  </p>,
                );
              }
              return moveRows;
            })()}
          </div>
        </div>
      </main>
    </>
  );
}
