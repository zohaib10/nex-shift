import { ChevronDown } from "lucide-react";
import type { LocationRole } from "@/lib/roles";

/** Staff/Manager dropdown with a custom arrow (the native one sits too close to the edge). */
export function LocationRoleSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: LocationRole;
  onChange: (role: LocationRole) => void;
}) {
  return (
    <div className="relative shrink-0">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value as LocationRole)}
        className="appearance-none bg-bg border border-brd2 rounded-[6px] text-[0.76rem] text-tx pl-[9px] pr-[26px] py-[4px] cursor-pointer outline-none focus:border-acc focus:ring-[3px] focus:ring-acc-brd"
      >
        <option value="staff">Staff</option>
        <option value="manager">Manager</option>
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-[8px] top-1/2 -translate-y-1/2 w-[12px] h-[12px] text-tx3"
        strokeWidth={2}
      />
    </div>
  );
}
