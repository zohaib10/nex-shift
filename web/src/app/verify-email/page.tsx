"use client";

import * as React from "react";
import { FullPageSpinner } from "@/components/FullPageSpinner";
import { VerifyEmailForm } from "@/features/auth/components/VerifyEmailForm";

// useSearchParams in VerifyEmailForm needs a Suspense boundary.
export default function VerifyEmailPage() {
  return (
    <React.Suspense fallback={<FullPageSpinner />}>
      <VerifyEmailForm />
    </React.Suspense>
  );
}
