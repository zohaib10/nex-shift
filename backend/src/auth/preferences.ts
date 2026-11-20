/**
 * Per-user display preferences. Mirrored in web/src/lib/preferences.ts.
 *
 * Dashboard cards a user can hide:
 *   teamInvites — recent invites on the admin/manager dashboard
 */
export const DASHBOARD_CARDS = ['teamInvites'] as const;
export type DashboardCard = (typeof DASHBOARD_CARDS)[number];
