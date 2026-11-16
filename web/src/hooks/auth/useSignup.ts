import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import type { SignupPayload, SignupResponse } from "./types";
import { AxiosError } from "axios";

// Creates the account and emails a verification code. The user signs in
// after entering the code on /verify-email.
async function signupRequest(payload: SignupPayload): Promise<SignupResponse> {
  const { data } = await api.post<SignupResponse>("/auth/signup", payload);
  return data;
}

export function useSignup() {
  return useMutation<SignupResponse, AxiosError<{ message: string }>, SignupPayload>({
    mutationFn: signupRequest,
  });
}
