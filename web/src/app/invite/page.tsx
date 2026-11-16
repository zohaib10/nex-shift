"use client";

import * as React from "react";
import { FullPageSpinner } from "@/components/FullPageSpinner";
import { InviteAcceptance } from "@/features/invites/components/InviteAcceptance";

// useSearchParams in InviteAcceptance needs a Suspense boundary.
export default function InvitePage() {
  return (
    <React.Suspense fallback={<FullPageSpinner />}>
      <InviteAcceptance />
    </React.Suspense>
  );
}
