"use client";

import * as React from "react";
import { FullPageSpinner } from "@/components/FullPageSpinner";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

// useSearchParams in ResetPasswordForm needs a Suspense boundary.
export default function ResetPassword() {
  return (
    <React.Suspense fallback={<FullPageSpinner />}>
      <ResetPasswordForm />
    </React.Suspense>
  );
}
