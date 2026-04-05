import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ForgotPasswordPayload } from "./types";
import { AxiosError } from "axios";

async function forgotPasswordRequest(payload: ForgotPasswordPayload): Promise<{ success: boolean }> {
  const { data } = await api.post<{ success: boolean }>("/auth/forgot-password", payload);
  return data;
}

export function useForgotPassword() {
  return useMutation<{ success: boolean }, AxiosError<{ message: string }>, ForgotPasswordPayload>({
    mutationFn: forgotPasswordRequest,
  });
}
