import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import api from "@/lib/api";
import type { LocationRole, OrgRole } from "@/lib/roles";

export interface TeamMember {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: OrgRole;
  joinedAt: string;
  locations: { id: string; name: string; role: LocationRole }[];
}

export interface UpdateMemberPayload {
  role?: "admin" | "member";
  /** Replaces the member's full set of locations. */
  locations?: { locationId: string; role: LocationRole }[];
}

type ApiError = AxiosError<{ message: string | string[] }>;

export function useTeam(orgId: string | null) {
  return useQuery<TeamMember[], ApiError>({
    queryKey: ["team", orgId],
    queryFn: async () => (await api.get(`/organizations/${orgId}/members`)).data,
    enabled: !!orgId,
  });
}

export function useUpdateMember(orgId: string | null) {
  const qc = useQueryClient();
  return useMutation<TeamMember, ApiError, { userId: string } & UpdateMemberPayload>({
    mutationFn: async ({ userId, ...body }) =>
      (await api.patch(`/organizations/${orgId}/members/${userId}`, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["team", orgId] }),
  });
}

export function useRemoveMember(orgId: string | null) {
  const qc = useQueryClient();
  return useMutation<{ success: boolean }, ApiError, { userId: string }>({
    mutationFn: async ({ userId }) =>
      (await api.delete(`/organizations/${orgId}/members/${userId}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["team", orgId] }),
  });
}

export function apiErrorMessage(err: ApiError | null, fallback: string) {
  const msg = err?.response?.data?.message;
  return Array.isArray(msg) ? msg[0] : msg || fallback;
}
