"use client";

import * as React from "react";
import { Loader2, Users } from "lucide-react";
import type { UserOrg } from "@/context/OrgContext";
import { apiErrorMessage, useTeam } from "@/features/team/hooks/useTeam";
import { TeamMemberRow } from "./TeamMemberRow";
import { EditMemberPanel } from "./EditMemberPanel";

/** Everyone in the organization, with an edit panel for their access. Admins only. */
export function TeamList({ org }: { org: UserOrg }) {
  const { data: members, isLoading, error } = useTeam(org.id);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const editing = members?.find((m) => m.userId === editingId) ?? null;

  return (
    <>
      <div className="bg-surf border border-brd rounded-[14px] overflow-hidden animate-up">
        <div className="flex justify-between items-center p-[13px_17px] border-b border-brd">
          <div>
            <div className="text-[0.84rem] font-[600] tracking-[-0.02em] text-tx">People</div>
            <div className="text-[0.68rem] text-tx2 mt-[1px]">Invite new people from the Team Invites card on the dashboard.</div>
          </div>
          {members && <span className="text-[0.72rem] text-tx3 tabular-nums">{members.length}</span>}
        </div>

        {isLoading && (
          <div className="flex justify-center py-[36px]"><Loader2 className="w-[18px] h-[18px] animate-spin text-acc" /></div>
        )}
        {error && <div className="px-[17px] py-[24px] text-[0.8rem] text-red-500">{apiErrorMessage(error, "Couldn't load the team.")}</div>}
        {members?.length === 0 && (
          <div className="flex flex-col items-center py-[36px] text-center">
            <Users className="w-[16px] h-[16px] text-tx3 mb-[8px]" strokeWidth={2} />
            <div className="text-[0.8rem] text-tx2">No one has joined yet.</div>
          </div>
        )}
        {members?.map((m) => (
          <TeamMemberRow key={m.userId} member={m} onEdit={() => setEditingId(m.userId)} />
        ))}
      </div>

      <EditMemberPanel
        member={editing}
        orgId={org.id}
        orgLocations={org.locations}
        actorIsOwner={org.role === "owner"}
        onClose={() => setEditingId(null)}
      />
    </>
  );
}
