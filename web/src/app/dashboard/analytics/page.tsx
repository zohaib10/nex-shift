"use client";

import { PageLoader } from "@/components/PageLoader";
import { useOrg } from "@/context/OrgContext";
import { dashboardKind, managedLocations } from "@/lib/roles";
import { Topbar } from "@/features/dashboard/components/Topbar";
import { NoAccess } from "@/features/dashboard/components/NoAccess";
import { InvitationHistory } from "@/features/analytics/components/InvitationHistory";

export default function AnalyticsPage() {
  const { activeOrg, activeLocId, isLoading } = useOrg();
  if (isLoading) return <PageLoader />;

  const kind = dashboardKind(activeOrg);
  // Managers only see history for locations they manage.
  const canSeeSelection =
    kind === "admin" || activeLocId === null || managedLocations(activeOrg).some((l) => l.id === activeLocId);
  const locationName = activeLocId
    ? (activeOrg?.locations.find((l) => l.id === activeLocId)?.name ?? "All Locations")
    : kind === "admin" ? "All Locations" : "Your locations";

  return (
    <>
      <Topbar title="Analytics" subtitle={locationName} />
      <div className="flex-1 overflow-y-auto p-[22px]">
        {kind === "staff" || !activeOrg || !canSeeSelection ? (
          <NoAccess
            title="Analytics are for admins and managers"
            hint={kind === "manager" ? "Pick a location you manage in the sidebar." : "Ask an admin if you need access."}
          />
        ) : (
          <InvitationHistory orgId={activeOrg.id} locationId={activeLocId} locationName={locationName} />
        )}
      </div>
    </>
  );
}
