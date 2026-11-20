"use client";

import { useOrg } from "@/context/OrgContext";
import { MyShiftTiles } from "@/features/schedule/components/MyShiftTiles";
import type { SessionUser } from "../../types";
import { Topbar } from "../Topbar";
import { Greeting } from "./Greeting";
import { MyLocationsCard } from "./MyLocationsCard";

/** Staff see their own shifts and the locations they work at, nothing org-wide. */
export function StaffDashboard({ user }: { user: SessionUser | null }) {
  const { activeOrg } = useOrg();
  const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <>
      <Topbar title="My Shifts" />
      <div className="flex-1 overflow-y-auto p-[22px]">
        <Greeting firstName={user?.firstName} details={`${dateStr} · ${activeOrg?.name ?? ""}`} />
        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-[14px] items-start" style={{ animation: "up 0.5s 0.06s both" }}>
          <MyShiftTiles orgId={activeOrg?.id ?? null} locations={activeOrg?.locations ?? []} />
          <MyLocationsCard locations={activeOrg?.locations ?? []} />
        </div>
      </div>
    </>
  );
}
