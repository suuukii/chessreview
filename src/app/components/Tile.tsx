"use client";

import "../styles/tile.css"
import Image from "next/image";
import { MoveClassification } from "../services/Types";

interface Props {
  number: number;
  image: string | undefined;
  hint: boolean;
  translateX?: number;
  translateY?: number;
  animationVariant?: "move" | "castle-king" | "castle-rook";
  hovered?: boolean;
  selected?: boolean;
  lastMoveFrom?: boolean;
  lastMoveTo?: boolean;
  pieceIcon?: string;
  moveClassification?: MoveClassification;
}

export default function Tile({
  number,
  image,
  hint,
  translateX = 0,
  translateY = 0,
  animationVariant = "move",
  hovered,
  selected,
  lastMoveFrom,
  lastMoveTo,
  pieceIcon,
  moveClassification,
}: Props) {
  const classificationClass =
    moveClassification !== undefined
      ? `tile-classification-${MoveClassification[moveClassification].toLowerCase()}`
      : undefined;

  const className: string = [
    "tile",
    number % 2 === 0 && "black-tile",
    number % 2 !== 0 && "white-tile",
    hint && "tile-hint",
    image && "chess-piece-tile",
    hovered && "tile-hovered",
    selected && "tile-selected",
    lastMoveFrom && "tile-last-move-from",
    lastMoveTo && "tile-last-move-to",
    classificationClass && "tile-classification",
    classificationClass,
  ]
    .filter(Boolean)
    .join(" ");

  const isAnimating = translateX !== 0 || translateY !== 0;

  return (
    <div className={className}>
      {image && (
        <>
          <div
            draggable={false}
            style={{
              backgroundImage: `url(${image})`,
              transform: `translate(${translateX}px, ${translateY}px)`,
              zIndex: isAnimating ? 1000 : 10,
              transition: isAnimating ? "transform 0.15s ease-in-out" : "none"
            }}
            className={[
              "chess-piece",
              isAnimating && animationVariant === "castle-king" && "chess-piece-castle-king",
              isAnimating && animationVariant === "castle-rook" && "chess-piece-castle-rook",
            ]
              .filter(Boolean)
              .join(" ")}
            onDragStart={(e) => e.preventDefault()}
          />
          {pieceIcon && (
            <Image
              className="chess-piece-status-icon"
              src={pieceIcon}
              alt=""
              aria-hidden="true"
              width={30}
              height={30}
            />
          )}
        </>
      )}
    </div>
  );
}
