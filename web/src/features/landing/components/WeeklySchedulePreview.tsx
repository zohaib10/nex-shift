// Sample data for the landing page illustration, not real shifts.
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ROWS = [
  { n: "Dr. Patel", s: ["am", "am", "off", "am", "pm", "off", "off"] },
  { n: "RN Torres", s: ["pm", "pm", "am", "am", "off", "on", "off"] },
  { n: "XR Tech", s: ["am", "off", "pm", "pm", "am", "off", "off"] },
  { n: "Front Desk", s: ["am", "am", "am", "am", "am", "off", "off"] },
  { n: "Dr. Okonkwo", s: ["off", "am", "am", "off", "pm", "on", "off"] },
];

const SHIFT_CLASS: Record<string, string> = {
  am: "bg-[rgba(0,158,118,0.1)] text-[#009E76] dark:bg-[rgba(0,212,160,0.16)] dark:text-[#00D4A0]",
  pm: "bg-[rgba(37,99,235,0.09)] text-[#2563EB] dark:bg-[rgba(59,130,246,0.16)] dark:text-[#7EB8FF]",
  on: "bg-[rgba(217,119,6,0.09)] text-[#D97706] dark:bg-[rgba(251,191,36,0.14)] dark:text-[#FBBf24]",
  off: "bg-[rgba(0,0,0,0.045)] text-tx3 dark:bg-[rgba(255,255,255,0.04)]",
};

export function WeeklySchedulePreview() {
  return (
    <div className="bg-mock border border-brd rounded-[14px] p-4 md:p-[26px] transition-all duration-300 w-full overflow-x-auto shadow-sm">
      <div className="min-w-[500px]">
        <div className="flex justify-between items-center mb-[18px]">
          <div className="font-geist text-[0.83rem] font-[700] tracking-[-0.025em] text-tx transition-colors duration-300">Weekly Schedule — Main Clinic</div>
          <div className="bg-acc-bg text-acc border border-acc-brd text-[0.6rem] font-semibold py-[3px] px-[9px] rounded-full tracking-[0.06em] uppercase">Live</div>
        </div>
        <div className="grid grid-cols-[84px_repeat(7,1fr)] gap-[3px] mb-[5px]">
          <div />
          {DAYS.map((d) => (
            <div key={d} className="text-center text-[0.58rem] font-semibold text-tx3 py-[4px] tracking-[0.04em] uppercase transition-colors duration-300">{d}</div>
          ))}
        </div>
        <div className="flex flex-col gap-[4px]">
          {ROWS.map((row) => (
            <div key={row.n} className="grid grid-cols-[84px_repeat(7,1fr)] gap-[3px] items-center">
              <div className="text-[0.6rem] text-tx2 font-medium whitespace-nowrap overflow-hidden text-ellipsis pr-[4px] transition-colors duration-300">{row.n}</div>
              {row.s.map((shift, j) => (
                <div key={j} className={`h-[21px] rounded-[4px] flex items-center justify-center text-[0.5rem] font-bold tracking-[0.03em] ${SHIFT_CLASS[shift]}`}>
                  {shift.toUpperCase()}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
