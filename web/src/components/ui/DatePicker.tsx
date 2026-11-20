"use client";

import * as React from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Popover } from "./Popover";
import { PickerButton } from "./PickerButton";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/** Calendar-day maths on "YYYY-MM-DD" strings, in UTC so no timezone can shift a day. */
const toDate = (key: string) => new Date(`${key}T00:00:00Z`);
const toKey = (d: Date) => d.toISOString().slice(0, 10);
const fmt = (key: string, opts: Intl.DateTimeFormatOptions) => toDate(key).toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });

/** The 6×7 grid of days shown for a month, starting on a Monday. */
function monthGrid(month: string): string[] {
  const first = toDate(month);
  const offset = (first.getUTCDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, i) =>
    toKey(new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), 1 - offset + i)))
  );
}

/** Pick a calendar day. `value` and `today` are "YYYY-MM-DD". */
export function DatePicker({
  value,
  onChange,
  today,
  disabled,
}: {
  value: string;
  onChange: (day: string) => void;
  /** Highlighted as today (in the location's timezone). */
  today: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState(() => `${(value || today).slice(0, 7)}-01`);

  function toggle() {
    if (!open) setMonth(`${(value || today).slice(0, 7)}-01`);
    setOpen(!open);
  }

  function shiftMonth(n: number) {
    const d = toDate(month);
    setMonth(toKey(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1))));
  }

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger={
        <PickerButton
          icon={CalendarDays}
          label={value ? fmt(value, { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "Pick a date"}
          open={open}
          onClick={toggle}
          disabled={disabled}
        />
      }
    >
      <div className="p-[10px] w-[260px]" role="dialog" aria-label="Choose date">
        <div className="flex items-center justify-between mb-[6px]">
          <button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month" className="w-[28px] h-[28px] rounded-[7px] flex items-center justify-center text-tx2 hover:bg-surf2 bg-transparent border-none cursor-pointer">
            <ChevronLeft className="w-[14px] h-[14px]" strokeWidth={2} />
          </button>
          <span className="text-[0.84rem] font-[600] text-tx">{fmt(month, { month: "long", year: "numeric" })}</span>
          <button type="button" onClick={() => shiftMonth(1)} aria-label="Next month" className="w-[28px] h-[28px] rounded-[7px] flex items-center justify-center text-tx2 hover:bg-surf2 bg-transparent border-none cursor-pointer">
            <ChevronRight className="w-[14px] h-[14px]" strokeWidth={2} />
          </button>
        </div>
        <div className="grid grid-cols-7 mb-[2px]">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-[0.6rem] font-[600] uppercase tracking-[0.05em] text-tx3 py-[4px]">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-[2px]">
          {monthGrid(month).map((day) => {
            const inMonth = day.slice(0, 7) === month.slice(0, 7);
            const selected = day === value;
            const isToday = day === today;
            return (
              <button
                key={day}
                type="button"
                onClick={() => { onChange(day); setOpen(false); }}
                aria-label={fmt(day, { weekday: "long", month: "long", day: "numeric" })}
                aria-pressed={selected}
                className={`h-[32px] rounded-[8px] text-[0.8rem] tabular-nums border-none cursor-pointer transition-colors ${
                  selected
                    ? "bg-acc text-[#07090E] font-[700]"
                    : `${inMonth ? "text-tx" : "text-tx3 opacity-50"} ${isToday ? "ring-1 ring-acc text-acc font-[600]" : ""} bg-transparent hover:bg-surf2`
                }`}
              >
                {Number(day.slice(8))}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => { onChange(today); setOpen(false); }}
          className="mt-[8px] w-full h-[28px] rounded-[7px] text-[0.74rem] font-[500] text-acc bg-transparent border border-brd hover:bg-surf2 cursor-pointer"
        >
          Today
        </button>
      </div>
    </Popover>
  );
}
