import type { Shift } from "../hooks/useShifts";
import { dateKeyIn, hoursBetween, type DateKey } from "./time";

/** The grid's row for open shifts (no one assigned). */
export const OPEN_ROW = "open";

export function cellKey(rowId: string, day: DateKey): string {
  return `${rowId}|${day}`;
}

/** Shifts by person and the day they start on in `tz`. */
export function groupByCell(shifts: Shift[], tz: string): Map<string, Shift[]> {
  const cells = new Map<string, Shift[]>();
  for (const s of shifts) {
    const key = cellKey(s.userId ?? OPEN_ROW, dateKeyIn(s.startsAt, tz));
    cells.set(key, [...(cells.get(key) ?? []), s]);
  }
  return cells;
}

export function totalHours(shifts: Shift[]): number {
  return shifts.reduce((sum, s) => sum + hoursBetween(s.startsAt, s.endsAt), 0);
}
