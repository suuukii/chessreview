import "../styles/tile.css"
interface Props {
  number: number;
  image: string | undefined;
  hint: boolean;
  translateX?: number;
  translateY?: number;
}

export default function Tile({ number, image, hint, translateX = 0, translateY = 0 }: Props) {
  const className: string = [
    "tile",
    number % 2 === 0 && "black-tile",
    number % 2 !== 0 && "white-tile",
    hint && "tile-hint",
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