import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { AxiosError } from "axios";

interface ValidatePromoPayload {
  code: string;
}

export interface ValidatePromoResponse {
  valid: boolean;
  promoId?: string;
  maxMembers?: number;
  message?: string;
}

export function useValidatePromo() {
  return useMutation<ValidatePromoResponse, AxiosError<{ message: string }>, ValidatePromoPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<ValidatePromoResponse>("/organizations/validate-promo", payload);
      return data;
    },
  });
}
