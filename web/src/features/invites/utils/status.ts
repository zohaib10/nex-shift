import type { MemberRequest } from "@/features/invites/hooks/useLocationRequests";

export const STATUS_FILTERS = ["all", "pending", "accepted", "expired", "declined"] as const;
export type StatusFilter = (typeof STATUS_FILTERS)[number];

/** A pending invite past its expiry date reads as expired, even before the server marks it. */
export function effectiveStatus(r: MemberRequest): string {
  return r.status === "pending" && new Date(r.expiresAt) < new Date() ? "expired" : r.status;
}

export function formatDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
}
