import { Check } from "lucide-react";
import type { Position } from "../hooks/usePositions";
import { tint } from "../utils/colors";

/** Toggle which positions someone can work. */
export function PositionPicker({
  positions,
  selected,
  onToggle,
}: {
  positions: Position[];
  selected: string[];
  onToggle: (positionId: string) => void;
}) {
  return (
    <div>
      <div className="block text-[0.78rem] font-[500] text-tx2 mb-[6px]">Positions</div>
      {positions.length === 0 ? (
        <p className="text-[0.72rem] text-tx3">Add positions in the Positions card on the Team page first.</p>
      ) : (
        <div className="flex flex-wrap gap-[6px]">
          {positions.map((p) => {
            const on = selected.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={on}
                onClick={() => onToggle(p.id)}
                className="inline-flex items-center gap-[5px] text-[0.76rem] font-[600] px-[10px] py-[5px] rounded-[7px] border cursor-pointer transition-colors"
                style={
                  on
                    ? { background: tint(p.color, 0.14), color: p.color, borderColor: tint(p.color, 0.5) }
                    : { background: "transparent", color: "var(--color-tx2)", borderColor: "var(--color-brd2)" }
                }
              >
                {on ? <Check className="w-[11px] h-[11px]" strokeWidth={3} /> : <span className="w-[6px] h-[6px] rounded-full" style={{ background: p.color }} />}
                {p.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
