"use client";

import React, { useEffect, useState } from "react";
import { DashboardComponent, EmptyOrgComponent } from "./dashboard.component";
import { PageLoader } from "@/components/PageLoader";
import { useOrg } from "@/context/OrgContext";

export function DashboardContainer() {
  const [user, setUser] = useState<any>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const { activeOrg, isLoading: orgsLoading, addLocationToOrg } = useOrg();

  useEffect(() => {
    const raw = localStorage.getItem("rosta_session");
    if (raw) setUser(JSON.parse(raw));
    setUserLoaded(true);
  }, []);

  if (!userLoaded || orgsLoading) return <PageLoader />;

  if (!activeOrg) {
    return <EmptyOrgComponent user={user} />;
  }

  return (
    <DashboardComponent
      user={user}
      onLocationAdded={(loc) => addLocationToOrg(activeOrg.id, loc)}
    />
  );
}
