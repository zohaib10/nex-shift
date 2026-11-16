import type { TeamMember } from "@/features/team/hooks/useTeam";
import { ORG_ROLE_LABEL, isOrgAdmin } from "@/lib/roles";

/** Owner/Admin for org-wide roles; otherwise Manager if they manage anywhere, else Staff. */
export function RolePill({ member }: { member: TeamMember }) {
  const label = isOrgAdmin(member.role)
    ? ORG_ROLE_LABEL[member.role]
    : member.locations.some((l) => l.role === "manager")
      ? "Manager"
      : "Staff";
  const tone = isOrgAdmin(member.role) ? "bg-acc-bg text-acc" : "bg-surf2 text-tx2";
  return (
    <span className={`text-[0.66rem] font-[600] uppercase tracking-[0.05em] px-[7px] py-[3px] rounded-[5px] ${tone}`}>
      {label}
    </span>
  );
}
