import "../styles/pawn-promotion-box.css"
import Image from "next/image";
import { Piece, TeamType, GRID_SIZE } from "../logic/Constants";

interface PawnPromotionBoxProps {
  promotionPawn: Piece | null;
  promotionBoxLeft: number;
  promotionBoxTop: number;
  onPromote: (pieceType: "q" | "r" | "b" | "n") => void;
}

const options: Array<"b" | "r" | "n" | "q"> = ["b", "r", "n", "q"];

export default function PawnPromotionBox({
  promotionPawn,
  promotionBoxLeft,
  promotionBoxTop,
  onPromote,
}: PawnPromotionBoxProps) {
  if (!promotionPawn) {
    return null;
  }

  const team = promotionPawn.team === TeamType.OUR ? "w" : "b";

  return (
    <div
      className="pawn-promotion-box"
      style={{
        display: promotionPawn ? "flex" : "none",
        left: `${promotionBoxLeft}px`,
        top: `${promotionBoxTop}px`,
      }}
    >
      {options.map((option) => (
        <Image
          key={option}
          src={`/imgs/pieces/${team}${option}.png`}
          alt={option}
          width={GRID_SIZE}
          height={GRID_SIZE}
          onClick={() => onPromote(option)}
          style={{ cursor: "pointer" }}
        />
      ))}
    </div>
  );
}
