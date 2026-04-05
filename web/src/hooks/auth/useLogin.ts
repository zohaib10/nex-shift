import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import type { LoginPayload, SignupResponse } from "./types";
import { AxiosError } from "axios";

async function loginRequest(payload: LoginPayload): Promise<SignupResponse> {
  const { data } = await api.post<SignupResponse>("/auth/login", payload);
  return data;
}

export function useLogin() {
  return useMutation<SignupResponse, AxiosError<{ message: string }>, LoginPayload>({
    mutationFn: loginRequest,
  });
}
