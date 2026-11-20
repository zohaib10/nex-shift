import { Clock, MapPin } from "lucide-react";
import { PositionChip } from "@/features/positions/components/PositionChip";
import type { Shift } from "../hooks/useShifts";
import { shiftState } from "../utils/state";
import { ShiftStateBadge } from "./ShiftStateBadge";
import { addDays, dateKeyIn, dayLabel, formatHours, hoursBetween, timeRange } from "../utils/time";

/** One of a staff member's shifts, as a card. */
export function ShiftTile({ shift, tz, locationName, now }: { shift: Shift; tz: string; locationName?: string; now: Date }) {
  const state = shiftState(shift, now);
  const running = state === "in_progress";
  const faded = state === "cancelled" || state === "completed";
  const color = shift.position?.color ?? "var(--color-acc)";

  return (
    <div
      className={`bg-surf border rounded-[12px] overflow-hidden flex flex-col ${running ? "border-acc-brd" : "border-brd"} ${faded ? "opacity-60" : ""}`}
      style={{ borderTop: `3px solid ${color}` }}
    >
      <div className="p-[13px_15px] flex-1 flex flex-col gap-[8px]">
        <div className="flex items-center justify-between gap-[8px]">
          <span className={`text-[0.68rem] font-[600] uppercase tracking-[0.07em] ${running ? "text-acc" : "text-tx3"}`}>
            {whenLabel(shift.startsAt, now, tz)}
          </span>
          <ShiftStateBadge state={state} />
        </div>
        <div className={`text-[1.25rem] font-[600] tracking-[-0.03em] text-tx tabular-nums leading-tight ${state === "cancelled" ? "line-through" : ""}`}>
          {timeRange(shift.startsAt, shift.endsAt, tz)}
        </div>
        <div className="flex flex-wrap items-center gap-x-[12px] gap-y-[5px] text-[0.74rem] text-tx2">
          <span className="flex items-center gap-[5px]"><Clock className="w-[12px] h-[12px] text-tx3" strokeWidth={2} />{formatHours(hoursBetween(shift.startsAt, shift.endsAt))}</span>
          {locationName && <span className="flex items-center gap-[5px]"><MapPin className="w-[12px] h-[12px] text-tx3" strokeWidth={2} />{locationName}</span>}
          {shift.position && <PositionChip position={shift.position} />}
        </div>
        {shift.notes && <div className="text-[0.72rem] text-tx2 bg-surf2 rounded-[7px] px-[9px] py-[6px]">{shift.notes}</div>}
      </div>
    </div>
  );
}

/** "Today", "Tomorrow", else "Fri, Nov 21" — in the location's timezone. */
function whenLabel(startsAt: string, now: Date, tz: string): string {
  const today = dateKeyIn(now, tz);
  const day = dateKeyIn(startsAt, tz);
  if (day === today) return "Today";
  if (day === addDays(today, 1)) return "Tomorrow";
  return dayLabel(day);
}
