import type { OrgLocation } from "@/context/OrgContext";
import { LOCATION_ROLE_LABEL } from "@/lib/roles";

/** The locations a staff member works at, with their role at each. */
export function MyLocationsCard({ locations }: { locations: OrgLocation[] }) {
  return (
    <div className="bg-surf border border-brd rounded-[14px] overflow-hidden self-start">
      <div className="p-[13px_17px] border-b border-brd">
        <div className="text-[0.84rem] font-[600] tracking-[-0.02em] text-tx">My Locations</div>
        <div className="text-[0.68rem] text-tx2 mt-[1px]">Where you work</div>
      </div>
      {locations.length === 0 ? (
        <div className="px-[17px] py-[24px] text-[0.75rem] text-tx2 text-center">
          You haven&apos;t been added to a location yet. Ask a manager to add you.
        </div>
      ) : (
        locations.map((loc) => (
          <div key={loc.id} className="flex items-center gap-[10px] px-[17px] py-[11px] border-b border-brd last:border-none">
            <div className="w-[6px] h-[6px] rounded-full bg-acc shrink-0" />
            <span className="text-[0.82rem] font-[500] text-tx flex-1 truncate">{loc.name}</span>
            <span className="text-[0.68rem] text-tx3">{LOCATION_ROLE_LABEL[loc.role]}</span>
          </div>
        ))
      )}
    </div>
  );
}
