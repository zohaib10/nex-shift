import { PositionChip } from "@/features/positions/components/PositionChip";
import type { Shift } from "../hooks/useShifts";
import { shiftState } from "../utils/state";
import { ShiftStateBadge } from "./ShiftStateBadge";
import { formatHours, hoursBetween, timeRange } from "../utils/time";

/** One shift as a line in a list: time, position, and who or where. */
export function ShiftListItem({
  shift,
  tz,
  subtitle,
  now,
}: {
  shift: Shift;
  tz: string;
  subtitle?: string;
  /** Pass to show the shift's status badge. */
  now?: Date;
}) {
  const state = now ? shiftState(shift, now) : shift.status === "draft" ? "draft" : shift.status === "cancelled" ? "cancelled" : null;
  return (
    <div className={`flex items-center gap-[10px] px-[17px] py-[10px] border-t border-brd first:border-none ${state === "cancelled" ? "opacity-60" : ""}`}>
      <div className="w-[3px] self-stretch rounded-full shrink-0" style={{ background: shift.position?.color ?? "var(--color-brd2)" }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[7px] flex-wrap">
          <span className={`text-[0.82rem] font-[600] text-tx tabular-nums ${state === "cancelled" ? "line-through" : ""}`}>{timeRange(shift.startsAt, shift.endsAt, tz)}</span>
          <span className="text-[0.68rem] text-tx3">{formatHours(hoursBetween(shift.startsAt, shift.endsAt))}</span>
          {shift.position && <PositionChip position={shift.position} />}
          {state && <ShiftStateBadge state={state} />}
        </div>
        {(subtitle || shift.notes) && (
          <div className="text-[0.72rem] text-tx2 truncate mt-[1px]">{[subtitle, shift.notes].filter(Boolean).join(" · ")}</div>
        )}
      </div>
    </div>
  );
}
