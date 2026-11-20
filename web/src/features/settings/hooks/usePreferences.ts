import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import api from "@/lib/api";
import type { DashboardCard } from "@/lib/preferences";

interface Me {
  id: string;
  hiddenDashboardCards: DashboardCard[];
}

/** The signed-in user's saved preferences (from GET /auth/me). */
export function useMe() {
  return useQuery<Me, AxiosError>({
    queryKey: ["me"],
    queryFn: async () => (await api.get("/auth/me")).data,
    staleTime: 5 * 60_000,
  });
}

/**
 * Show or hide a dashboard card for this user, on every device. Updates the
 * cache first so the card disappears at once, and rolls back if saving fails.
 */
export function useDashboardCards() {
  const qc = useQueryClient();
  const { data, isLoading } = useMe();
  const hidden = data?.hiddenDashboardCards ?? [];

  const save = useMutation<Me, AxiosError, DashboardCard[], { previous?: Me }>({
    mutationFn: async (hiddenDashboardCards) =>
      (await api.patch("/auth/me/preferences", { hiddenDashboardCards })).data,
    onMutate: async (next) => {
      await qc.cancelQueries({ queryKey: ["me"] });
      const previous = qc.getQueryData<Me>(["me"]);
      if (previous) qc.setQueryData<Me>(["me"], { ...previous, hiddenDashboardCards: next });
      return { previous };
    },
    onError: (_err, _next, ctx) => {
      if (ctx?.previous) qc.setQueryData(["me"], ctx.previous);
    },
    onSuccess: (me) => qc.setQueryData(["me"], me),
  });

  return {
    /** False until preferences load, so hidden cards don't flash in. */
    ready: !isLoading,
    isHidden: (card: DashboardCard) => hidden.includes(card),
    setHidden: (card: DashboardCard, hide: boolean) =>
      save.mutate(hide ? [...new Set([...hidden, card])] : hidden.filter((c) => c !== card)),
    isSaving: save.isPending,
  };
}
