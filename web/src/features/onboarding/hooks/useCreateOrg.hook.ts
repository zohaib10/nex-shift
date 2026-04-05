import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { AxiosError } from "axios";

export interface CreateOrgPayload {
  userId: string;
  name: string;
  type: string;
  typeOther?: string;
  phone?: string;
  website?: string;
  locationName: string;
  address?: string;
  city?: string;
  state?: string;
  timezone?: string;
  inviteEmails?: string[];
  promoId?: string;
}

export interface CreateOrgResponse {
  id: string;
  name: string;
  type: string;
  ownerId: string;
  plan: string;
  maxMembers: number;
  createdAt: string;
}

export function useCreateOrg() {
  return useMutation<CreateOrgResponse, AxiosError<{ message: string }>, CreateOrgPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<CreateOrgResponse>("/organizations", payload);
      return data;
    },
  });
}
