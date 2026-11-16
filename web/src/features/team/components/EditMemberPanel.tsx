"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { SlidePanel } from "@/components/ui/SlidePanel";
import type { OrgLocation } from "@/context/OrgContext";
import { apiErrorMessage, useRemoveMember, useUpdateMember, type TeamMember } from "@/features/team/hooks/useTeam";
import type { LocationRole } from "@/lib/roles";
import { OrgAccessPicker } from "./OrgAccessPicker";
import { LocationAccessPicker } from "./LocationAccessPicker";

const noteClass = "text-[0.78rem] text-tx2 bg-surf2 border border-brd rounded-[8px] p-[10px_12px]";

export function EditMemberPanel({
  member,
  orgId,
  orgLocations,
  actorIsOwner,
  onClose,
}: {
  member: TeamMember | null;
  orgId: string | null;
  orgLocations: OrgLocation[];
  actorIsOwner: boolean;
  onClose: () => void;
}) {
  const [orgRole, setOrgRole] = React.useState<"admin" | "member">("member");
  const [assignments, setAssignments] = React.useState<Record<string, LocationRole>>({});
  const [confirmRemove, setConfirmRemove] = React.useState(false);
  const update = useUpdateMember(orgId);
  const remove = useRemoveMember(orgId);

  // Load the member's current access whenever a different member is opened.
  React.useEffect(() => {
    if (!member) return;
    setOrgRole(member.role === "admin" ? "admin" : "member");
    setAssignments(Object.fromEntries(member.locations.map((l) => [l.id, l.role])));
    setConfirmRemove(false);
    update.reset();
    remove.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member?.userId]);

  const isOwner = member?.role === "owner";
  // Only the owner can change an admin, or make someone an admin.
  const canEditAccess = !!member && !isOwner && (actorIsOwner || member.role !== "admin");
  const canChangeOrgRole = actorIsOwner && !isOwner;
  const showLocations = orgRole === "member";

  function toggleLocation(id: string) {
    setAssignments((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = "staff";
      return next;
    });
  }

  function save() {
    if (!member) return;
    update.mutate(
      {
        userId: member.userId,
        ...(canChangeOrgRole ? { role: orgRole } : {}),
        ...(showLocations
          ? { locations: Object.entries(assignments).map(([locationId, role]) => ({ locationId, role })) }
          : {}),
      },
      { onSuccess: onClose }
    );
  }

  function handleRemove() {
    if (!member) return;
    if (!confirmRemove) { setConfirmRemove(true); return; }
    remove.mutate({ userId: member.userId }, { onSuccess: onClose });
  }

  const name = member ? `${member.firstName} ${member.lastName}`.trim() || member.email : "";

  return (
    <SlidePanel open={!!member} onClose={onClose} title="Edit access">
      <div className="flex-1 overflow-y-auto p-[18px] space-y-[18px]">
        <div>
          <div className="text-[0.92rem] font-[600] text-tx">{name}</div>
          <div className="text-[0.75rem] text-tx2">{member?.email}</div>
        </div>

        {isOwner && <p className={noteClass}>This is the organization&apos;s owner. Their access can&apos;t be changed.</p>}
        {!isOwner && !canEditAccess && <p className={noteClass}>Only the owner can change an admin&apos;s access.</p>}

        {canEditAccess && (
          <>
            <OrgAccessPicker value={orgRole} onChange={setOrgRole} disabled={!canChangeOrgRole} />

            {showLocations && (
              <LocationAccessPicker
                locations={orgLocations}
                assignments={assignments}
                onToggle={toggleLocation}
                onRoleChange={(id, role) => setAssignments((prev) => ({ ...prev, [id]: role }))}
              />
            )}

            {(update.error || remove.error) && (
              <p className="text-[0.78rem] text-red-500">
                {apiErrorMessage(update.error ?? remove.error, "Something went wrong. Please try again.")}
              </p>
            )}

            <button
              type="button"
              onClick={handleRemove}
              disabled={remove.isPending}
              className={`text-[0.78rem] font-[500] underline underline-offset-2 bg-transparent border-none cursor-pointer ${confirmRemove ? "text-red-500" : "text-tx2 hover:text-red-500"}`}
            >
              {remove.isPending
                ? "Removing…"
                : confirmRemove
                  ? `Click again to remove ${member?.firstName || "them"} from the organization`
                  : "Remove from organization"}
            </button>
          </>
        )}
      </div>

      {canEditAccess && (
        <div className="p-[14px_18px] border-t border-brd shrink-0">
          <button
            onClick={save}
            disabled={update.isPending}
            className="w-full h-[42px] rounded-[10px] bg-acc text-[#07090E] text-[0.88rem] font-[600] flex items-center justify-center gap-[6px] hover:opacity-85 transition-opacity disabled:opacity-60 cursor-pointer border-none"
          >
            {update.isPending ? <Loader2 className="w-[15px] h-[15px] animate-spin" strokeWidth={2} /> : "Save changes"}
          </button>
        </div>
      )}
    </SlidePanel>
  );
}
