import { Calendar } from "lucide-react";
import { DayStrip } from "./DayStrip";

/** A staff member's shifts for this week. */
export function MyWeekCard() {
  return (
    <div className="bg-surf border border-brd rounded-[14px] overflow-hidden">
      <div className="p-[13px_17px] border-b border-brd">
        <div className="text-[0.84rem] font-[600] tracking-[-0.02em] text-tx">This Week</div>
        <div className="text-[0.68rem] text-tx2 mt-[1px]">Your upcoming shifts</div>
      </div>
      <DayStrip />
      <div className="flex flex-col items-center justify-center py-[40px] px-[24px] text-center">
        <div className="w-[40px] h-[40px] rounded-[10px] bg-acc-bg flex items-center justify-center mb-[12px]">
          <Calendar className="w-[18px] h-[18px] text-acc" strokeWidth={2} />
        </div>
        <div className="text-[0.86rem] font-[600] text-tx mb-[6px]">No shifts yet</div>
        <div className="text-[0.75rem] text-tx2 max-w-[260px]">
          Your shifts will show up here once a manager publishes the schedule.
        </div>
      </div>
    </div>
  );
}
