import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import api from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { syncProfile } from "@/lib/session";

/**
 * Verifies the code, then exchanges the one-time token for a Supabase
 * session. Resolves `loggedIn: false` if verification worked but the
 * automatic login didn't, so the caller can send them to /login.
 */
export function useVerifyEmail() {
  return useMutation<{ loggedIn: boolean }, AxiosError<{ message: string | string[] }>, { email: string; code: string }>({
    mutationFn: async ({ email, code }) => {
      const { data } = await api.post<{ verified: boolean; tokenHash: string | null }>(
        "/auth/verify-email",
        { email, code }
      );
      if (!data.tokenHash) return { loggedIn: false };

      const { error } = await supabase.auth.verifyOtp({ token_hash: data.tokenHash, type: "magiclink" });
      if (error) return { loggedIn: false };
      await syncProfile();
      return { loggedIn: true };
    },
  });
}

export function useResendVerification() {
  return useMutation<{ success: boolean }, AxiosError<{ message: string }>, { email: string }>({
    mutationFn: async ({ email }) => {
      const { data } = await api.post<{ success: boolean }>("/auth/resend-verification", { email });
      return data;
    },
  });
}
