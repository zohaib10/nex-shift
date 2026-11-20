import type { Shift } from "../hooks/useShifts";

/**
 * What a shift is right now. Cancelled, no-show and draft are stored; the
 * rest follow from the times, so they never go stale.
 */
export type ShiftState = "draft" | "cancelled" | "no_show" | "upcoming" | "in_progress" | "completed";

export function shiftState(shift: Shift, now: Date): ShiftState {
  if (shift.status === "draft") return "draft";
  if (shift.status === "cancelled") return "cancelled";
  if (shift.noShowAt) return "no_show";
  const t = now.getTime();
  if (t < new Date(shift.startsAt).getTime()) return "upcoming";
  if (t < new Date(shift.endsAt).getTime()) return "in_progress";
  return "completed";
}

export const SHIFT_STATE_INFO: Record<ShiftState, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-surf2 text-tx3" },
  upcoming: { label: "Upcoming", className: "bg-blu-bg text-blu" },
  in_progress: { label: "In progress", className: "bg-acc-bg text-acc" },
  completed: { label: "Completed", className: "bg-surf2 text-tx2" },
  no_show: { label: "No-show", className: "bg-[rgba(255,77,77,0.1)] text-[#FF4D4D]" },
  cancelled: { label: "Cancelled", className: "bg-surf2 text-tx3 line-through" },
};

/** Shifts that count as scheduled work: not draft, not cancelled. */
export const isLive = (s: Shift) => s.status === "published";
