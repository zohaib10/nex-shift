import { Trash2 } from "lucide-react";
import type { Position } from "../hooks/usePositions";
import { PositionChip } from "./PositionChip";

export function PositionRow({
  position,
  confirming,
  onDelete,
}: {
  position: Position;
  /** True after the first click; the second click deletes. */
  confirming: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-[10px] px-[17px] py-[9px] border-t border-brd first:border-none">
      <PositionChip position={position} />
      <span className="flex-1" />
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Delete ${position.name}`}
        className={`h-[26px] px-[8px] rounded-[6px] border-none bg-transparent flex items-center gap-[4px] text-[0.72rem] cursor-pointer transition-colors ${confirming ? "text-red-500" : "text-tx3 hover:text-red-500"}`}
      >
        <Trash2 className="w-[12px] h-[12px]" strokeWidth={2} />
        {confirming && "Click again to delete"}
      </button>
    </div>
  );
}
