"use client";

interface MenuControlsProps {
  historyIndex: number;
  historyLength: number;
  flipped: boolean;
  layout?: "stacked" | "inline";
  onNavigateMove: (direction: -1 | 1) => void;
  onNavigateToMove: (index: number) => void;
  onToggleBoard: () => void;
}

export default function MenuControls({
  historyIndex,
  historyLength,
  flipped,
  layout = "stacked",
  onNavigateMove,
  onNavigateToMove,
  onToggleBoard,
}: MenuControlsProps) {
  const firstMoveIndex = historyLength > 1 ? 1 : 0;

  return (
    <div className={`menu-controls menu-controls-${layout}`}>
      <div className="move-controls" aria-label="Move controls">
        <button
          type="button"
          onClick={() => onNavigateToMove(firstMoveIndex)}
          disabled={historyIndex <= firstMoveIndex}
          aria-label="Voltar para o primeiro movimento"
        >
          ◀◀
        </button>
        <button
          type="button"
          onClick={() => onNavigateMove(-1)}
          disabled={historyIndex === 0}
          aria-label="Voltar movimento"
        >
          ◀
        </button>
        <button
          type="button"
          onClick={() => onNavigateMove(1)}
          disabled={historyIndex === historyLength - 1}
          aria-label="Avancar movimento"
        >
          ▶
        </button>
        <button
          type="button"
          onClick={() => onNavigateToMove(historyLength - 1)}
          disabled={historyIndex === historyLength - 1}
          aria-label="Ir para o ultimo movimento"
        >
          ▶▶
        </button>
      </div>
      <button
        type="button"
        className="flip-board-button"
        onClick={onToggleBoard}
        aria-pressed={flipped}
        aria-label="Inverter tabuleiro"
      >
        ↻
      </button>
    </div>
  );
}
