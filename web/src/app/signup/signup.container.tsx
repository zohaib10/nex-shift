"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignup } from "@/hooks/auth/useSignup";
import { SignupComponent } from "./signup.component";
import type { SignupPayload } from "@/hooks/auth/types";

export function SignupContainer() {
  const router = useRouter();
  const { mutate, isPending } = useSignup();
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = (data: SignupPayload) => {
    setApiError(null);
    mutate(data, {
      onSuccess: (response) => {
        // Save the basic user info to local storage so the dashboard catches an active authenticated session
        localStorage.setItem("rosta_session", JSON.stringify({
          id: response.id,
          firstName: response.firstName,
          lastName: response.lastName,
          email: response.email,
        }));
        router.push('/dashboard');
      },
      onError: (err) => {
        const msg = err.response?.data?.message || err.message || "An error occurred during signup.";
        setApiError(typeof msg === "string" ? msg : Array.isArray(msg) ? msg[0] : "An error occurred during signup.");
      },
    });
  };

  return (
    <SignupComponent
      onSubmit={handleSubmit}
      isPending={isPending}
      apiError={apiError}
    />
  );
}
