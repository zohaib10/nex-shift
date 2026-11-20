"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, EyeOff, Plus, Users } from "lucide-react";
import { useLocationRequests } from "@/features/invites/hooks/useLocationRequests";
import { InviteRow } from "./InviteRow";
import { InviteMemberPanel } from "./InviteMemberPanel";

/** The dashboard shows recent activity; Team → Invitations has the full history. */
const RECENT_INVITE_DAYS = 7;

export function TeamInvitesCard({
  orgId,
  locationId,
  locationName,
  locations,
  canInviteAnyRole,
  allLocationIds,
  onHide,
}: {
  orgId: string | null;
  locationId: string | null;
  locationName: string;
  locations: { id: string; name: string }[];
  canInviteAnyRole: boolean;
  allLocationIds: string[];
  /** Hides the card from this user's dashboard. */
  onHide?: () => void;
}) {
  const router = useRouter();
  const { data: requests, isLoading } = useLocationRequests(orgId, locationId, RECENT_INVITE_DAYS);
  const [inviteOpen, setInviteOpen] = React.useState(false);

  return (
    <div className="bg-surf border border-brd rounded-[14px] overflow-hidden" style={{ animation: "up 0.5s 0.12s both" }}>
      <div className="flex justify-between items-center p-[13px_17px] border-b border-brd">
        <div>
          <div className="text-[0.84rem] font-[600] tracking-[-0.02em] text-tx">Team Invites</div>
          <div className="text-[0.68rem] text-tx2 mt-[1px]">
            {locationName} · Last {RECENT_INVITE_DAYS} days ·{" "}
            <button
              type="button"
              onClick={() => router.push("/dashboard/team?tab=invitations")}
              className="text-acc font-[500] bg-transparent border-none p-0 cursor-pointer hover:opacity-75"
            >
              View history
            </button>
          </div>
        </div>
        <div className="flex items-center gap-[8px]">
          {requests && requests.length > 0 && (
            <span className="text-[0.68rem] font-[600] px-[7px] py-[2px] rounded-full bg-[rgba(255,176,0,0.12)] text-[#FFB000]">
              {requests.filter((r) => r.status === "pending").length} pending
            </span>
          )}
          {onHide && (
            <button
              type="button"
              onClick={onHide}
              aria-label="Hide Team Invites"
              title="Hide from dashboard"
              className="w-[24px] h-[24px] rounded-[6px] border border-brd2 bg-transparent flex items-center justify-center text-tx3 hover:bg-surf2 hover:text-tx2 transition-colors cursor-pointer"
            >
              <EyeOff className="w-[12px] h-[12px]" strokeWidth={2} />
            </button>
          )}
          <button
            onClick={() => setInviteOpen(true)}
            aria-label="Invite team member"
            className="w-[24px] h-[24px] rounded-[6px] border border-brd2 bg-transparent flex items-center justify-center text-tx2 hover:bg-surf2 transition-colors cursor-pointer"
          >
            <Plus className="w-[13px] h-[13px]" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-[36px]">
          <div className="w-[18px] h-[18px] border-[2px] border-brd2 border-t-acc rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && (!requests || requests.length === 0) && (
        <div className="flex flex-col items-center justify-center py-[36px] px-[24px] text-center">
          <div className="w-[36px] h-[36px] rounded-[10px] bg-surf2 flex items-center justify-center mb-[10px]">
            <Users className="w-[16px] h-[16px] text-tx3" strokeWidth={2} />
          </div>
          <div className="text-[0.82rem] font-[600] text-tx mb-[4px]">No invites in the last {RECENT_INVITE_DAYS} days</div>
          <div className="text-[0.72rem] text-tx2 max-w-[200px]">
            {locationId
              ? "Invite staff to this location to see requests here."
              : "Invite staff to a location to see requests here."}
          </div>
          <button
            onClick={() => setInviteOpen(true)}
            className="mt-[16px] flex items-center gap-[5px] text-[0.76rem] font-[600] text-acc hover:opacity-75 transition-opacity bg-transparent border-none cursor-pointer"
          >
            Invite team member <ArrowRight className="w-[12px] h-[12px]" strokeWidth={2.5} />
          </button>
        </div>
      )}

      {!isLoading && requests && requests.length > 0 && (
        <div>
          {requests.map((req) => (
            <InviteRow key={req.id} req={req} showLocation={!locationId} />
          ))}
        </div>
      )}

      <InviteMemberPanel
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        orgId={orgId}
        locations={locations}
        defaultLocationId={locationId}
        defaultLocationName={locationName}
        canInviteAnyRole={canInviteAnyRole}
        allLocationIds={allLocationIds}
      />
    </div>
  );
}
