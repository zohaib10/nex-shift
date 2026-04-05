import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ResetPasswordPayload } from "./types";
import { AxiosError } from "axios";

async function resetPasswordRequest(payload: ResetPasswordPayload): Promise<{ success: boolean }> {
  const { data } = await api.post<{ success: boolean }>("/auth/reset-password", payload);
  return data;
}

export function useResetPassword() {
  return useMutation<{ success: boolean }, AxiosError<{ message: string }>, ResetPasswordPayload>({
    mutationFn: resetPasswordRequest,
  });
}
