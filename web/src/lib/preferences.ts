// Mirrors backend/src/auth/preferences.ts.

export type DashboardCard = "teamInvites";

export const DASHBOARD_CARD_INFO: Record<DashboardCard, { label: string; hint: string }> = {
  teamInvites: { label: "Team Invites", hint: "Invites sent in the last 7 days, on the dashboard." },
};
