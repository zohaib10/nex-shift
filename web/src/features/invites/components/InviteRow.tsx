import * as React from "react";
import { AlertTriangle, CheckCircle, Clock, Mail } from "lucide-react";
import { personName, type MemberRequest } from "@/features/invites/hooks/useLocationRequests";
import { INVITE_ROLE_LABEL } from "@/lib/roles";

const STATUS_META: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:  { label: "Pending",  color: "text-[#FFB000]", icon: Clock },
  accepted: { label: "Accepted", color: "text-acc",       icon: CheckCircle },
  declined: { label: "Declined", color: "text-red-500",   icon: AlertTriangle },
  expired:  { label: "Expired",  color: "text-tx3",       icon: Clock },
};

export function InviteRow({ req, showLocation }: { req: MemberRequest; showLocation?: boolean }) {
  const meta = STATUS_META[req.status] ?? STATUS_META.pending;
  const StatusIcon = meta.icon;
  const sentDate = new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className="flex items-center gap-[10px] px-[17px] py-[11px] border-b border-brd last:border-none">
      <div className="w-[30px] h-[30px] rounded-full bg-surf2 border border-brd flex items-center justify-center shrink-0">
        <Mail className="w-[13px] h-[13px] text-tx3" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        {/* Once accepted, show who joined; the email moves to the second line. */}
        <div className="text-[0.82rem] font-[500] text-tx truncate">{personName(req.acceptedBy) ?? req.email}</div>
        <div className="text-[0.68rem] text-tx3 mt-[1px] truncate">
          {req.acceptedBy && <>{req.email} · </>}
          Invited {sentDate} as {INVITE_ROLE_LABEL[req.role] ?? "Staff"}
          {showLocation && req.role !== "admin" && <> · {req.location.name}</>}
        </div>
      </div>
      <div className={`flex items-center gap-[4px] text-[0.72rem] font-[500] shrink-0 ${meta.color}`}>
        <StatusIcon className="w-[12px] h-[12px]" strokeWidth={2} />
        {meta.label}
      </div>
    </div>
  );
}
