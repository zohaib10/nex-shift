import { Check } from "lucide-react";

const TONES = {
  blue: "bg-blu-bg text-blu border border-[rgba(37,99,235,0.18)] dark:border-[rgba(59,130,246,0.22)]",
  green: "bg-acc-bg text-acc border border-acc-brd",
  amber: "bg-[rgba(217,119,6,0.09)] text-[#D97706] border border-[rgba(217,119,6,0.2)] dark:bg-[rgba(251,191,36,0.14)] dark:text-[#FBBF24] dark:border-[rgba(251,191,36,0.24)]",
};

export function RoleCard({
  badge,
  title,
  description,
  points,
  tone,
}: {
  badge: string;
  title: string;
  description: string;
  points: string[];
  tone: keyof typeof TONES;
}) {
  return (
    <div className="bg-surf border border-brd rounded-[15px] p-6 md:p-[34px] transition-all duration-[220ms] hover:border-brd2 hover:text-tx hover:-translate-y-[3px]">
      <span className={`inline-block text-[0.64rem] font-bold tracking-[0.08em] uppercase py-[3px] px-[11px] rounded-[6px] mb-4 ${TONES[tone]}`}>{badge}</span>
      <div className="font-geist text-[1.65rem] font-[800] tracking-[-0.045em] mb-[9px] text-tx transition-colors duration-300">{title}</div>
      <div className="text-[0.855rem] text-tx2 mb-[22px] font-light leading-[1.68] transition-colors duration-300">{description}</div>
      <div className="flex flex-col gap-[8px]">
        {points.map((p) => (
          <div key={p} className="flex items-center gap-[9px] text-[0.81rem] text-tx2 font-normal transition-colors duration-300">
            <div className={`w-[16px] h-[16px] rounded-[4px] shrink-0 flex items-center justify-center transition-colors duration-300 ${TONES[tone]}`}>
              <Check className="w-[10px] h-[10px]" strokeWidth={3} />
            </div>
            {p}
          </div>
        ))}
      </div>
    </div>
  );
}
