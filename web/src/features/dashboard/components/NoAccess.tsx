import { ShieldCheck } from "lucide-react";

/** Shown on a dashboard page the user's role can't open. */
export function NoAccess({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-[60px] text-center">
      <ShieldCheck className="w-[22px] h-[22px] text-tx3 mb-[10px]" strokeWidth={2} />
      <div className="text-[0.88rem] font-[600] text-tx">{title}</div>
      <div className="text-[0.76rem] text-tx2 mt-[4px]">{hint}</div>
    </div>
  );
}
