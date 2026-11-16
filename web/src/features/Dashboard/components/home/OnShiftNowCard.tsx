import { UserCheck } from "lucide-react";

export function OnShiftNowCard() {
  return (
    <div className="bg-surf border border-brd rounded-[14px] overflow-hidden flex flex-col">
      <div className="p-[13px_17px] border-b border-brd">
        <div className="text-[0.84rem] font-[600] tracking-[-0.02em] text-tx">On Shift Now</div>
        <div className="text-[0.68rem] text-tx2 mt-[1px]">Live · All Locations</div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center py-[32px] px-[20px] text-center">
        <div className="w-[36px] h-[36px] rounded-full bg-blu-bg flex items-center justify-center mb-[10px]">
          <UserCheck className="w-[16px] h-[16px] text-blu" strokeWidth={2} />
        </div>
        <div className="text-[0.82rem] font-[600] text-tx mb-[5px]">Nobody on shift</div>
        <div className="text-[0.7rem] text-tx2 max-w-[180px]">
          Staff will appear here when their shift starts.
        </div>
      </div>
    </div>
  );
}
