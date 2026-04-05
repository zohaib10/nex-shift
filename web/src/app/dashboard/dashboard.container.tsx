"use client";

import React, { useEffect, useState } from "react";
import { DashboardComponent, EmptyOrgComponent } from "./dashboard.component";
import { PageLoader } from "@/components/PageLoader";
import api from "@/lib/api";

export function DashboardContainer() {
  const [hasOrg, setHasOrg] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const sessionStr = localStorage.getItem("rosta_session");
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        api.get(`/organizations/has-membership/${session.id}`)
          .then(res => setHasOrg(res.data.hasMembership))
          .catch(() => setHasOrg(true)); // Fallback allowing access on error
      }
    } catch {
      setHasOrg(true);
    }
  }, []);

  if (hasOrg === null) return <PageLoader />;

  if (!hasOrg) {
    return <EmptyOrgComponent />;
  }

  return <DashboardComponent />;
}
