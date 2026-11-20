"use client";

import { useMemo, useSyncExternalStore } from "react";
import { PageLoader } from "@/components/PageLoader";
import { useOrg } from "@/context/OrgContext";
import { DashboardView } from "@/features/dashboard/components/home/DashboardView";
import { EmptyOrgState } from "@/features/dashboard/components/home/EmptyOrgState";
import type { SessionUser } from "@/features/dashboard/types";

// The cached profile in localStorage. Read through useSyncExternalStore so the
// server render (no localStorage) and the browser render agree.
const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};
const readProfile = () => localStorage.getItem("rosta_session");
const noProfileOnServer = () => undefined;

export function DashboardHome() {
  const raw = useSyncExternalStore(subscribe, readProfile, noProfileOnServer);
  const user = useMemo<SessionUser | null>(() => (raw ? JSON.parse(raw) : null), [raw]);
  const { activeOrg, isLoading: orgsLoading } = useOrg();

  // `raw` is undefined only during the server render, before localStorage is readable.
  if (raw === undefined || orgsLoading) return <PageLoader />;
  if (!activeOrg) return <EmptyOrgState />;
  return <DashboardView user={user} />;
}
