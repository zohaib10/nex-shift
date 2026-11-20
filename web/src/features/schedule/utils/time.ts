/**
 * Shift times are UTC instants. Everything the schedule shows (which day a
 * shift is on, its start time) is in the location's timezone, not the
 * browser's, so a manager travelling still sees the clinic's hours.
 *
 * A DateKey ("2026-11-16") names a calendar day without a timezone. Day maths
 * on keys runs in UTC so it never shifts across daylight-saving changes.
 */
export type DateKey = string;

const pad = (n: number) => String(n).padStart(2, "0");

export function browserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/** The location's timezone, or the browser's for locations created without one. */
export function locationTimeZone(loc: { timezone?: string | null } | undefined): string {
  return loc?.timezone || browserTimeZone();
}

function partsIn(date: Date, tz: string) {
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const p: Record<string, string> = {};
  for (const part of f.formatToParts(date)) p[part.type] = part.value;
  return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour, min: +p.minute };
}

/** The calendar day an instant falls on in `tz`. */
export function dateKeyIn(date: Date | string, tz: string): DateKey {
  const p = partsIn(new Date(date), tz);
  return `${p.y}-${pad(p.m)}-${pad(p.d)}`;
}

/** "HH:mm" (24h) in `tz`, for `<input type="time">`. */
export function timeIn(date: Date | string, tz: string): string {
  const p = partsIn(new Date(date), tz);
  return `${pad(p.h)}:${pad(p.min)}`;
}

/** How far `tz` is ahead of UTC at this instant, in ms. */
function offsetMs(date: Date, tz: string): number {
  const p = partsIn(date, tz);
  const asUtc = Date.UTC(p.y, p.m - 1, p.d, p.h, p.min);
  return asUtc - Math.floor(date.getTime() / 60000) * 60000;
}

/** The instant a wall-clock day + "HH:mm" happens in `tz`. */
export function zonedToUtc(day: DateKey, time: string, tz: string): Date {
  const [y, m, d] = day.split("-").map(Number);
  const [h, min] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, h, min);
  // Two passes settle the offset when the guess lands on the other side of a DST change.
  let t = guess - offsetMs(new Date(guess), tz);
  t = guess - offsetMs(new Date(t), tz);
  return new Date(t);
}

export function addDays(day: DateKey, n: number): DateKey {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** The Monday on or before `day`. */
export function startOfWeek(day: DateKey): DateKey {
  const dow = new Date(`${day}T00:00:00Z`).getUTCDay();
  return addDays(day, -((dow + 6) % 7));
}

export interface WeekDay {
  key: DateKey;
  dayName: string;
  dayNum: number;
  isToday: boolean;
}

export function weekDays(monday: DateKey, today: DateKey): WeekDay[] {
  return Array.from({ length: 7 }, (_, i) => {
    const key = addDays(monday, i);
    const date = new Date(`${key}T00:00:00Z`);
    return {
      key,
      dayName: date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
      dayNum: date.getUTCDate(),
      isToday: key === today,
    };
  });
}

/** "Nov 10 – 16", or "Nov 30 – Dec 6" across a month. */
export function weekLabel(monday: DateKey): string {
  const fmt = (key: DateKey, opts: Intl.DateTimeFormatOptions) =>
    new Date(`${key}T00:00:00Z`).toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });
  const sunday = addDays(monday, 6);
  const sameMonth = monday.slice(0, 7) === sunday.slice(0, 7);
  return `${fmt(monday, { month: "short", day: "numeric" })} – ${fmt(sunday, sameMonth ? { day: "numeric" } : { month: "short", day: "numeric" })}`;
}

/** "Mon, Nov 16" */
export function dayLabel(day: DateKey): string {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** "7a", "7:30p" */
export function shortTime(date: Date | string, tz: string): string {
  const [h, m] = timeIn(date, tz).split(":").map(Number);
  const h12 = h % 12 || 12;
  return `${h12}${m ? `:${pad(m)}` : ""}${h < 12 ? "a" : "p"}`;
}

export function timeRange(start: string, end: string, tz: string): string {
  return `${shortTime(start, tz)} – ${shortTime(end, tz)}`;
}

export function hoursBetween(start: string, end: string): number {
  return (new Date(end).getTime() - new Date(start).getTime()) / 3.6e6;
}

/** "8h", "7.5h" */
export function formatHours(h: number): string {
  return `${Math.round(h * 10) / 10}h`;
}

/** The UTC range covering a week of days in `tz`, for the shifts query. */
export function weekRange(monday: DateKey, tz: string): { from: string; to: string } {
  return {
    from: zonedToUtc(monday, "00:00", tz).toISOString(),
    to: zonedToUtc(addDays(monday, 7), "00:00", tz).toISOString(),
  };
}

/** First day of the month containing `day`. */
export function startOfMonth(day: DateKey): DateKey {
  return `${day.slice(0, 7)}-01`;
}

export function addMonths(monthStart: DateKey, n: number): DateKey {
  const [y, m] = monthStart.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 10);
}

/** "November 2026" */
export function monthLabel(monthStart: DateKey): string {
  return new Date(`${monthStart}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}
