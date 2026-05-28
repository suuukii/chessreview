import "../styles/pawn-promotion-box.css";
import Image from "next/image";
import { Piece } from "../models/Piece";
import { GRID_SIZE } from "../services/Constants";
import { TeamType } from "../services/Types";

interface PawnPromotionBoxProps {
  promotionPawn: Piece | null;
  promotionBoxLeft: number;
  promotionBoxTop: number;
  onPromote: (pieceType: "q" | "r" | "b" | "n") => void;
  onCancel: () => void;
}

const options: Array<"b" | "r" | "n" | "q"> = ["b", "r", "n", "q"];

export default function PawnPromotionBox({
  promotionPawn,
  promotionBoxLeft,
  promotionBoxTop,
  onPromote,
  onCancel,
}: PawnPromotionBoxProps) {
  if (!promotionPawn) return null;

  const team = promotionPawn.team === TeamType.OUR ? "w" : "b";

  return (
    <div
      className="pawn-promotion-box"
      style={{
        left: `${promotionBoxLeft}px`,
        top: `${promotionBoxTop}px`,
        flexDirection:
          promotionPawn.team === TeamType.OUR ? "column-reverse" : "column",
      }}
    >
      <button
        type="button"
        className="pawn-promotion-cancel"
        onClick={onCancel}
        aria-label="Cancelar promoção"
      >
        ×
      </button>
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
