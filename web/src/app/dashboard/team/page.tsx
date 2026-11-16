"use client";

import { PageLoader } from "@/components/PageLoader";
import { useOrg } from "@/context/OrgContext";
import { isOrgAdmin } from "@/lib/roles";
import { Topbar } from "@/features/dashboard/components/Topbar";
import { NoAccess } from "@/features/dashboard/components/NoAccess";
import { TeamList } from "@/features/team/components/TeamList";

export default function TeamPage() {
  const { activeOrg, isLoading } = useOrg();
  if (isLoading) return <PageLoader />;

  return (
    <>
      <Topbar title="Team" subtitle={activeOrg?.name} />
      <div className="flex-1 overflow-y-auto p-[22px]">
        {activeOrg && isOrgAdmin(activeOrg.role) ? (
          <TeamList org={activeOrg} />
        ) : (
          <NoAccess title="Only admins can manage the team" hint="Ask an admin if your access needs to change." />
        )}
      </div>
    </>
  );
}
