import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { AxiosError } from "axios";
import type { InviteRole } from "@/lib/roles";

export interface InviteDetails {
  id: string;
  email: string;
  role: InviteRole;
  status: string;
  expiresAt: string;
  invalid: boolean;
  reason?: string;
  locations: { id: string; name: string }[];
  org: { id: string; name: string };
}

export function useInviteDetails(token: string | null) {
  return useQuery<InviteDetails, AxiosError<{ message: string }>>({
    queryKey: ["invite", token],
    queryFn: async () => {
      const { data } = await api.get(`/organizations/invites/${token}`);
      return data;
    },
    enabled: !!token,
    retry: false,
  });
}

export function useAcceptInvite() {
  return useMutation<
    { orgId: string; role: InviteRole },
    AxiosError<{ message: string }>,
    { token: string }
  >({
    mutationFn: async ({ token }) => {
      const { data } = await api.post(`/organizations/invites/${token}/accept`);
      return data;
    },
  });
}

export function useInviteMember(orgId: string | null) {
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    AxiosError<{ message: string }>,
    { email: string; locationIds: string[]; role: InviteRole }
  >({
    mutationFn: async ({ email, locationIds, role }) => {
      const { data } = await api.post(`/organizations/${orgId}/invite`, {
        email,
        locationIds,
        role,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "locationRequests" && query.queryKey[1] === orgId,
      });
    },
  });
}
