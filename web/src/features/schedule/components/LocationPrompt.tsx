import { ArrowRight, MapPin } from "lucide-react";
import type { OrgLocation } from "@/context/OrgContext";

/** The schedule is per location; shown when "All Locations" is selected. */
export function LocationPrompt({ locations, onPick }: { locations: OrgLocation[]; onPick: (id: string) => void }) {
  return (
    <div className="max-w-[440px] mx-auto py-[40px] animate-up">
      <div className="text-center mb-[18px]">
        <div className="text-[0.92rem] font-[600] text-tx">Pick a location</div>
        <div className="text-[0.76rem] text-tx2 mt-[4px]">Each location has its own schedule.</div>
      </div>
      <div className="bg-surf border border-brd rounded-[14px] overflow-hidden">
        {locations.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => onPick(l.id)}
            className="w-full flex items-center gap-[10px] px-[16px] py-[12px] border-t border-brd first:border-none bg-transparent text-left hover:bg-surf2 transition-colors cursor-pointer"
          >
            <MapPin className="w-[14px] h-[14px] text-tx3 shrink-0" strokeWidth={2} />
            <span className="flex-1 text-[0.84rem] font-[500] text-tx truncate">{l.name}</span>
            <ArrowRight className="w-[13px] h-[13px] text-tx3" strokeWidth={2} />
          </button>
        ))}
        {locations.length === 0 && <div className="px-[16px] py-[14px] text-[0.8rem] text-tx3">Add a location from the sidebar first.</div>}
      </div>
    </div>
  );
}
