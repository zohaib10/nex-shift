import axios from "axios";
import { supabase } from "./supabase";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the Supabase access token. getSession() refreshes it if it's expired.
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const PUBLIC_PATHS = ["/", "/login", "/signup", "/invite", "/auth/callback", "/forgot-password", "/reset-password", "/verify-email"];

// 401: the session is gone or revoked. 403 EMAIL_NOT_VERIFIED: signed in but
// not verified yet. Either way, log out locally and send them where they can fix it.
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (typeof window === "undefined") return Promise.reject(error);
    const status = error.response?.status;
    const unverified = status === 403 && error.response?.data?.code === "EMAIL_NOT_VERIFIED";

    if (status === 401 || unverified) {
      let email = "";
      try { email = JSON.parse(localStorage.getItem("rosta_session") || "{}").email || ""; } catch {}
      localStorage.removeItem("rosta_session");
      await supabase.auth.signOut({ scope: "local" });

      if (!PUBLIC_PATHS.includes(window.location.pathname)) {
        window.location.href = unverified && email
          ? `/verify-email?email=${encodeURIComponent(email)}&send=1`
          : "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
