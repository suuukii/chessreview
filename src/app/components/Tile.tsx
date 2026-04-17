"use client";

import "../styles/tile.css"

interface Props {
  number: number;
  image: string | undefined;
  hint: boolean;
  translateX?: number;
  translateY?: number;
  hovered?: boolean;
  selected?: boolean;
  lastMoveFrom?: boolean;
  lastMoveTo?: boolean;
}

export default function Tile({ number, image, hint, translateX = 0, translateY = 0, hovered, selected, lastMoveFrom, lastMoveTo }: Props) {
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
  ]
    .filter(Boolean)
    .join(" ");

  // Verifica se a peça está em estado de animação
  const isAnimating = translateX !== 0 || translateY !== 0;

  return (
    <div className={className}>
      {image && (
        <div
          draggable={false}
          style={{
            backgroundImage: `url(${image})`,
            transform: `translate(${translateX}px, ${translateY}px)`,
            zIndex: isAnimating ? 100 : 1,
            transition: isAnimating ? "transform 0.15s ease-in-out" : "none"
          }}
          className="chess-piece"
          onDragStart={(e) => e.preventDefault()}
        />
      )}
    </div>
  );
}