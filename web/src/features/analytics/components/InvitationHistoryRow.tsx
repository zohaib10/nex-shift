import { personName, type MemberRequest } from "@/features/invites/hooks/useLocationRequests";
import { INVITE_ROLE_LABEL } from "@/lib/roles";
import { effectiveStatus, formatDate } from "../utils/invites";
import { InviteStatusBadge } from "./InviteStatusBadge";

export function InvitationHistoryRow({ invite: r }: { invite: MemberRequest }) {
  const name = personName(r.acceptedBy);
  return (
    <tr className="border-b border-brd last:border-none align-top">
      <td className="px-[17px] py-[10px]">
        <div className="font-[500] text-tx">{name ?? r.email}</div>
        {name && <div className="text-[0.7rem] text-tx3">{r.email}</div>}
      </td>
      <td className="px-[12px] py-[10px] text-tx2">{INVITE_ROLE_LABEL[r.role] ?? "Staff"}</td>
      <td className="px-[12px] py-[10px] text-tx2">{r.role === "admin" ? "All locations" : r.location.name}</td>
      <td className="px-[12px] py-[10px] text-tx2">{personName(r.invitedBy) ?? "—"}</td>
      <td className="px-[12px] py-[10px] text-tx2 tabular-nums whitespace-nowrap">{formatDate(r.createdAt)}</td>
      <td className="px-[12px] py-[10px]"><InviteStatusBadge status={effectiveStatus(r)} /></td>
      <td className="px-[17px] py-[10px] text-tx2 tabular-nums whitespace-nowrap">{formatDate(r.respondedAt)}</td>
    </tr>
  );
}
