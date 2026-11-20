import { SHIFT_STATE_INFO, type ShiftState } from "../utils/state";

export function ShiftStateBadge({ state }: { state: ShiftState }) {
  const info = SHIFT_STATE_INFO[state];
  return (
    <span className={`inline-flex items-center gap-[5px] text-[0.62rem] font-[600] uppercase tracking-[0.05em] px-[7px] py-[2px] rounded-full whitespace-nowrap ${info.className}`}>
      {state === "in_progress" && <span className="w-[6px] h-[6px] rounded-full bg-acc animate-pulse" />}
      {info.label}
    </span>
  );
}
