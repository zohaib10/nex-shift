"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { Popover } from "./Popover";
import { PickerButton } from "./PickerButton";

const STEP_MINUTES = 15;
const SLOTS = Array.from({ length: (24 * 60) / STEP_MINUTES }, (_, i) => {
  const m = i * STEP_MINUTES;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
});

/** "13:30" → "1:30 PM" */
export function formatTime12(value: string): string {
  const [h, m] = value.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/** Pick a time of day in 15-minute steps. `value` is "HH:mm" (24h). */
export function TimePicker({
  value,
  onChange,
  hint,
  disabled,
}: {
  value: string;
  onChange: (time: string) => void;
  /** Extra text beside each option, e.g. the shift length for an end time. */
  hint?: (time: string) => string | null;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Open scrolled to the selected time (or 8 AM), so it's in view.
  React.useEffect(() => {
    if (!open || !listRef.current) return;
    const target = listRef.current.querySelector<HTMLElement>(`[data-time="${value || "08:00"}"]`);
    if (target) listRef.current.scrollTop = target.offsetTop - listRef.current.clientHeight / 2 + target.clientHeight / 2;
  }, [open, value]);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger={<PickerButton icon={Clock} label={value ? formatTime12(value) : "Pick a time"} open={open} onClick={() => setOpen(!open)} disabled={disabled} />}
    >
      <div ref={listRef} role="listbox" aria-label="Choose time" className="w-[180px] max-h-[240px] overflow-y-auto p-[4px] relative">
        {SLOTS.map((t) => {
          const selected = t === value;
          const extra = hint?.(t);
          return (
            <button
              key={t}
              type="button"
              role="option"
              aria-selected={selected}
              data-time={t}
              onClick={() => { onChange(t); setOpen(false); }}
              className={`w-full flex items-center justify-between gap-[8px] px-[10px] py-[6px] rounded-[7px] text-[0.8rem] tabular-nums border-none cursor-pointer text-left ${
                selected ? "bg-acc text-[#07090E] font-[600]" : "bg-transparent text-tx hover:bg-surf2"
              }`}
            >
              {formatTime12(t)}
              {extra && <span className={`text-[0.68rem] ${selected ? "text-[#07090E]/70" : "text-tx3"}`}>{extra}</span>}
            </button>
          );
        })}
      </div>
    </Popover>
  );
}
