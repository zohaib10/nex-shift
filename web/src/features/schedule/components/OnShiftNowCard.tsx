import { UserCheck } from "lucide-react";
import type { Shift } from "../hooks/useShifts";
import { ShiftListItem } from "./ShiftListItem";

/** Who's working right now, with their shift times. */
export function OnShiftNowCard({
  shifts,
  tzOf,
  locationLabel,
  locationName,
}: {
  shifts: Shift[];
  tzOf: (locationId: string) => string;
  /** "Main St" or "All Locations", for the header. */
  locationLabel: string;
  /** Set when showing every location, to name each shift's. */
  locationName?: (locationId: string) => string | undefined;
}) {
  return (
    <div className="bg-surf border border-brd rounded-[14px] overflow-hidden flex flex-col">
      <div className="flex justify-between items-center p-[13px_17px] border-b border-brd">
        <div>
          <div className="text-[0.84rem] font-[600] tracking-[-0.02em] text-tx">On Shift Now</div>
          <div className="text-[0.68rem] text-tx2 mt-[1px] flex items-center gap-[5px]">
            <span className="w-[6px] h-[6px] rounded-full bg-acc animate-pulse" /> Live · {locationLabel}
          </div>
        </div>
        {shifts.length > 0 && <span className="text-[0.72rem] text-tx3 tabular-nums">{shifts.length}</span>}
      </div>
      {shifts.length > 0 ? (
        <div className="overflow-y-auto max-h-[340px]">
          {shifts.map((s) => (
            <ShiftListItem
              key={s.id}
              shift={s}
              tz={tzOf(s.locationId)}
              subtitle={[s.user ? `${s.user.firstName} ${s.user.lastName}`.trim() : "", locationName?.(s.locationId)].filter(Boolean).join(" · ")}
            />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-[32px] px-[20px] text-center">
          <div className="w-[36px] h-[36px] rounded-full bg-blu-bg flex items-center justify-center mb-[10px]">
            <UserCheck className="w-[16px] h-[16px] text-blu" strokeWidth={2} />
          </div>
          <div className="text-[0.82rem] font-[600] text-tx mb-[5px]">Nobody on shift</div>
          <div className="text-[0.7rem] text-tx2 max-w-[180px]">Staff appear here while a published shift is running.</div>
        </div>
      )}
    </div>
  );
}
