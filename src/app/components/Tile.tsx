import "../styles/tile.css"
interface Props {
  number: number;
  image: string | undefined;
  hint: boolean;
  translateX?: number;
  translateY?: number;
  hovered?: boolean;
  selected?: boolean;
}

export default function Tile({ number, image, hint, translateX = 0, translateY = 0, hovered, selected }: Props) {
  const className: string = [
    "tile",
    number % 2 === 0 && "black-tile",
    number % 2 !== 0 && "white-tile",
    hint && "tile-hint",
    hovered && "tile-hovered",
    selected && "tile-selected"
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      {image && (
        <div
          style={{
            backgroundImage: `url(${image})`,
            transform: `translate(${translateX}px, ${translateY}px)`,
          }}
          className="chess-piece"
        />
      )}
    </div>
  );
}