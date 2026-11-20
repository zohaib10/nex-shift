/**
 * draft     — being planned; only the location's managers and admins see it.
 * published — out to staff; the assignee sees it on their schedule.
 * cancelled — was published, then called off by a manager. Kept (not
 *             deleted) so the assignee sees it was cancelled.
 *
 * Upcoming / in progress / completed aren't stored: they follow from the
 * shift's times. A no-show is `noShowAt`, set by a manager after the start.
 */
export const SHIFT_STATUSES = ['draft', 'published', 'cancelled'] as const;
export type ShiftStatus = (typeof SHIFT_STATUSES)[number];

/** Statuses the assignee can see. */
export const VISIBLE_TO_STAFF: ShiftStatus[] = ['published', 'cancelled'];

/** Longest shift we accept, in hours. */
export const MAX_SHIFT_HOURS = 24;
