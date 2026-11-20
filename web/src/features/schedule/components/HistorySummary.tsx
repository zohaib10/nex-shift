import { formatHours } from "../utils/time";

/** Totals for a month of past shifts. */
export function HistorySummary({ hours, completed, noShows, cancelled }: { hours: number; completed: number; noShows: number; cancelled: number }) {
  const items = [
    { label: "Hours worked", value: formatHours(hours) },
    { label: "Completed", value: String(completed) },
    { label: "No-shows", value: String(noShows) },
    { label: "Cancelled", value: String(cancelled) },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-[10px] mb-[14px]">
      {items.map((i) => (
        <div key={i.label} className="bg-surf border border-brd rounded-[12px] p-[12px_14px]">
          <div className="text-[0.64rem] font-[500] text-tx2 uppercase tracking-[0.05em]">{i.label}</div>
          <div className="text-[1.3rem] font-[600] tracking-[-0.03em] text-tx tabular-nums">{i.value}</div>
        </div>
      ))}
    </div>
  );
}
