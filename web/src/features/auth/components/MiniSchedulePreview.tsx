// Sample data for the login page illustration, not real shifts.
const ROWS = [
  { n: "Dr. Patel", s: ["am", "am", "off", "am", "pm"] },
  { n: "RN Torres", s: ["pm", "pm", "am", "am", "off"] },
  { n: "XR Tech", s: ["am", "off", "pm", "pm", "am"] },
  { n: "Front Desk", s: ["am", "am", "am", "am", "am"] },
];

const SHIFT_CLASS: Record<string, string> = {
  am: "bg-[rgba(0,212,160,0.13)] dark:bg-[rgba(0,212,160,0.22)] text-acc",
  pm: "bg-[rgba(59,130,246,0.13)] dark:bg-[rgba(59,130,246,0.22)] text-[#3b82f6] dark:text-[#7aa8ff]",
  off: "bg-brd text-tx3 dark:bg-[rgba(255,255,255,0.04)]",
};

export function MiniSchedulePreview() {
  return (
    <div className="bg-surf border border-brd rounded-[14px] p-6 max-w-[400px] shadow-sm transition-colors duration-300">
      <div className="flex justify-between items-center mb-[14px]">
        <div className="text-[0.85rem] font-[600] tracking-[-0.02em] text-tx transition-colors duration-300">This Week — Main Clinic</div>
        <div className="flex items-center gap-[5px] text-[0.62rem] text-acc font-medium transition-colors duration-300">
          <div className="w-[5px] h-[5px] bg-acc rounded-full animate-[var(--animate-blink)]" />Live
        </div>
      </div>
      <div className="grid grid-cols-[72px_repeat(5,1fr)] gap-[3px] mb-[5px]">
        <div />
        {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d) => (
          <div key={d} className="text-[0.58rem] font-[600] uppercase tracking-[0.06em] text-tx3 text-center transition-colors duration-300">{d}</div>
        ))}
      </div>
      <div className="flex flex-col gap-[3px]">
        {ROWS.map((row) => (
          <div key={row.n} className="grid grid-cols-[72px_repeat(5,1fr)] gap-[3px] items-center">
            <div className="text-[0.62rem] text-tx2 whitespace-nowrap overflow-hidden text-ellipsis transition-colors duration-300">{row.n}</div>
            {row.s.map((shift, j) => (
              <div key={j} className={`h-[22px] rounded-[4px] flex items-center justify-center text-[0.52rem] font-[600] tracking-[0.03em] ${SHIFT_CLASS[shift]}`}>
                {shift === "off" ? "—" : shift.toUpperCase()}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
