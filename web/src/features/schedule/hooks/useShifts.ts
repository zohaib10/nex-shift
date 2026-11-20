import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import api from "@/lib/api";
import type { Position } from "@/features/positions/hooks/usePositions";

/** Stored publishing status. Upcoming / in progress / completed come from the times (see utils/state.ts). */
export type ShiftStatus = "draft" | "published" | "cancelled";

export interface Shift {
  id: string;
  locationId: string;
  /** null = open shift. */
  userId: string | null;
  positionId: string | null;
  startsAt: string;
  endsAt: string;
  notes: string | null;
  status: ShiftStatus;
  cancelledAt: string | null;
  /** Set when a manager marked that the assignee didn't turn up. */
  noShowAt: string | null;
  user: { id: string; firstName: string; lastName: string } | null;
  position: Position | null;
}

export interface ShiftInput {
  userId: string | null;
  positionId: string | null;
  startsAt: string;
  endsAt: string;
  notes: string | null;
}

type ApiError = AxiosError<{ message: string | string[] }>;

/**
 * Shifts overlapping [from, to). With a location the caller manages: every
 * shift there. Otherwise: the caller's own published shifts.
 */
export function useShifts(
  orgId: string | null,
  range: { from: string; to: string },
  locationId: string | null,
  /** Poll for live views (ms). */
  refetchInterval?: number
) {
  return useQuery<Shift[], ApiError>({
    queryKey: ["shifts", orgId, locationId, range.from, range.to],
    queryFn: async () =>
      (await api.get(`/organizations/${orgId}/shifts`, {
        params: { from: range.from, to: range.to, ...(locationId ? { locationId } : {}) },
      })).data,
    enabled: !!orgId,
    refetchInterval,
  });
}

function useInvalidateShifts(orgId: string | null) {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["shifts", orgId] });
}

export function useCreateShift(orgId: string | null) {
  const invalidate = useInvalidateShifts(orgId);
  return useMutation<Shift, ApiError, ShiftInput & { locationId: string }>({
    mutationFn: async ({ userId, positionId, notes, ...body }) =>
      (await api.post(`/organizations/${orgId}/shifts`, {
        ...body,
        ...(userId ? { userId } : {}),
        ...(positionId ? { positionId } : {}),
        ...(notes ? { notes } : {}),
      })).data,
    onSuccess: invalidate,
  });
}

export function useUpdateShift(orgId: string | null) {
  const invalidate = useInvalidateShifts(orgId);
  return useMutation<Shift, ApiError, ShiftInput & { shiftId: string }>({
    mutationFn: async ({ shiftId, ...body }) =>
      (await api.patch(`/organizations/${orgId}/shifts/${shiftId}`, body)).data,
    onSuccess: invalidate,
  });
}

export function useDeleteShift(orgId: string | null) {
  const invalidate = useInvalidateShifts(orgId);
  return useMutation<{ success: boolean }, ApiError, { shiftId: string }>({
    mutationFn: async ({ shiftId }) => (await api.delete(`/organizations/${orgId}/shifts/${shiftId}`)).data,
    onSuccess: invalidate,
  });
}

/** Published shifts are cancelled (kept, crossed out), not deleted. */
export function useCancelShift(orgId: string | null) {
  const invalidate = useInvalidateShifts(orgId);
  return useMutation<Shift, ApiError, { shiftId: string }>({
    mutationFn: async ({ shiftId }) => (await api.post(`/organizations/${orgId}/shifts/${shiftId}/cancel`)).data,
    onSuccess: invalidate,
  });
}

export function useSetNoShow(orgId: string | null) {
  const invalidate = useInvalidateShifts(orgId);
  return useMutation<Shift, ApiError, { shiftId: string; noShow: boolean }>({
    mutationFn: async ({ shiftId, noShow }) =>
      (await api.patch(`/organizations/${orgId}/shifts/${shiftId}/no-show`, { noShow })).data,
    onSuccess: invalidate,
  });
}

/** Publishes the location's drafts that start in [from, to). */
export function usePublishShifts(orgId: string | null) {
  const invalidate = useInvalidateShifts(orgId);
  return useMutation<{ published: number }, ApiError, { locationId: string; from: string; to: string }>({
    mutationFn: async (body) => (await api.post(`/organizations/${orgId}/shifts/publish`, body)).data,
    onSuccess: invalidate,
  });
}
