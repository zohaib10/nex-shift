import { ChevronLeft, ChevronRight } from "lucide-react";

const arrowClass =
  "w-[30px] h-[30px] rounded-[8px] border border-brd2 bg-surf flex items-center justify-center text-tx2 hover:bg-surf2 transition-colors cursor-pointer";

/** Previous / next arrows, the period's label, and a jump back to the current one. */
export function PeriodNav({
  label,
  onPrev,
  onNext,
  onToday,
  unit = "week",
  todayLabel = "Today",
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  unit?: "week" | "month";
  todayLabel?: string;
}) {
  return (
    <div className="flex items-center gap-[7px]">
      <button type="button" onClick={onPrev} aria-label={`Previous ${unit}`} className={arrowClass}>
        <ChevronLeft className="w-[14px] h-[14px]" strokeWidth={2} />
      </button>
      <button type="button" onClick={onNext} aria-label={`Next ${unit}`} className={arrowClass}>
        <ChevronRight className="w-[14px] h-[14px]" strokeWidth={2} />
      </button>
      <span className="text-[0.92rem] font-[600] tracking-[-0.02em] text-tx min-w-[120px] px-[4px]">{label}</span>
      <button
        type="button"
        onClick={onToday}
        className="h-[30px] px-[11px] rounded-[8px] border border-brd2 bg-surf text-[0.76rem] font-[500] text-tx2 hover:bg-surf2 transition-colors cursor-pointer"
      >
        {todayLabel}
      </button>
    </div>
  );
}
