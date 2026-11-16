import type { OrgLocation } from "@/context/OrgContext";
import type { LocationRole } from "@/lib/roles";
import { LocationRoleSelect } from "./LocationRoleSelect";

/** Which locations a member belongs to, and their role at each. */
export function LocationAccessPicker({
  locations,
  assignments,
  onToggle,
  onRoleChange,
}: {
  locations: OrgLocation[];
  /** locationId → role, for the locations they're assigned to. */
  assignments: Record<string, LocationRole>;
  onToggle: (locationId: string) => void;
  onRoleChange: (locationId: string, role: LocationRole) => void;
}) {
  return (
    <div>
      <div className="block text-[0.78rem] font-[500] text-tx2 mb-[6px]">Locations</div>
      <div className="border border-brd2 rounded-[10px] overflow-hidden">
        {locations.map((loc, i) => {
          const role = assignments[loc.id];
          return (
            <div
              key={loc.id}
              className={`flex items-center gap-[9px] px-[13px] py-[9px] ${i > 0 ? "border-t border-brd" : ""} ${role ? "bg-acc-bg" : ""}`}
            >
              <input
                id={`loc-${loc.id}`}
                type="checkbox"
                checked={!!role}
                onChange={() => onToggle(loc.id)}
                className="w-[14px] h-[14px] accent-acc shrink-0 cursor-pointer"
              />
              <label htmlFor={`loc-${loc.id}`} className="text-[0.84rem] font-[500] text-tx flex-1 truncate cursor-pointer">
                {loc.name}
              </label>
              {role && (
                <LocationRoleSelect label={`Role at ${loc.name}`} value={role} onChange={(r) => onRoleChange(loc.id, r)} />
              )}
            </div>
          );
        })}
      </div>
      {Object.keys(assignments).length === 0 && (
        <p className="text-[0.7rem] text-tx3 mt-[5px]">
          With no locations, they stay in the organization but won&apos;t see any schedule.
        </p>
      )}
    </div>
  );
}
