"use client";

import * as React from "react";
import { FullPageSpinner } from "@/components/FullPageSpinner";
import { OnboardingFlow } from "@/features/onboarding/components/OnboardingFlow";

// useSearchParams in OnboardingFlow needs a Suspense boundary.
export default function OnboardingPage() {
  return (
    <React.Suspense fallback={<FullPageSpinner />}>
      <OnboardingFlow />
    </React.Suspense>
  );
}
