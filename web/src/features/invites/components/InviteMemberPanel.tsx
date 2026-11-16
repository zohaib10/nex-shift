"use client";

import * as React from "react";
import { Loader2, Mail, Plus } from "lucide-react";
import { SlidePanel } from "@/components/ui/SlidePanel";
import { useInviteMember } from "@/features/invites/hooks/useInvite";
import type { InviteRole } from "@/lib/roles";
import { InviteRolePicker } from "./InviteRolePicker";
import { InviteLocationPicker } from "./InviteLocationPicker";
import { InviteNotice } from "./InviteNotice";

const inputBase =
  "w-full bg-bg border rounded-[10px] py-[10px] pr-[13px] pl-[38px] text-[0.88rem] text-tx outline-none transition-all duration-200 focus:ring-[3px] focus:ring-acc-brd";
const inputNormal = `${inputBase} border-brd2 focus:border-acc`;
const inputError = `${inputBase} border-red-500 bg-red-500/10 focus:border-red-500`;

export function InviteMemberPanel({
  open,
  onClose,
  orgId,
  locations,
  defaultLocationId,
  defaultLocationName,
  invitedById,
  canInviteAnyRole,
  allLocationIds,
}: {
  open: boolean;
  onClose: () => void;
  orgId: string | null;
  /** Locations the inviter can invite to: all for admins, managed ones for managers. */
  locations: { id: string; name: string }[];
  defaultLocationId: string | null;
  defaultLocationName: string;
  invitedById: string | null;
  /** Admins and owners can invite managers and admins; managers only staff. */
  canInviteAnyRole: boolean;
  /** Every location in the org; an admin invite covers all of them. */
  allLocationIds: string[];
}) {
  const [role, setRole] = React.useState<InviteRole>("staff");
  // Inviting from a specific location locks the invite to that one location.
  // Inviting from "All Locations" lets the inviter deselect locations via checkboxes.
  // Admins join the whole organization, so they don't pick locations.
  const locked = !!defaultLocationId;
  const isAdminInvite = role === "admin";

  const [email, setEmail] = React.useState("");
  const [emailError, setEmailError] = React.useState("");
  const [selectedLocationIds, setSelectedLocationIds] = React.useState<string[]>([]);
  const [locationError, setLocationError] = React.useState("");
  const { mutate: inviteMember, isPending, error, reset } = useInviteMember(orgId);

  React.useEffect(() => {
    if (open) {
      setRole("staff");
      setEmail("");
      setEmailError("");
      setLocationError("");
      setSelectedLocationIds(locked ? [defaultLocationId as string] : locations.map((l) => l.id));
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, locked, defaultLocationId, reset]);

  const roleOptions: InviteRole[] = canInviteAnyRole ? ["staff", "manager", "admin"] : ["staff"];

  function toggleLocation(id: string) {
    setSelectedLocationIds((prev) => (prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]));
  }

  function handleSend() {
    const trimmed = email.trim();
    let valid = true;

    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Enter a valid email address");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!isAdminInvite && selectedLocationIds.length === 0) {
      setLocationError("Select at least one location");
      valid = false;
    } else {
      setLocationError("");
    }

    if (!valid || !orgId || !invitedById) return;

    inviteMember(
      { email: trimmed, role, locationIds: isAdminInvite ? allLocationIds : selectedLocationIds },
      { onSuccess: onClose }
    );
  }

  return (
    <SlidePanel open={open} onClose={onClose} title="Invite Team Member">
      <div className="flex-1 overflow-y-auto p-[18px] space-y-[16px]">
        <div>
          <label className="block text-[0.78rem] font-[500] text-tx2 mb-[6px]">
            Email address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-tx3" strokeWidth={2} />
            <input
              type="email"
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className={emailError ? inputError : inputNormal}
            />
          </div>
          {emailError && <p className="text-[0.72rem] text-red-500 mt-[5px]">{emailError}</p>}
        </div>

        {roleOptions.length > 1 && <InviteRolePicker options={roleOptions} value={role} onChange={setRole} />}

        {isAdminInvite ? (
          <InviteNotice>Admins can access every location.</InviteNotice>
        ) : locked ? (
          <InviteNotice>
            They&apos;ll be invited to <strong className="text-tx font-[600]">{defaultLocationName}</strong>
          </InviteNotice>
        ) : (
          <InviteLocationPicker
            locations={locations}
            selectedIds={selectedLocationIds}
            onToggle={toggleLocation}
            error={locationError}
          />
        )}

        {error && (
          <p className="text-[0.78rem] text-red-500">
            {error.response?.data?.message ?? "Failed to send invite. Please try again."}
          </p>
        )}
      </div>

      <div className="p-[14px_18px] border-t border-brd shrink-0">
        <button
          onClick={handleSend}
          disabled={isPending}
          className="w-full h-[42px] rounded-[10px] bg-acc text-[#07090E] text-[0.88rem] font-[600] flex items-center justify-center gap-[6px] hover:opacity-85 transition-opacity disabled:opacity-60 cursor-pointer border-none"
        >
          {isPending ? (
            <Loader2 className="w-[15px] h-[15px] animate-spin" strokeWidth={2} />
          ) : (
            <>
              <Plus className="w-[14px] h-[14px]" strokeWidth={2.5} />
              Send Invite
            </>
          )}
        </button>
      </div>
    </SlidePanel>
  );
}
