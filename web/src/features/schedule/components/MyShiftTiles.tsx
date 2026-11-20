"use client";

import Link from "next/link";
import { Calendar, Loader2 } from "lucide-react";
import type { OrgLocation } from "@/context/OrgContext";
import { useShifts } from "../hooks/useShifts";
import { useNow } from "../hooks/useNow";
import { locationTimeZone } from "../utils/time";
import { ShiftTile } from "./ShiftTile";

const LOOKAHEAD_DAYS = 14;

/** A staff member's upcoming published shifts, one card each, on their dashboard. */
export function MyShiftTiles({ orgId, locations }: { orgId: string | null; locations: OrgLocation[] }) {
  const now = useNow();
  // Whole hours keep the query key stable between minute ticks.
  const hour = new Date(now);
  hour.setMinutes(0, 0, 0);
  const range = {
    from: new Date(hour.getTime() - 86_400_000).toISOString(),
    to: new Date(hour.getTime() + LOOKAHEAD_DAYS * 86_400_000).toISOString(),
  };
  // Without a location, staff get only their own published shifts.
  const { data: shifts = [], isLoading } = useShifts(orgId, range, null, 60_000);
  const upcoming = shifts.filter((s) => new Date(s.endsAt) > now);
  const location = (id: string) => locations.find((l) => l.id === id);

  return (
    <section>
      <div className="flex justify-between items-baseline mb-[10px]">
        <div>
          <div className="text-[0.92rem] font-[600] tracking-[-0.02em] text-tx">Your Shifts</div>
          <div className="text-[0.7rem] text-tx2">Next {LOOKAHEAD_DAYS} days</div>
        </div>
        <Link href="/dashboard/schedule" className="text-[0.72rem] font-[500] text-acc no-underline hover:opacity-70 transition-opacity">
          Full schedule →
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-[40px]"><Loader2 className="w-[18px] h-[18px] animate-spin text-acc" /></div>
      ) : upcoming.length === 0 ? (
        <div className="bg-surf border border-brd rounded-[14px] flex flex-col items-center justify-center py-[40px] px-[24px] text-center">
          <div className="w-[40px] h-[40px] rounded-[10px] bg-acc-bg flex items-center justify-center mb-[12px]">
            <Calendar className="w-[18px] h-[18px] text-acc" strokeWidth={2} />
          </div>
          <div className="text-[0.86rem] font-[600] text-tx mb-[6px]">No upcoming shifts</div>
          <div className="text-[0.75rem] text-tx2 max-w-[260px]">Your shifts show up here once a manager publishes the schedule.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[11px]">
          {upcoming.map((s) => (
            <ShiftTile
              key={s.id}
              shift={s}
              tz={locationTimeZone(location(s.locationId))}
              locationName={location(s.locationId)?.name}
              now={now}
            />
          ))}
        </div>
      )}
    </section>
  );
}
