import { supabase } from "@/lib/supabase";

/**
 * Starts Google sign-in. Supabase redirects to Google and back to
 * /auth/callback, which creates or loads the profile. Resolves with an
 * error message if the redirect couldn't start.
 */
export async function signInWithGoogle(): Promise<string | null> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Couldn't start Google sign-in.";
    console.error("Google sign-in error:", message);
    return message;
  }
}
