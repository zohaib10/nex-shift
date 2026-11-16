import { ArrowRight, Calendar } from "lucide-react";
import { DayStrip } from "./DayStrip";

export function TodayScheduleCard({ locationName, hasLocationSelected }: { locationName: string; hasLocationSelected: boolean }) {
  const date = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="bg-surf border border-brd rounded-[14px] overflow-hidden">
      <div className="flex justify-between items-center p-[13px_17px] border-b border-brd">
        <div>
          <div className="text-[0.84rem] font-[600] tracking-[-0.02em] text-tx">Today&apos;s Schedule</div>
          <div className="text-[0.68rem] text-tx2 mt-[1px]">{locationName} · {date}</div>
        </div>
        <button className="text-[0.72rem] font-[500] text-acc bg-transparent border-none cursor-pointer hover:opacity-70 transition-opacity whitespace-nowrap">
          Full schedule →
        </button>
      </div>

      <DayStrip interactive />

      <div className="flex flex-col items-center justify-center py-[40px] px-[24px] text-center">
        <div className="w-[40px] h-[40px] rounded-[10px] bg-acc-bg flex items-center justify-center mb-[12px]">
          <Calendar className="w-[18px] h-[18px] text-acc" strokeWidth={2} />
        </div>
        <div className="text-[0.86rem] font-[600] text-tx mb-[6px]">No shifts scheduled</div>
        <div className="text-[0.75rem] text-tx2 max-w-[240px]">
          Add team members and create shifts to see your schedule here.
        </div>
        {hasLocationSelected && (
          <button className="mt-[16px] flex items-center gap-[5px] text-[0.76rem] font-[600] text-acc hover:opacity-75 transition-opacity bg-transparent border-none cursor-pointer">
            Create first shift <ArrowRight className="w-[12px] h-[12px]" strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}
