"use client";

import * as React from "react";
import { AlertTriangle, Bell, Calendar, ClipboardList, Plus, Users } from "lucide-react";
import { useOrg } from "@/context/OrgContext";
import { isOrgAdmin, managedLocations } from "@/lib/roles";
import Link from "next/link";
import { TeamInvitesCard } from "@/features/invites/components/TeamInvitesCard";
import { TodayScheduleCard } from "@/features/schedule/components/TodayScheduleCard";
import { OnShiftNowCard } from "@/features/schedule/components/OnShiftNowCard";
import { useShifts } from "@/features/schedule/hooks/useShifts";
import { useNow } from "@/features/schedule/hooks/useNow";
import { paddedWeekRange, shiftStats } from "@/features/schedule/utils/stats";
import { locationTimeZone } from "@/features/schedule/utils/time";
import { useDashboardCards } from "@/features/settings/hooks/usePreferences";
import { DASHBOARD_CARD_INFO } from "@/lib/preferences";
import { HiddenCardNotice } from "./HiddenCardNotice";
import type { SessionUser } from "../../types";
import { Topbar } from "../Topbar";
import { Greeting } from "./Greeting";
import { StatCard } from "./StatCard";

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
  // One query for the week feeds the stat cards and On Shift Now; it polls so "now" stays current.
  const now = useNow();
  const { data: shifts = [], isLoading: shiftsLoading } = useShifts(activeOrg?.id ?? null, paddedWeekRange(now), activeLocId, 60_000);
  const tzOf = (id: string) => locationTimeZone(locations.find((l) => l.id === id));
  const stats = shiftStats(shifts, tzOf, now);
  // Under "All Locations", each shift is labelled with its location.
  const locationName = activeLocId ? undefined : (id: string) => locations.find((l) => l.id === id)?.name;
  const cards = useDashboardCards();
  const [justHid, setJustHid] = React.useState(false);
  const showInvites = managesSelection && cards.ready && !cards.isHidden("teamInvites");

  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

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
        <Link href="/dashboard/schedule" className="h-[30px] px-[13px] rounded-[8px] bg-acc text-[#07090E] text-[0.76rem] font-[600] flex items-center gap-[5px] hover:opacity-85 transition-opacity no-underline">
          <Plus className="w-[13px] h-[13px]" strokeWidth={2.5} />
          Schedule
        </Link>
      </Topbar>

      <div className="flex-1 overflow-y-auto p-[22px]">
        <Greeting firstName={user?.firstName} details={`${dateStr} · ${selectedLocName} · ${activeOrg?.name ?? ""}`} />

        <div className="grid grid-cols-4 gap-[11px] mb-[18px]" style={{ animation: "up 0.5s 0.04s both" }}>
          <StatCard
            icon={Users}
            iconClass="text-acc"
            label="On Shift Today"
            value={String(stats.peopleToday)}
            delta={stats.shiftsToday ? `${plural(stats.shiftsToday, "shift")} · ${stats.onNow.length} on now` : "No shifts today"}
            dimClass="bg-acc-bg"
          />
          <StatCard icon={ClipboardList} iconClass="text-[#FFB000]" label="Pending Requests" value="0" delta="No pending requests" dimClass="bg-[rgba(255,176,0,0.1)]" />
          <StatCard
            icon={Calendar}
            iconClass="text-blu"
            label="Shifts This Week"
            value={String(stats.shiftsThisWeek)}
            delta={
              stats.shiftsThisWeek === 0
                ? "Add shifts to get started"
                : [stats.draftsThisWeek ? `${plural(stats.draftsThisWeek, "draft")} to publish` : "All published", stats.openThisWeek ? `${stats.openThisWeek} open` : ""]
                    .filter(Boolean)
                    .join(" · ")
            }
            dimClass="bg-blu-bg"
          />
          <StatCard icon={AlertTriangle} iconClass="text-[#FF4D4D]" label="Coverage Gaps" value="0" delta="Nothing to flag" dimClass="bg-[rgba(255,77,77,0.1)]" />
        </div>

        <div className="grid grid-cols-[1fr_280px] gap-[14px] mb-[14px]" style={{ animation: "up 0.5s 0.08s both" }}>
          <TodayScheduleCard
            shifts={stats.todaySchedule}
            isLoading={shiftsLoading}
            tzOf={tzOf}
            locationLabel={selectedLocName}
            locationName={locationName}
            expanded={!showInvites}
            now={now}
          />
          <OnShiftNowCard
            shifts={stats.onNow}
            tzOf={tzOf}
            locationLabel={selectedLocName}
            locationName={locationName}
          />
        </div>

        {justHid && (
          <HiddenCardNotice
            label={DASHBOARD_CARD_INFO.teamInvites.label}
            onUndo={() => { cards.setHidden("teamInvites", false); setJustHid(false); }}
            onDismiss={() => setJustHid(false)}
          />
        )}

        {showInvites && (
          <TeamInvitesCard
            orgId={activeOrg?.id ?? null}
            locationId={activeLocId}
            locationName={selectedLocName}
            locations={managed}
            canInviteAnyRole={isOrgAdmin(activeOrg?.role)}
            allLocationIds={locations.map((l) => l.id)}
            onHide={() => { cards.setHidden("teamInvites", true); setJustHid(true); }}
          />
        )}
      </div>
    </>
  );
}
