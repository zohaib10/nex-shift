import type { Shift } from "../hooks/useShifts";
import { cellKey } from "../utils/group";
import type { DateKey, WeekDay } from "../utils/time";
import { ScheduleRow, type ScheduleRowData } from "./ScheduleRow";

/** People down the side, the week across the top. */
export function ScheduleGrid({
  days,
  rows,
  cells,
  tz,
  onAdd,
  onEdit,
}: {
  days: WeekDay[];
  rows: ScheduleRowData[];
  cells: Map<string, Shift[]>;
  tz: string;
  onAdd: (rowId: string, day: DateKey) => void;
  onEdit: (shift: Shift) => void;
}) {
  return (
    <div className="bg-surf border border-brd rounded-[14px] overflow-x-auto">
      <div className="min-w-[900px]">
        <div className="grid grid-cols-[170px_repeat(7,minmax(104px,1fr))]">
          <div className="px-[12px] py-[9px] text-[0.62rem] font-[600] uppercase tracking-[0.07em] text-tx3 self-end">Team</div>
          {days.map((d) => (
            <div key={d.key} className={`px-[8px] py-[8px] border-l border-brd ${d.isToday ? "bg-acc-bg/40" : ""}`}>
              <div className="text-[0.58rem] font-[600] uppercase tracking-[0.07em] text-tx3">{d.dayName}</div>
              <div className={`text-[0.9rem] font-[600] ${d.isToday ? "text-acc" : "text-tx"}`}>{d.dayNum}</div>
            </div>
          ))}
        </div>
        {rows.map((r) => (
          <ScheduleRow
            key={r.id}
            row={r}
            days={days}
            cellShifts={(day) => cells.get(cellKey(r.id, day)) ?? []}
            tz={tz}
            onAdd={(day) => onAdd(r.id, day)}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
}
