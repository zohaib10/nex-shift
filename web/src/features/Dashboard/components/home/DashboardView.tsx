"use client";

import { useOrg } from "@/context/OrgContext";
import { dashboardKind } from "@/lib/roles";
import type { SessionUser } from "../../types";
import { ManagerDashboard } from "./ManagerDashboard";
import { StaffDashboard } from "./StaffDashboard";

/** Picks the dashboard for the user's role in the active organization. */
export function DashboardView({ user }: { user: SessionUser | null }) {
  const { activeOrg } = useOrg();
  if (dashboardKind(activeOrg) === "staff") return <StaffDashboard user={user} />;
  return <ManagerDashboard user={user} />;
}
