"use client";

import { useOrg } from "@/context/OrgContext";
import { dashboardKind } from "@/lib/roles";
import { Topbar } from "@/features/dashboard/components/Topbar";
import { NoAccess } from "@/features/dashboard/components/NoAccess";
import { DashboardSettings } from "@/features/settings/components/DashboardSettings";

export default function SettingsPage() {
  const { activeOrg } = useOrg();

  return (
    <>
      <Topbar title="Settings" />
      <div className="flex-1 overflow-y-auto p-[22px]">
        {dashboardKind(activeOrg) !== "staff" ? (
          <DashboardSettings />
        ) : (
          <NoAccess title="Nothing to set up yet" hint="Settings for your shifts are coming soon." />
        )}
      </div>
    </>
  );
}
