"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import api from "@/lib/api";

export function GlobalAuthListener() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If we're already on the callback page, let the callback page handle it directly
    if (pathname === "/auth/callback") return;

    // Bounce logged in users out of marketing/auth pages directly into the dashboard
    if (localStorage.getItem("rosta_session") && (pathname === "/" || pathname === "/login" || pathname === "/signup")) {
      router.replace("/dashboard");
      return;
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      // If we just signed in via a Supabase provider but we don't have our local rosta_session yet
      if (event === "SIGNED_IN" && session?.user && !localStorage.getItem("rosta_session")) {
        try {
          const names = session.user.user_metadata?.full_name?.split(' ') || [];
          const firstName = names[0] || 'User';
          const lastName = names.slice(1).join(' ') || '';

          // Sync with the backend database
          const response = await api.post('/auth/google-sync', {
            supabaseId: session.user.id,
            email: session.user.email,
            firstName,
            lastName
          });

          // Establish our local mocked backend session
          localStorage.setItem("rosta_session", JSON.stringify({
            id: response.data.id,
            supabaseId: response.data.supabaseId,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            email: response.data.email,
          }));

          // Redirect smoothly safely to dashboard
          router.replace('/dashboard');
        } catch (err) {
          console.error("Failed to perform global sync:", err);
        }
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router, pathname]);

  return null;
}
