import { tint } from "@/features/positions/utils/colors";
import type { Shift } from "../hooks/useShifts";
import { timeRange } from "../utils/time";

/** A shift in the grid. Drafts have a dashed border until published. */
export function ShiftChip({ shift, tz, onClick }: { shift: Shift; tz: string; onClick: () => void }) {
  const color = shift.position?.color ?? "#64748B";
  const draft = shift.status === "draft";
  const cancelled = shift.status === "cancelled";
  const noShow = !!shift.noShowAt;
  return (
    <button
      type="button"
      onClick={onClick}
      title={draft ? "Draft: not visible to staff yet" : cancelled ? "Cancelled" : noShow ? "No-show" : undefined}
      className={`w-full text-left rounded-[7px] px-[7px] py-[5px] border cursor-pointer transition-opacity hover:opacity-80 ${draft ? "border-dashed" : "border-solid"} ${cancelled ? "opacity-50" : ""}`}
      style={{ background: tint(color, draft ? 0.06 : 0.14), borderColor: tint(color, draft ? 0.6 : 0.35), borderLeft: `3px solid ${color}` }}
    >
      <div className={`text-[0.72rem] font-[600] text-tx tabular-nums leading-[1.3] ${cancelled ? "line-through" : ""}`}>{timeRange(shift.startsAt, shift.endsAt, tz)}</div>
      {(cancelled || noShow) && (
        <div className={`text-[0.6rem] font-[700] uppercase tracking-[0.05em] leading-[1.3] ${noShow ? "text-[#FF4D4D]" : "text-tx3"}`}>
          {cancelled ? "Cancelled" : "No-show"}
        </div>
      )}
      {shift.position && (
        <div className="text-[0.64rem] font-[600] truncate leading-[1.3]" style={{ color }}>{shift.position.name}</div>
      )}
    </button>
  );
}
