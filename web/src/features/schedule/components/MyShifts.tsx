"use client";

import * as React from "react";
import { Calendar, Loader2 } from "lucide-react";
import type { OrgLocation } from "@/context/OrgContext";
import { apiErrorMessage } from "@/features/team/hooks/useTeam";
import { useShifts } from "../hooks/useShifts";
import { useNow } from "../hooks/useNow";
import { addDays, browserTimeZone, dateKeyIn, dayLabel, locationTimeZone, startOfWeek, weekLabel, weekRange, type DateKey } from "../utils/time";
import { PeriodNav } from "./PeriodNav";
import { ShiftListItem } from "./ShiftListItem";

/** A staff member's own published shifts, a week at a time. */
export function MyShifts({
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
  // Each shift shows in its own location's timezone; the week follows the selected one.
  const tz = selected ? locationTimeZone(selected) : browserTimeZone();
  const now = useNow();
  const today = dateKeyIn(now, tz);
  const [monday, setMonday] = React.useState<DateKey>(() => startOfWeek(today));
  const { data: shifts = [], isLoading, error } = useShifts(orgId, weekRange(monday, tz), locationId);

  const tzOf = (id: string) => locationTimeZone(locations.find((l) => l.id === id));
  const nameOf = (id: string) => locations.find((l) => l.id === id)?.name;
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

  return (
    <>
      <div className="mb-[14px]">
        <PeriodNav
          label={weekLabel(monday)}
          onPrev={() => setMonday(addDays(monday, -7))}
          onNext={() => setMonday(addDays(monday, 7))}
          onToday={() => setMonday(startOfWeek(today))}
        />
      </div>

      {error && <p className="text-[0.8rem] text-red-500 mb-[10px]">{apiErrorMessage(error, "Couldn't load your shifts.")}</p>}
      {isLoading ? (
        <div className="flex justify-center py-[48px]"><Loader2 className="w-[18px] h-[18px] animate-spin text-acc" /></div>
      ) : shifts.length === 0 ? (
        <div className="flex flex-col items-center py-[48px] text-center">
          <Calendar className="w-[18px] h-[18px] text-tx3 mb-[10px]" strokeWidth={2} />
          <div className="text-[0.86rem] font-[600] text-tx">No shifts this week</div>
          <div className="text-[0.75rem] text-tx2 mt-[4px]">Your shifts show up here once a manager publishes the schedule.</div>
        </div>
      ) : (
        <div className="bg-surf border border-brd rounded-[14px] overflow-hidden max-w-[640px]">
          {days.map((day) => {
            const onDay = shifts.filter((s) => dateKeyIn(s.startsAt, tzOf(s.locationId)) === day);
            if (onDay.length === 0) return null;
            return (
              <div key={day} className="border-t border-brd first:border-none">
                <div className={`px-[17px] pt-[10px] text-[0.66rem] font-[600] uppercase tracking-[0.07em] ${day === today ? "text-acc" : "text-tx3"}`}>
                  {day === today ? "Today · " : ""}{dayLabel(day)}
                </div>
                {onDay.map((s) => (
                  <ShiftListItem
                    key={s.id}
                    shift={s}
                    tz={tzOf(s.locationId)}
                    subtitle={locations.length > 1 ? nameOf(s.locationId) : undefined}
                    now={now}
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
