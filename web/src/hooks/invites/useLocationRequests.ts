import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface MemberRequest {
  id: string;
  email: string;
  status: string;
  expiresAt: string;
  respondedAt: string | null;
  createdAt: string;
  location: { id: string; name: string };
}

export function useLocationRequests(orgId: string | null, locationId: string | null) {
  return useQuery<MemberRequest[]>({
    queryKey: ["locationRequests", orgId, locationId],
    queryFn: async () => {
      const url = locationId
        ? `/organizations/${orgId}/locations/${locationId}/requests`
        : `/organizations/${orgId}/requests`;
      const { data } = await api.get(url);
      return data;
    },
    enabled: !!orgId,
  });
}
