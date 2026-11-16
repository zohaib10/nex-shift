import * as React from "react";

export function StatCard({
  icon: Icon,
  iconClass,
  label,
  value,
  delta,
  dimClass,
}: {
  icon: React.ElementType;
  iconClass: string;
  label: string;
  value: string;
  delta: string;
  dimClass: string;
}) {
  return (
    <div className="bg-surf border border-brd rounded-[12px] p-[16px_17px] hover:border-brd2 hover:-translate-y-[2px] transition-all duration-200 cursor-pointer">
      <div className={`w-[28px] h-[28px] rounded-[7px] ${dimClass} flex items-center justify-center mb-[10px]`}>
        <Icon className={`w-[14px] h-[14px] ${iconClass}`} strokeWidth={2} />
      </div>
      <div className="text-[0.68rem] font-[500] text-tx2 uppercase tracking-[0.05em] mb-[3px]">{label}</div>
      <div className="text-[1.6rem] font-[600] tracking-[-0.04em] text-tx leading-none">{value}</div>
      <div className="text-[0.68rem] text-tx3 mt-[5px]">{delta}</div>
    </div>
  );
}
