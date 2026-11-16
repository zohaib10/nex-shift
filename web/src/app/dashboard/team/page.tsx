"use client";

import * as React from "react";
import { ChevronDown, Loader2, Pencil, ShieldCheck, Users } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PageLoader } from "@/components/PageLoader";
import { SlidePanel } from "@/components/ui/SlidePanel";
import { useOrg, type OrgLocation } from "@/context/OrgContext";
import {
  apiErrorMessage,
  useRemoveMember,
  useTeam,
  useUpdateMember,
  type TeamMember,
} from "@/hooks/team/useTeam";
import { LOCATION_ROLE_LABEL, ORG_ROLE_LABEL, isOrgAdmin, type LocationRole } from "@/lib/roles";

// ─── role pill ────────────────────────────────────────────────────────────────

function RolePill({ member }: { member: TeamMember }) {
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

// ─── edit panel ───────────────────────────────────────────────────────────────

function EditMemberPanel({
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

        {isOwner && (
          <p className="text-[0.78rem] text-tx2 bg-surf2 border border-brd rounded-[8px] p-[10px_12px]">
            This is the organization&apos;s owner. Their access can&apos;t be changed.
          </p>
        )}
        {!isOwner && !canEditAccess && (
          <p className="text-[0.78rem] text-tx2 bg-surf2 border border-brd rounded-[8px] p-[10px_12px]">
            Only the owner can change an admin&apos;s access.
          </p>
        )}

        {canEditAccess && (
          <>
            <fieldset disabled={!canChangeOrgRole}>
              <legend className="block text-[0.78rem] font-[500] text-tx2 mb-[6px]">Organization access</legend>
              <div className="border border-brd2 rounded-[10px] overflow-hidden">
                {(["member", "admin"] as const).map((r, i) => (
                  <label
                    key={r}
                    className={`flex items-start gap-[9px] px-[13px] py-[10px] ${canChangeOrgRole ? "cursor-pointer" : "opacity-70"} ${i > 0 ? "border-t border-brd" : ""} ${orgRole === r ? "bg-acc-bg" : ""}`}
                  >
                    <input
                      type="radio"
                      name="org-role"
                      checked={orgRole === r}
                      onChange={() => setOrgRole(r)}
                      className="w-[14px] h-[14px] accent-acc shrink-0 mt-[2px]"
                    />
                    <span>
                      <span className="block text-[0.84rem] font-[600] text-tx">
                        {r === "admin" ? "Admin" : "Location access only"}
                      </span>
                      <span className="block text-[0.72rem] text-tx3 leading-[1.45]">
                        {r === "admin"
                          ? "Manages every location, the team and settings."
                          : "Works at or manages the locations chosen below."}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              {!canChangeOrgRole && (
                <p className="text-[0.7rem] text-tx3 mt-[5px]">Only the owner can make someone an admin.</p>
              )}
            </fieldset>

            {showLocations && (
              <div>
                <div className="block text-[0.78rem] font-[500] text-tx2 mb-[6px]">Locations</div>
                <div className="border border-brd2 rounded-[10px] overflow-hidden">
                  {orgLocations.map((loc, i) => {
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
                          onChange={() => toggleLocation(loc.id)}
                          className="w-[14px] h-[14px] accent-acc shrink-0 cursor-pointer"
                        />
                        <label htmlFor={`loc-${loc.id}`} className="text-[0.84rem] font-[500] text-tx flex-1 truncate cursor-pointer">
                          {loc.name}
                        </label>
                        {role && (
                          <div className="relative shrink-0">
                            <select
                              aria-label={`Role at ${loc.name}`}
                              value={role}
                              onChange={(e) => setAssignments((prev) => ({ ...prev, [loc.id]: e.target.value as LocationRole }))}
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

// ─── page ─────────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const { activeOrg, isLoading: orgsLoading } = useOrg();
  const orgId = activeOrg?.id ?? null;
  const isAdmin = isOrgAdmin(activeOrg?.role);
  const { data: members, isLoading, error } = useTeam(isAdmin ? orgId : null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const editing = members?.find((m) => m.userId === editingId) ?? null;

  if (orgsLoading) return <PageLoader />;

  return (
    <>
      <div className="h-[50px] shrink-0 flex items-center justify-between px-[22px] bg-nav backdrop-blur-[18px] border-b border-brd">
        <div className="flex items-center gap-[7px] min-w-0">
          <span className="text-[0.92rem] font-[600] tracking-[-0.02em] text-tx">Team</span>
          {activeOrg && <><span className="text-tx3 text-[0.75rem]">·</span><span className="text-[0.8rem] text-tx2 truncate">{activeOrg.name}</span></>}
        </div>
        <ThemeToggle />
      </div>

      <div className="flex-1 overflow-y-auto p-[22px]">
        {!isAdmin ? (
          <div className="flex flex-col items-center justify-center py-[60px] text-center">
            <ShieldCheck className="w-[22px] h-[22px] text-tx3 mb-[10px]" strokeWidth={2} />
            <div className="text-[0.88rem] font-[600] text-tx">Only admins can manage the team</div>
            <div className="text-[0.76rem] text-tx2 mt-[4px]">Ask an admin if your access needs to change.</div>
          </div>
        ) : (
          <div className="bg-surf border border-brd rounded-[14px] overflow-hidden animate-up">
            <div className="flex justify-between items-center p-[13px_17px] border-b border-brd">
              <div>
                <div className="text-[0.84rem] font-[600] tracking-[-0.02em] text-tx">People</div>
                <div className="text-[0.68rem] text-tx2 mt-[1px]">
                  Invite new people from the Team Invites card on the dashboard.
                </div>
              </div>
              {members && <span className="text-[0.72rem] text-tx3 tabular-nums">{members.length}</span>}
            </div>

            {isLoading && (
              <div className="flex justify-center py-[36px]"><Loader2 className="w-[18px] h-[18px] animate-spin text-acc" /></div>
            )}
            {error && (
              <div className="px-[17px] py-[24px] text-[0.8rem] text-red-500">{apiErrorMessage(error, "Couldn't load the team.")}</div>
            )}
            {members?.length === 0 && (
              <div className="flex flex-col items-center py-[36px] text-center">
                <Users className="w-[16px] h-[16px] text-tx3 mb-[8px]" strokeWidth={2} />
                <div className="text-[0.8rem] text-tx2">No one has joined yet.</div>
              </div>
            )}

            {members?.map((m) => {
              const name = `${m.firstName} ${m.lastName}`.trim() || m.email;
              return (
                <div key={m.userId} className="flex items-center gap-[12px] px-[17px] py-[12px] border-b border-brd last:border-none">
                  <div className="w-[32px] h-[32px] rounded-full bg-surf2 border border-brd flex items-center justify-center text-[0.68rem] font-[600] text-tx2 shrink-0">
                    {(m.firstName[0] ?? m.email[0] ?? "?").toUpperCase()}{(m.lastName[0] ?? "").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-[8px] flex-wrap">
                      <span className="text-[0.84rem] font-[600] text-tx truncate">{name}</span>
                      <RolePill member={m} />
                    </div>
                    <div className="text-[0.72rem] text-tx3 truncate">
                      {m.email}
                      {!isOrgAdmin(m.role) && (
                        <> · {m.locations.length === 0
                          ? "No locations"
                          : m.locations.map((l) => `${l.name} (${LOCATION_ROLE_LABEL[l.role]})`).join(", ")}</>
                      )}
                      {isOrgAdmin(m.role) && <> · All locations</>}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingId(m.userId)}
                    aria-label={`Edit ${name}`}
                    className="h-[28px] px-[10px] rounded-[7px] border border-brd2 bg-transparent flex items-center gap-[5px] text-[0.74rem] font-[500] text-tx2 hover:bg-surf2 transition-colors cursor-pointer shrink-0"
                  >
                    <Pencil className="w-[12px] h-[12px]" strokeWidth={2} /> Edit
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <EditMemberPanel
        member={editing}
        orgId={orgId}
        orgLocations={activeOrg?.locations ?? []}
        actorIsOwner={activeOrg?.role === "owner"}
        onClose={() => setEditingId(null)}
      />
    </>
  );
}
