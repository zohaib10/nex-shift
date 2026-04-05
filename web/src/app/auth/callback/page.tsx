"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import api from "@/lib/api";
import { PageLoader } from "@/components/PageLoader";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        try {
          const names = session.user.user_metadata?.full_name?.split(' ') || [];
          const firstName = names[0] || 'User';
          const lastName = names.slice(1).join(' ') || '';

          // Send to our backend to ensure they exist in Prisma
          const response = await api.post('/auth/google-sync', {
            supabaseId: session.user.id,
            email: session.user.email,
            firstName,
            lastName
          });

          // Set our standard mock session from the backend response
          localStorage.setItem("rosta_session", JSON.stringify({
            id: response.data.id,
            supabaseId: response.data.supabaseId,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            email: response.data.email,
          }));

          // Redirect to the dashboard
          router.replace('/dashboard');
        } catch (err) {
          console.error("Failed to sync Google user with backend:", err);
          router.replace('/login');
        }
      } else {
        router.replace('/login');
      }
    });

    // We can also listen for auth state changes just in case
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const names = session.user.user_metadata?.full_name?.split(' ') || [];
          const firstName = names[0] || 'User';
          const lastName = names.slice(1).join(' ') || '';

          const response = await api.post('/auth/google-sync', {
            supabaseId: session.user.id,
            email: session.user.email,
            firstName,
            lastName
          });

          localStorage.setItem("rosta_session", JSON.stringify({
            id: response.data.id,
            supabaseId: response.data.supabaseId,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            email: response.data.email,
          }));

          router.replace('/dashboard');
        } catch (err) {
          router.replace('/login');
        }
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  return <PageLoader />;
}
