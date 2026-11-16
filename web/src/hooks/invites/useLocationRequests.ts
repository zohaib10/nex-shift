import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

type PersonName = { firstName: string; lastName: string };

export interface MemberRequest {
  id: string;
  email: string;
  role: "staff" | "manager" | "admin";
  status: string;
  expiresAt: string;
  respondedAt: string | null;
  createdAt: string;
  location: { id: string; name: string };
  /** Set once the invite is accepted. */
  acceptedBy: PersonName | null;
  invitedBy: PersonName | null;
}

/**
 * Invites for one location, or for every location the user manages when
 * `locationId` is null. `days` limits it to invites sent in that many days.
 */
export function useLocationRequests(orgId: string | null, locationId: string | null, days?: number) {
  return useQuery<MemberRequest[]>({
    queryKey: ["locationRequests", orgId, locationId, days ?? "all"],
    queryFn: async () => {
      const url = locationId
        ? `/organizations/${orgId}/locations/${locationId}/requests`
        : `/organizations/${orgId}/requests`;
      const { data } = await api.get(url, { params: days ? { days } : undefined });
      return data;
    },
    enabled: !!orgId,
  });
}

export function personName(p: PersonName | null): string | null {
  if (!p) return null;
  return `${p.firstName} ${p.lastName}`.trim() || null;
}
