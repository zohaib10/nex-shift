import { getDayStrip } from "../../utils/dates";

/** This week's days in a row, with today highlighted. */
export function DayStrip({ interactive = false }: { interactive?: boolean }) {
  const days = getDayStrip(new Date());
  return (
    <div className="flex gap-[3px] px-[17px] py-[10px] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {days.map((d) => (
        <div
          key={d.dayName}
          className={`shrink-0 min-w-[42px] flex flex-col items-center p-[6px_7px] rounded-[8px] border transition-colors duration-150 ${
            d.isToday ? "border-brd2 bg-surf2" : `border-transparent ${interactive ? "cursor-pointer hover:bg-surf2" : ""}`
          }`}
        >
          <div className="text-[0.54rem] font-[600] uppercase tracking-[0.07em] text-tx3">{d.dayName}</div>
          <div className="text-[0.86rem] font-[600] text-tx mt-[1px]">{d.dayNum}</div>
        </div>
      ))}
    </div>
  );
}
