"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { OrgLocation } from "@/context/OrgContext";
import { Tabs } from "@/components/ui/Tabs";
import { MyShifts } from "./MyShifts";
import { ShiftHistory } from "./ShiftHistory";

type Tab = "upcoming" | "history";

const TABS: { value: Tab; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "history", label: "History" },
];

/** A staff member's Schedule page: their week ahead, and past shifts. The tab is in the URL (?tab=). */
export function MySchedule({ orgId, locations, locationId }: { orgId: string; locations: OrgLocation[]; locationId: string | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const tab: Tab = params.get("tab") === "history" ? "history" : "upcoming";

  return (
    <>
      <Tabs tabs={TABS} value={tab} onChange={(t) => router.replace(t === "upcoming" ? pathname : `${pathname}?tab=${t}`)} />
      {tab === "upcoming" ? (
        <MyShifts orgId={orgId} locations={locations} locationId={locationId} />
      ) : (
        <ShiftHistory orgId={orgId} locations={locations} locationId={locationId} />
      )}
    </>
  );
}
