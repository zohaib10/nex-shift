"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { postLoginPath, syncProfile } from "@/lib/session";
import { PageLoader } from "@/components/PageLoader";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    let done = false;

    // supabase-js exchanges the OAuth code in the URL for a session; once we
    // have one, let the backend create/fetch our profile from the token.
    const finish = async () => {
      if (done) return;
      done = true;
      try {
        await syncProfile();
        router.replace(postLoginPath());
      } catch (err) {
        console.error("Failed to sync user with backend:", err);
        await supabase.auth.signOut({ scope: "local" });
        router.replace("/login");
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) finish();
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // Defer: calling Supabase from inside this callback can deadlock supabase-js.
      if (event === "SIGNED_IN" && session) setTimeout(finish, 0);
    });

    // No session after a few seconds means the OAuth exchange failed.
    const timeout = setTimeout(() => {
      if (!done) router.replace("/login");
    }, 8000);

    return () => {
      clearTimeout(timeout);
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  return <PageLoader />;
}
