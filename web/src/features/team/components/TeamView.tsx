"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { UserOrg } from "@/context/OrgContext";
import { isOrgAdmin, managedLocations } from "@/lib/roles";
import { NoAccess } from "@/features/dashboard/components/NoAccess";
import { PositionsCard } from "@/features/positions/components/PositionsCard";
import { InvitationHistory } from "@/features/invites/components/history/InvitationHistory";
import { InviteMemberPanel } from "@/features/invites/components/InviteMemberPanel";
import { TeamList } from "./TeamList";
import { Tabs } from "@/components/ui/Tabs";

type TeamTab = "people" | "invitations";

/**
 * Admins get People (members, positions) and Invitations. Managers only get
 * Invitations, for the locations they manage. Both can invite from either tab.
 * The tab is in the URL (?tab=).
 */
export function TeamView({ org, locationId }: { org: UserOrg; locationId: string | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [inviteOpen, setInviteOpen] = React.useState(false);

  const admin = isOrgAdmin(org.role);
  const tabs: { value: TeamTab; label: string }[] = [
    ...(admin ? [{ value: "people" as const, label: "People" }] : []),
    { value: "invitations", label: "Invitations" },
  ];
  const tab: TeamTab = params.get("tab") === "invitations" || !admin ? "invitations" : "people";

  const managed = managedLocations(org);
  const inviteLocation = managed.find((l) => l.id === locationId);
  const canSeeLocation = admin || locationId === null || managed.some((l) => l.id === locationId);
  const locationName = locationId
    ? (org.locations.find((l) => l.id === locationId)?.name ?? "All Locations")
    : admin ? "All Locations" : "Your locations";

  return (
    <>
      <Tabs
        tabs={tabs}
        value={tab}
        onChange={(t) => router.replace(t === "people" ? pathname : `${pathname}?tab=${t}`)}
        actions={
          managed.length > 0 && (
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="h-[30px] px-[12px] rounded-[8px] bg-acc text-[#07090E] text-[0.76rem] font-[600] flex items-center gap-[5px] hover:opacity-85 transition-opacity border-none cursor-pointer"
            >
              <Plus className="w-[13px] h-[13px]" strokeWidth={2.5} />
              Invite people
            </button>
          )
        }
      />
      {tab === "people" ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-[14px] items-start">
          <TeamList org={org} />
          <PositionsCard orgId={org.id} />
        </div>
      ) : canSeeLocation ? (
        <InvitationHistory orgId={org.id} locationId={locationId} locationName={locationName} />
      ) : (
        <NoAccess title="You don't manage this location" hint="Pick a location you manage in the sidebar." />
      )}

      {/* Managers invite to the locations they manage; a selected one they manage is preselected. */}
      <InviteMemberPanel
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        orgId={org.id}
        locations={managed}
        defaultLocationId={inviteLocation?.id ?? null}
        defaultLocationName={inviteLocation?.name ?? "All Locations"}
        canInviteAnyRole={admin}
        allLocationIds={org.locations.map((l) => l.id)}
      />
    </>
  );
}
