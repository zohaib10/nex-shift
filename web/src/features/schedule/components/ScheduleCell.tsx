import { Plus } from "lucide-react";
import type { Shift } from "../hooks/useShifts";
import { ShiftChip } from "./ShiftChip";

/** One person on one day: their shifts, and a + to add another. */
export function ScheduleCell({
  shifts,
  tz,
  isToday,
  onAdd,
  onEdit,
}: {
  shifts: Shift[];
  tz: string;
  isToday: boolean;
  onAdd: () => void;
  onEdit: (shift: Shift) => void;
}) {
  return (
    <div className={`group min-h-[56px] p-[5px] border-l border-brd flex flex-col gap-[4px] ${isToday ? "bg-acc-bg/40" : ""}`}>
      {shifts.map((s) => <ShiftChip key={s.id} shift={s} tz={tz} onClick={() => onEdit(s)} />)}
      <button
        type="button"
        onClick={onAdd}
        aria-label="Add shift"
        className="w-full flex-1 min-h-[22px] rounded-[6px] border border-dashed border-brd2 bg-transparent flex items-center justify-center text-tx3 hover:text-acc hover:border-acc cursor-pointer transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
      >
        <Plus className="w-[12px] h-[12px]" strokeWidth={2.5} />
      </button>
    </div>
  );
}
