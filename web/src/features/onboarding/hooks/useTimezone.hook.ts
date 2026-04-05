import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface TimezoneResponse {
  timezone: string;
  label: string;
}

export function useTimezone(state: string) {
  const isValidState = state.length === 2 && /^[A-Za-z]{2}$/.test(state);
  return useQuery<TimezoneResponse>({
    queryKey: ["timezone", state.toUpperCase()],
    queryFn: async () => {
      const { data } = await api.get<TimezoneResponse>(`/organizations/timezone?state=${state.toUpperCase()}`);
      return data;
    },
    enabled: isValidState,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
