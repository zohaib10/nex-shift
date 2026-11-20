"use client";

import { Suspense } from "react";
import { PageLoader } from "@/components/PageLoader";
import { FullPageSpinner } from "@/components/FullPageSpinner";
import { useOrg } from "@/context/OrgContext";
import { dashboardKind } from "@/lib/roles";
import { Topbar } from "@/features/dashboard/components/Topbar";
import { NoAccess } from "@/features/dashboard/components/NoAccess";
import { TeamView } from "@/features/team/components/TeamView";

export default function TeamPage() {
  const { activeOrg, activeLocId, isLoading } = useOrg();
  if (isLoading) return <PageLoader />;

  return (
    <>
      <Topbar title="Team" subtitle={activeOrg?.name} />
      <div className="flex-1 overflow-y-auto p-[22px]">
        {activeOrg && dashboardKind(activeOrg) !== "staff" ? (
          <Suspense fallback={<FullPageSpinner />}>
            <TeamView org={activeOrg} locationId={activeLocId} />
          </Suspense>
        ) : (
          <NoAccess title="Only admins and managers can see the team" hint="Ask an admin if your access needs to change." />
        )}
      </div>
    </>
  );
}
