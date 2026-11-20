import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import api from "@/lib/api";
import type { Position } from "@/features/positions/hooks/usePositions";

/** Someone who can be scheduled at a location. Admins can work anywhere. */
export interface RosterMember {
  userId: string;
  firstName: string;
  lastName: string;
  role: "admin" | "manager" | "staff";
  positions: Position[];
}

/** Managers and admins only. */
export function useRoster(orgId: string | null, locationId: string | null) {
  return useQuery<RosterMember[], AxiosError>({
    queryKey: ["roster", orgId, locationId],
    queryFn: async () => (await api.get(`/organizations/${orgId}/locations/${locationId}/roster`)).data,
    enabled: !!orgId && !!locationId,
  });
}
