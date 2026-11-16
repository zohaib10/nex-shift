"use client";

import { AlertTriangle, Bell, Calendar, ClipboardList, Plus, Users } from "lucide-react";
import { useOrg } from "@/context/OrgContext";
import { isOrgAdmin, managedLocations } from "@/lib/roles";
import { TeamInvitesCard } from "@/features/invites/components/TeamInvitesCard";
import type { SessionUser } from "../../types";
import { Topbar } from "../Topbar";
import { Greeting } from "./Greeting";
import { StatCard } from "./StatCard";
import { TodayScheduleCard } from "./TodayScheduleCard";
import { OnShiftNowCard } from "./OnShiftNowCard";

/** Admins see every location; managers see this same view for the locations they manage. */
export function ManagerDashboard({ user }: { user: SessionUser | null }) {
  const { activeOrg, activeLocId } = useOrg();

  const locations = activeOrg?.locations ?? [];
  const managed = managedLocations(activeOrg);
  // A manager may also be staff somewhere; invites only show where they manage.
  const managesSelection = activeLocId === null || managed.some((l) => l.id === activeLocId);
  const selectedLocName = activeLocId
    ? (locations.find((l) => l.id === activeLocId)?.name ?? "All Locations")
    : "All Locations";
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <Topbar title="Dashboard" subtitle={selectedLocName}>
        <button className="w-[32px] h-[32px] rounded-[8px] border border-brd2 bg-surf flex items-center justify-center text-tx2 hover:bg-surf2 transition-colors relative">
          <Bell className="w-[14px] h-[14px]" strokeWidth={2} />
        </button>
        <button className="h-[30px] px-[13px] rounded-[8px] bg-acc text-[#07090E] text-[0.76rem] font-[600] flex items-center gap-[5px] hover:opacity-85 transition-opacity border-none">
          <Plus className="w-[13px] h-[13px]" strokeWidth={2.5} />
          New Schedule
        </button>
      </Topbar>

      <div className="flex-1 overflow-y-auto p-[22px]">
        <Greeting firstName={user?.firstName} details={`${dateStr} · ${selectedLocName} · ${activeOrg?.name ?? ""}`} />

        <div className="grid grid-cols-4 gap-[11px] mb-[18px]" style={{ animation: "up 0.5s 0.04s both" }}>
          <StatCard icon={Users} iconClass="text-acc" label="On Shift Today" value="0" delta="No active shifts" dimClass="bg-acc-bg" />
          <StatCard icon={ClipboardList} iconClass="text-[#FFB000]" label="Pending Requests" value="0" delta="No pending requests" dimClass="bg-[rgba(255,176,0,0.1)]" />
          <StatCard icon={Calendar} iconClass="text-blu" label="Shifts This Week" value="0" delta="Add shifts to get started" dimClass="bg-blu-bg" />
          <StatCard icon={AlertTriangle} iconClass="text-[#FF4D4D]" label="Coverage Gaps" value="0" delta="Nothing to flag" dimClass="bg-[rgba(255,77,77,0.1)]" />
        </div>

        <div className="grid grid-cols-[1fr_280px] gap-[14px] mb-[14px]" style={{ animation: "up 0.5s 0.08s both" }}>
          <TodayScheduleCard locationName={selectedLocName} hasLocationSelected={!!activeLocId} />
          <OnShiftNowCard />
        </div>

        {managesSelection && (
          <TeamInvitesCard
            orgId={activeOrg?.id ?? null}
            locationId={activeLocId}
            locationName={selectedLocName}
            locations={managed}
            invitedById={user?.id ?? null}
            canInviteAnyRole={isOrgAdmin(activeOrg?.role)}
            allLocationIds={locations.map((l) => l.id)}
          />
        )}
      </div>
    </>
  );
}
