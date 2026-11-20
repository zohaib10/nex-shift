import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import api from "@/lib/api";

export interface Position {
  id: string;
  name: string;
  color: string;
}

type ApiError = AxiosError<{ message: string | string[] }>;

export function usePositions(orgId: string | null) {
  return useQuery<Position[], ApiError>({
    queryKey: ["positions", orgId],
    queryFn: async () => (await api.get(`/organizations/${orgId}/positions`)).data,
    enabled: !!orgId,
  });
}

/** Common positions for the org's type that it doesn't have yet. Admins only. */
export function usePositionSuggestions(orgId: string | null) {
  return useQuery<string[], ApiError>({
    queryKey: ["position-suggestions", orgId],
    queryFn: async () => (await api.get(`/organizations/${orgId}/positions/suggestions`)).data,
    enabled: !!orgId,
  });
}

/** Changing positions also changes what the Team list and rosters show. */
function useInvalidate(orgId: string | null) {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ["positions", orgId] });
    void qc.invalidateQueries({ queryKey: ["position-suggestions", orgId] });
    void qc.invalidateQueries({ queryKey: ["team", orgId] });
    void qc.invalidateQueries({ queryKey: ["roster", orgId] });
    void qc.invalidateQueries({ queryKey: ["shifts", orgId] });
  };
}

/** The backend picks the colour. */
export function useCreatePosition(orgId: string | null) {
  const invalidate = useInvalidate(orgId);
  return useMutation<Position, ApiError, { name: string }>({
    mutationFn: async (body) => (await api.post(`/organizations/${orgId}/positions`, body)).data,
    onSuccess: invalidate,
  });
}

export function useDeletePosition(orgId: string | null) {
  const invalidate = useInvalidate(orgId);
  return useMutation<{ success: boolean }, ApiError, { positionId: string }>({
    mutationFn: async ({ positionId }) =>
      (await api.delete(`/organizations/${orgId}/positions/${positionId}`)).data,
    onSuccess: invalidate,
  });
}
