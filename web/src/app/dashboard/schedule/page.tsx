"use client";

import { Suspense } from "react";
import { FullPageSpinner } from "@/components/FullPageSpinner";
import { PageLoader } from "@/components/PageLoader";
import { useOrg } from "@/context/OrgContext";
import { managedLocations } from "@/lib/roles";
import { Topbar } from "@/features/dashboard/components/Topbar";
import { NoAccess } from "@/features/dashboard/components/NoAccess";
import { ScheduleBoard } from "@/features/schedule/components/ScheduleBoard";
import { LocationPrompt } from "@/features/schedule/components/LocationPrompt";
import { MySchedule } from "@/features/schedule/components/MySchedule";

export default function SchedulePage() {
  const { activeOrg, activeLocId, setActiveLocId, isLoading } = useOrg();
  if (isLoading) return <PageLoader />;

  const managed = managedLocations(activeOrg);
  const location = activeOrg?.locations.find((l) => l.id === activeLocId);
  const managesLocation = !!location && managed.some((l) => l.id === location.id);

  return (
    <>
      <Topbar title="Schedule" subtitle={location?.name ?? (managed.length ? "All Locations" : activeOrg?.name)} />
      <div className="flex-1 overflow-y-auto p-[22px]">
        {!activeOrg ? (
          <NoAccess title="No organization yet" hint="Create or join an organization to see a schedule." />
        ) : location && managesLocation ? (
          <ScheduleBoard key={location.id} orgId={activeOrg.id} location={location} />
        ) : !location && managed.length > 0 ? (
          <LocationPrompt locations={managed} onPick={setActiveLocId} />
        ) : (
          <Suspense fallback={<FullPageSpinner />}>
            <MySchedule orgId={activeOrg.id} locations={activeOrg.locations} locationId={location?.id ?? null} />
          </Suspense>
        )}
      </div>
    </>
  );
}
