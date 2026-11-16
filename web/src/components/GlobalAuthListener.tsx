"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { hasSession, postLoginPath, syncProfile } from "@/lib/session";

export function GlobalAuthListener() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If we're already on the callback page, let the callback page handle it directly
    if (pathname === "/auth/callback") return;

    // Bounce logged in users out of marketing/auth pages directly into the dashboard
    if (pathname === "/" || pathname === "/login" || pathname === "/signup") {
      hasSession().then((ok) => { if (ok) router.replace("/dashboard"); });
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // An OAuth sign-in that landed outside /auth/callback: fetch our profile.
      if (event === "SIGNED_IN" && session && !localStorage.getItem("rosta_session")) {
        // Defer: calling Supabase from inside this callback can deadlock supabase-js.
        setTimeout(() => {
          syncProfile()
            .then(() => router.replace(postLoginPath()))
            .catch((err) => console.error("Failed to sync user with backend:", err));
        }, 0);
      }
      if (event === "SIGNED_OUT") {
        localStorage.removeItem("rosta_session");
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router, pathname]);

  return null;
}
