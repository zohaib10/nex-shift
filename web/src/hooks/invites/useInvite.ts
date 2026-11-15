import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { AxiosError } from "axios";

export interface InviteDetails {
  id: string;
  email: string;
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
    { request: InviteDetails; locationMember: unknown },
    AxiosError<{ message: string }>,
    { token: string; userId: string }
  >({
    mutationFn: async ({ token, userId }) => {
      const { data } = await api.post(`/organizations/invites/${token}/accept`, { userId });
      return data;
    },
  });
}

export function useInviteMember(orgId: string | null) {
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    AxiosError<{ message: string }>,
    { email: string; invitedById: string; locationIds: string[] }
  >({
    mutationFn: async ({ email, invitedById, locationIds }) => {
      const { data } = await api.post(`/organizations/${orgId}/invite`, {
        email,
        invitedById,
        locationIds,
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
