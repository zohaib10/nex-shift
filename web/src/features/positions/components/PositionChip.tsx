import type { Position } from "../hooks/usePositions";
import { tint } from "../utils/colors";

/** A position's name in its colour. */
export function PositionChip({ position, className = "" }: { position: Pick<Position, "name" | "color">; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-[5px] text-[0.66rem] font-[600] px-[7px] py-[2px] rounded-[5px] whitespace-nowrap ${className}`}
      style={{ background: tint(position.color, 0.14), color: position.color }}
    >
      <span className="w-[6px] h-[6px] rounded-full shrink-0" style={{ background: position.color }} />
      {position.name}
    </span>
  );
}
