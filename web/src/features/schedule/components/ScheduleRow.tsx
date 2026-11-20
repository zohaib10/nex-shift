import type * as React from "react";
import type { Shift } from "../hooks/useShifts";
import type { DateKey, WeekDay } from "../utils/time";
import { ScheduleCell } from "./ScheduleCell";

export interface ScheduleRowData {
  /** A user id, or OPEN_ROW. */
  id: string;
  label: string;
  /** Under the name: their positions, or a hint. */
  detail: React.ReactNode;
  hours: string | null;
}

export function ScheduleRow({
  row,
  days,
  cellShifts,
  tz,
  onAdd,
  onEdit,
}: {
  row: ScheduleRowData;
  days: WeekDay[];
  cellShifts: (day: DateKey) => Shift[];
  tz: string;
  onAdd: (day: DateKey) => void;
  onEdit: (shift: Shift) => void;
}) {
  return (
    <div className="grid grid-cols-[170px_repeat(7,minmax(104px,1fr))] border-t border-brd">
      <div className="px-[12px] py-[8px] min-w-0">
        <div className="flex items-baseline justify-between gap-[6px]">
          <span className="text-[0.8rem] font-[600] text-tx truncate">{row.label}</span>
          {row.hours && <span className="text-[0.66rem] text-tx3 tabular-nums shrink-0">{row.hours}</span>}
        </div>
        <div className="flex flex-wrap gap-[3px] mt-[3px]">{row.detail}</div>
      </div>
      {days.map((d) => (
        <ScheduleCell
          key={d.key}
          shifts={cellShifts(d.key)}
          tz={tz}
          isToday={d.isToday}
          onAdd={() => onAdd(d.key)}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
