import { Pencil } from "lucide-react";
import type { TeamMember } from "@/features/team/hooks/useTeam";
import { LOCATION_ROLE_LABEL, isOrgAdmin } from "@/lib/roles";
import { RolePill } from "./RolePill";

export function TeamMemberRow({ member: m, onEdit }: { member: TeamMember; onEdit: () => void }) {
  const name = `${m.firstName} ${m.lastName}`.trim() || m.email;
  const initials = `${(m.firstName[0] ?? m.email[0] ?? "?").toUpperCase()}${(m.lastName[0] ?? "").toUpperCase()}`;
  const where = isOrgAdmin(m.role)
    ? "All locations"
    : m.locations.length === 0
      ? "No locations"
      : m.locations.map((l) => `${l.name} (${LOCATION_ROLE_LABEL[l.role]})`).join(", ");

  return (
    <div className="flex items-center gap-[12px] px-[17px] py-[12px] border-b border-brd last:border-none">
      <div className="w-[32px] h-[32px] rounded-full bg-surf2 border border-brd flex items-center justify-center text-[0.68rem] font-[600] text-tx2 shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[8px] flex-wrap">
          <span className="text-[0.84rem] font-[600] text-tx truncate">{name}</span>
          <RolePill member={m} />
        </div>
        <div className="text-[0.72rem] text-tx3 truncate">{m.email} · {where}</div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${name}`}
        className="h-[28px] px-[10px] rounded-[7px] border border-brd2 bg-transparent flex items-center gap-[5px] text-[0.74rem] font-[500] text-tx2 hover:bg-surf2 transition-colors cursor-pointer shrink-0"
      >
        <Pencil className="w-[12px] h-[12px]" strokeWidth={2} /> Edit
      </button>
    </div>
  );
}
