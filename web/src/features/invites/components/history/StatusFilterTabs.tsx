import { STATUS_FILTERS, type StatusFilter } from "../../utils/status";

export function StatusFilterTabs({ value, onChange }: { value: StatusFilter; onChange: (s: StatusFilter) => void }) {
  return (
    <div className="inline-flex border border-brd2 rounded-[8px] overflow-hidden" role="group" aria-label="Filter by status">
      {STATUS_FILTERS.map((s, i) => (
        <button
          key={s}
          type="button"
          aria-pressed={value === s}
          onClick={() => onChange(s)}
          className={`px-[10px] py-[5px] text-[0.72rem] font-[500] capitalize border-none cursor-pointer ${i > 0 ? "border-l border-brd2" : ""} ${value === s ? "bg-acc-bg text-acc" : "bg-transparent text-tx2 hover:bg-surf2"}`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
