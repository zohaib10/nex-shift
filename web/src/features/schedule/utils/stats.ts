import type { Shift } from "../hooks/useShifts";
import { addDays, browserTimeZone, dateKeyIn, startOfWeek, zonedToUtc } from "./time";

/**
 * A query range wide enough to hold this week at every location: the
 * browser's week padded by a day each side, since locations may be in other
 * timezones. `shiftStats` then filters each shift in its own location's time.
 */
export function paddedWeekRange(now: Date): { from: string; to: string } {
  const tz = browserTimeZone();
  const monday = startOfWeek(dateKeyIn(now, tz));
  return {
    from: zonedToUtc(addDays(monday, -1), "00:00", tz).toISOString(),
    to: zonedToUtc(addDays(monday, 8), "00:00", tz).toISOString(),
  };
}

export interface ShiftStats {
  /** Every shift overlapping today (drafts and cancelled too, badged), by start time. For Today's Schedule. */
  todaySchedule: Shift[];
  /** Published shifts running right now with someone assigned. */
  onNow: Shift[];
  /** Distinct people with a published shift overlapping today. */
  peopleToday: number;
  shiftsToday: number;
  /** Shifts starting this week (Mon–Sun), drafts included, cancelled not. */
  shiftsThisWeek: number;
  draftsThisWeek: number;
  /** Open shifts (no one assigned) this week. */
  openThisWeek: number;
}

/** Dashboard numbers. "Today" and "this week" are each shift's location's day and week. */
export function shiftStats(shifts: Shift[], tzOf: (locationId: string) => string, now: Date): ShiftStats {
  const t = now.getTime();
  const onNow: Shift[] = [];
  const today: Shift[] = [];
  const week: Shift[] = [];
  const todaySchedule: Shift[] = [];

  for (const s of shifts) {
    const tz = tzOf(s.locationId);
    const todayKey = dateKeyIn(now, tz);
    const start = new Date(s.startsAt).getTime();
    const end = new Date(s.endsAt).getTime();

    const monday = startOfWeek(todayKey);
    const startKey = dateKeyIn(s.startsAt, tz);
    if (s.status !== "cancelled" && startKey >= monday && startKey < addDays(monday, 7)) week.push(s);

    const dayStart = zonedToUtc(todayKey, "00:00", tz).getTime();
    const dayEnd = zonedToUtc(addDays(todayKey, 1), "00:00", tz).getTime();
    const overlapsToday = start < dayEnd && end > dayStart;
    if (overlapsToday) todaySchedule.push(s);

    // Drafts and cancelled shifts aren't real work; no-shows aren't on shift.
    if (s.status !== "published" || s.noShowAt) continue;
    if (overlapsToday) today.push(s);
    if (s.userId && start <= t && t < end) onNow.push(s);
  }

  return {
    todaySchedule,
    onNow,
    peopleToday: new Set(today.map((s) => s.userId).filter(Boolean)).size,
    shiftsToday: today.length,
    shiftsThisWeek: week.length,
    draftsThisWeek: week.filter((s) => s.status === "draft").length,
    openThisWeek: week.filter((s) => !s.userId).length,
  };
}
