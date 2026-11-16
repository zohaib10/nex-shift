import api from "./api";
import { supabase } from "./supabase";
import type { SignupResponse } from "@/hooks/auth/types";

// The Supabase session (managed by supabase-js) is what authenticates API
// calls. `rosta_session` is only a cached copy of our profile for the UI.
const PROFILE_KEY = "rosta_session";

export function saveProfile(profile: Pick<SignupResponse, "id" | "firstName" | "lastName" | "email">) {
  localStorage.setItem(
    PROFILE_KEY,
    JSON.stringify({
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
    })
  );
}

/** Fetch (or, after a first OAuth login, create) our profile for the current Supabase session. */
export async function syncProfile(): Promise<SignupResponse> {
  const { data } = await api.post<SignupResponse>("/auth/sync");
  saveProfile(data);
  return data;
}

/** True only if both the Supabase session and the cached profile exist. */
export async function hasSession(): Promise<boolean> {
  if (!localStorage.getItem(PROFILE_KEY)) return false;
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    localStorage.removeItem(PROFILE_KEY);
    return false;
  }
  return true;
}

// An invite someone opened while logged out. It survives the trip through
// signup, email verification, login or Google, then brings them back to it.
const PENDING_INVITE_KEY = "rosta_pending_invite";

export function savePendingInvite(token: string) {
  try { localStorage.setItem(PENDING_INVITE_KEY, token); } catch {}
}

export function clearPendingInvite() {
  try { localStorage.removeItem(PENDING_INVITE_KEY); } catch {}
}

/** Where to go after logging in: back to a pending invite, else the dashboard. */
export function postLoginPath(): string {
  let token: string | null = null;
  try { token = localStorage.getItem(PENDING_INVITE_KEY); } catch {}
  return token ? `/invite?token=${encodeURIComponent(token)}` : "/dashboard";
}

export async function logout() {
  localStorage.removeItem(PROFILE_KEY);
  await supabase.auth.signOut();
}
