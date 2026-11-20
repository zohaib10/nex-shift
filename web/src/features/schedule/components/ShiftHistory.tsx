"use client";

import * as React from "react";
import { History, Loader2 } from "lucide-react";
import type { OrgLocation } from "@/context/OrgContext";
import { apiErrorMessage } from "@/features/team/hooks/useTeam";
import { useShifts } from "../hooks/useShifts";
import { useNow } from "../hooks/useNow";
import { shiftState } from "../utils/state";
import {
  addMonths,
  browserTimeZone,
  dateKeyIn,
  dayLabel,
  hoursBetween,
  locationTimeZone,
  monthLabel,
  startOfMonth,
  zonedToUtc,
  type DateKey,
} from "../utils/time";
import { PeriodNav } from "./PeriodNav";
import { HistorySummary } from "./HistorySummary";
import { ShiftListItem } from "./ShiftListItem";

/** A staff member's past shifts, a month at a time, newest first, with totals. */
export function ShiftHistory({
  orgId,
  locations,
  locationId,
}: {
  orgId: string;
  locations: OrgLocation[];
  /** null = every location they work at. */
  locationId: string | null;
}) {
  const selected = locations.find((l) => l.id === locationId);
  const tz = selected ? locationTimeZone(selected) : browserTimeZone();
  const now = useNow();
  const thisMonth = startOfMonth(dateKeyIn(now, tz));
  const [month, setMonth] = React.useState<DateKey>(thisMonth);

  const range = {
    from: zonedToUtc(month, "00:00", tz).toISOString(),
    to: zonedToUtc(addMonths(month, 1), "00:00", tz).toISOString(),
  };
  const { data: shifts = [], isLoading, error } = useShifts(orgId, range, locationId);

  const tzOf = (id: string) => locationTimeZone(locations.find((l) => l.id === id));
  // History = shifts that started this month and have begun (or were cancelled), newest first.
  // The query returns overlaps, so an overnight shift from last month is dropped here.
  const past = shifts
    .filter((s) => s.startsAt >= range.from)
    .filter((s) => new Date(s.startsAt) <= now || s.status === "cancelled")
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  const states = past.map((s) => shiftState(s, now));
  const completed = past.filter((_, i) => states[i] === "completed");

  return (
    <>
      <div className="mb-[14px]">
        <PeriodNav
          unit="month"
          label={monthLabel(month)}
          todayLabel="This month"
          onPrev={() => setMonth(addMonths(month, -1))}
          onNext={() => setMonth(addMonths(month, 1))}
          onToday={() => setMonth(thisMonth)}
        />
      </div>

      {error && <p className="text-[0.8rem] text-red-500 mb-[10px]">{apiErrorMessage(error, "Couldn't load your history.")}</p>}
      {isLoading ? (
        <div className="flex justify-center py-[48px]"><Loader2 className="w-[18px] h-[18px] animate-spin text-acc" /></div>
      ) : (
        <>
          <HistorySummary
            hours={completed.reduce((sum, s) => sum + hoursBetween(s.startsAt, s.endsAt), 0)}
            completed={completed.length}
            noShows={states.filter((s) => s === "no_show").length}
            cancelled={states.filter((s) => s === "cancelled").length}
          />
          {past.length === 0 ? (
            <div className="flex flex-col items-center py-[40px] text-center">
              <History className="w-[18px] h-[18px] text-tx3 mb-[10px]" strokeWidth={2} />
              <div className="text-[0.84rem] font-[600] text-tx">No shifts in {monthLabel(month)}</div>
            </div>
          ) : (
            <div className="bg-surf border border-brd rounded-[14px] overflow-hidden max-w-[720px]">
              {past.map((s) => (
                <ShiftListItem
                  key={s.id}
                  shift={s}
                  tz={tzOf(s.locationId)}
                  now={now}
                  subtitle={[
                    dayLabel(dateKeyIn(s.startsAt, tzOf(s.locationId))),
                    locations.length > 1 ? locations.find((l) => l.id === s.locationId)?.name : "",
                  ].filter(Boolean).join(" · ")}
                />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
