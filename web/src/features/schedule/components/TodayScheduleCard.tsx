import Link from "next/link";
import { ArrowRight, Calendar, Loader2 } from "lucide-react";
import type { Shift } from "../hooks/useShifts";
import { ShiftListItem } from "./ShiftListItem";

const linkClass = "text-[0.72rem] font-[500] text-acc no-underline hover:opacity-70 transition-opacity whitespace-nowrap";

/** Today's shifts on the manager dashboard, for one location or all of them. */
export function TodayScheduleCard({
  shifts,
  isLoading,
  tzOf,
  locationLabel,
  locationName,
  expanded = false,
  now,
}: {
  /** Shifts overlapping today, sorted by start. */
  shifts: Shift[];
  isLoading: boolean;
  tzOf: (locationId: string) => string;
  /** "Main St" or "All Locations", for the header. */
  locationLabel: string;
  /** Set when showing every location, to name each shift's. */
  locationName?: (locationId: string) => string | undefined;
  /** Taller list, when the dashboard has room (Team Invites hidden). */
  expanded?: boolean;
  now: Date;
}) {
  const date = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const who = (s: Shift) => (s.user ? `${s.user.firstName} ${s.user.lastName}`.trim() : "Open shift");

  return (
    <div className="bg-surf border border-brd rounded-[14px] overflow-hidden">
      <div className="flex justify-between items-center p-[13px_17px] border-b border-brd">
        <div>
          <div className="text-[0.84rem] font-[600] tracking-[-0.02em] text-tx">Today&apos;s Schedule</div>
          <div className="text-[0.68rem] text-tx2 mt-[1px]">{locationLabel} · {date}</div>
        </div>
        <Link href="/dashboard/schedule" className={linkClass}>Full schedule →</Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-[36px]"><Loader2 className="w-[16px] h-[16px] animate-spin text-acc" /></div>
      ) : shifts.length > 0 ? (
        <div className={`overflow-y-auto ${expanded ? "max-h-[640px]" : "max-h-[340px]"}`}>
          {shifts.map((s) => (
            <ShiftListItem
              key={s.id}
              shift={s}
              tz={tzOf(s.locationId)}
              subtitle={[who(s), locationName?.(s.locationId)].filter(Boolean).join(" · ")}
              now={now}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-[40px] px-[24px] text-center">
          <div className="w-[40px] h-[40px] rounded-[10px] bg-acc-bg flex items-center justify-center mb-[12px]">
            <Calendar className="w-[18px] h-[18px] text-acc" strokeWidth={2} />
          </div>
          <div className="text-[0.86rem] font-[600] text-tx mb-[6px]">No shifts today</div>
          <div className="text-[0.75rem] text-tx2 max-w-[240px]">Build the week on the schedule, then publish it to your team.</div>
          <Link href="/dashboard/schedule" className="mt-[16px] flex items-center gap-[5px] text-[0.76rem] font-[600] text-acc hover:opacity-75 transition-opacity no-underline">
            Create a shift <ArrowRight className="w-[12px] h-[12px]" strokeWidth={2.5} />
          </Link>
        </div>
      )}
    </div>
  );
}
