import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { syncProfile } from "@/lib/session";
import type { LoginPayload, SignupResponse } from "./types";

/** Thrown when the password is right but the email hasn't been verified yet. */
export class EmailNotVerifiedError extends Error {
  constructor(public email: string) {
    super("Email not verified");
  }
}

async function loginRequest(payload: LoginPayload): Promise<SignupResponse> {
  const { error } = await supabase.auth.signInWithPassword(payload);
  if (error) {
    // Supabase refuses password sign-in until the email is confirmed.
    if (error.code === "email_not_confirmed") throw new EmailNotVerifiedError(payload.email);
    throw error;
  }
  try {
    const profile = await syncProfile();
    if (!profile.emailVerified) {
      // Accounts created before verification existed: verify, then log in again.
      localStorage.removeItem("rosta_session");
      await supabase.auth.signOut({ scope: "local" });
      throw new EmailNotVerifiedError(profile.email);
    }
    return profile;
  } catch (err) {
    await supabase.auth.signOut({ scope: "local" });
    throw err;
  }
}

export function useLogin() {
  return useMutation<SignupResponse, Error, LoginPayload>({
    mutationFn: loginRequest,
  });
}
