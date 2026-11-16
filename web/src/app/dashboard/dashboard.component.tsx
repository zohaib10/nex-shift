"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Calendar,
  Users,
  ClipboardList,
  Building2,
  Bell,
  Plus,
  ArrowRight,
  AlertTriangle,
  UserCheck,
  Mail,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useOrg } from "@/context/OrgContext";
import { personName, useLocationRequests, type MemberRequest } from "@/hooks/invites/useLocationRequests";
import { useInviteMember } from "@/hooks/invites/useInvite";
import { SlidePanel } from "@/components/ui/SlidePanel";
import {
  INVITE_ROLE_HINT,
  INVITE_ROLE_LABEL,
  LOCATION_ROLE_LABEL,
  dashboardKind,
  isOrgAdmin,
  managedLocations,
  type InviteRole,
} from "@/lib/roles";

// ─── PendingRequests widget ───────────────────────────────────────────────────

const RECENT_INVITE_DAYS = 7;

const STATUS_META: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:  { label: "Pending",  color: "text-[#FFB000]", icon: Clock },
  accepted: { label: "Accepted", color: "text-acc",       icon: CheckCircle },
  declined: { label: "Declined", color: "text-red-500",   icon: AlertTriangle },
  expired:  { label: "Expired",  color: "text-tx3",       icon: Clock },
};

function RequestRow({ req, showLocation }: { req: MemberRequest; showLocation?: boolean }) {
  const meta = STATUS_META[req.status] ?? STATUS_META.pending;
  const StatusIcon = meta.icon;
  const sentDate = new Date(req.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });

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

function InviteMemberPanel({
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
    setSelectedLocationIds((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
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

  const inputBase =
    "w-full bg-bg border rounded-[10px] py-[10px] pr-[13px] pl-[38px] text-[0.88rem] text-tx outline-none transition-all duration-200 focus:ring-[3px] focus:ring-acc-brd";
  const inputNormal = `${inputBase} border-brd2 focus:border-acc`;
  const inputError = `${inputBase} border-red-500 bg-red-500/10 focus:border-red-500`;

  return (
    <SlidePanel open={open} onClose={onClose} title="Invite Team Member">
        {/* Body */}
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

          {roleOptions.length > 1 && (
            <fieldset>
              <legend className="block text-[0.78rem] font-[500] text-tx2 mb-[6px]">Role</legend>
              <div className="border border-brd2 rounded-[10px] overflow-hidden">
                {roleOptions.map((r, i) => {
                  const checked = role === r;
                  return (
                    <label
                      key={r}
                      className={`flex items-start gap-[9px] px-[13px] py-[10px] cursor-pointer transition-colors duration-150 ${i > 0 ? "border-t border-brd" : ""} ${checked ? "bg-acc-bg" : "hover:bg-surf2"}`}
                    >
                      <input
                        type="radio"
                        name="invite-role"
                        value={r}
                        checked={checked}
                        onChange={() => setRole(r)}
                        className="w-[14px] h-[14px] accent-acc shrink-0 cursor-pointer mt-[2px]"
                      />
                      <span className="flex-1 min-w-0">
                        <span className={`block text-[0.84rem] ${checked ? "font-[600] text-tx" : "font-[500] text-tx2"}`}>
                          {INVITE_ROLE_LABEL[r]}
                        </span>
                        <span className="block text-[0.72rem] text-tx3 leading-[1.45]">{INVITE_ROLE_HINT[r]}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}

          {isAdminInvite ? (
            <div className="flex items-center gap-[7px] py-[8px] px-[12px] bg-surf2 border border-brd rounded-[8px]">
              <div className="w-[6px] h-[6px] rounded-full bg-acc shrink-0" />
              <span className="text-[0.75rem] text-tx2">Admins can access every location.</span>
            </div>
          ) : locked ? (
            <div className="flex items-center gap-[7px] py-[8px] px-[12px] bg-surf2 border border-brd rounded-[8px]">
              <div className="w-[6px] h-[6px] rounded-full bg-acc shrink-0" />
              <span className="text-[0.75rem] text-tx2">
                They&apos;ll be invited to <strong className="text-tx font-[600]">{defaultLocationName}</strong>
              </span>
            </div>
          ) : (
            <div>
              <label className="block text-[0.78rem] font-[500] text-tx2 mb-[6px]">
                Locations <span className="text-red-500">*</span>
              </label>
              <div className="border border-brd2 rounded-[10px] overflow-hidden">
                {locations.map((loc, i) => {
                  const checked = selectedLocationIds.includes(loc.id);
                  return (
                    <label
                      key={loc.id}
                      className={`flex items-center gap-[9px] px-[13px] py-[10px] cursor-pointer transition-colors duration-150 ${i > 0 ? "border-t border-brd" : ""} ${checked ? "bg-acc-bg" : "hover:bg-surf2"}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleLocation(loc.id)}
                        className="w-[14px] h-[14px] accent-acc shrink-0 cursor-pointer"
                      />
                      <span className={`text-[0.84rem] flex-1 truncate ${checked ? "font-[600] text-tx" : "font-[500] text-tx2"}`}>
                        {loc.name}
                      </span>
                    </label>
                  );
                })}
                {locations.length === 0 && (
                  <div className="px-[13px] py-[14px] text-[0.78rem] text-tx3 text-center">
                    No locations yet.
                  </div>
                )}
              </div>
              {locationError && <p className="text-[0.72rem] text-red-500 mt-[5px]">{locationError}</p>}
            </div>
          )}

          {error && (
            <p className="text-[0.78rem] text-red-500">
              {error.response?.data?.message ?? "Failed to send invite. Please try again."}
            </p>
          )}
        </div>

        {/* Footer */}
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

function PendingRequests({
  orgId,
  locationId,
  locationName,
  locations,
  invitedById,
  canInviteAnyRole,
  allLocationIds,
}: {
  orgId: string | null;
  locationId: string | null;
  locationName: string;
  locations: { id: string; name: string }[];
  invitedById: string | null;
  canInviteAnyRole: boolean;
  allLocationIds: string[];
}) {
  const router = useRouter();
  // The dashboard shows recent activity; Analytics has the full history.
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
              onClick={() => router.push("/dashboard/analytics")}
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
          <button
            onClick={() => setInviteOpen(true)}
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
            <RequestRow key={req.id} req={req} showLocation={!locationId} />
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
        invitedById={invitedById}
        canInviteAnyRole={canInviteAnyRole}
        allLocationIds={allLocationIds}
      />
    </div>
  );
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function getDayStrip(today: Date) {
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
      dayNum: d.getDate(),
      isToday: d.toDateString() === today.toDateString(),
    };
  });
}

// ─── StatCard ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  iconClass,
  label,
  value,
  delta,
  dimClass,
}: {
  icon: React.ElementType;
  iconClass: string;
  label: string;
  value: string;
  delta: string;
  dimClass: string;
}) {
  return (
    <div className="bg-surf border border-brd rounded-[12px] p-[16px_17px] hover:border-brd2 hover:-translate-y-[2px] transition-all duration-200 cursor-pointer">
      <div className={`w-[28px] h-[28px] rounded-[7px] ${dimClass} flex items-center justify-center mb-[10px]`}>
        <Icon className={`w-[14px] h-[14px] ${iconClass}`} strokeWidth={2} />
      </div>
      <div className="text-[0.68rem] font-[500] text-tx2 uppercase tracking-[0.05em] mb-[3px]">{label}</div>
      <div className="text-[1.6rem] font-[600] tracking-[-0.04em] text-tx leading-none">{value}</div>
      <div className="text-[0.68rem] text-tx3 mt-[5px]">{delta}</div>
    </div>
  );
}

// ─── DashboardComponent ───────────────────────────────────────────────────────

export function DashboardComponent({ user }: { user: any }) {
  const { activeOrg } = useOrg();
  if (dashboardKind(activeOrg) === "staff") return <StaffDashboard user={user} />;
  return <ManagerDashboard user={user} />;
}

/** Admins see every location; managers see this same view for the locations they manage. */
function ManagerDashboard({ user }: { user: any }) {
  const { activeOrg, activeLocId } = useOrg();

  const orgId = activeOrg?.id ?? null;
  const orgName = activeOrg?.name ?? null;
  const locations = activeOrg?.locations ?? [];
  const isAdmin = isOrgAdmin(activeOrg?.role);
  const managed = managedLocations(activeOrg);
  // A manager may also be staff somewhere; invites only show where they manage.
  const managesSelection = activeLocId === null || managed.some((l) => l.id === activeLocId);

  const selectedLocName = activeLocId
    ? (locations.find((l: { id: string; name: string }) => l.id === activeLocId)?.name ?? "All Locations")
    : "All Locations";

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const schedSubDate = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const days = getDayStrip(now);

  return (
    <>
      {/* Topbar */}
      <div className="h-[50px] shrink-0 flex items-center justify-between px-[22px] bg-nav backdrop-blur-[18px] border-b border-brd">
        <div className="flex items-center gap-[7px]">
          <span className="text-[0.92rem] font-[600] tracking-[-0.02em] text-tx">Dashboard</span>
          <span className="text-tx3 text-[0.75rem]">·</span>
          <span className="text-[0.8rem] text-tx2">{selectedLocName}</span>
        </div>
        <div className="flex gap-[7px] items-center">
          <ThemeToggle />
          <button className="w-[32px] h-[32px] rounded-[8px] border border-brd2 bg-surf flex items-center justify-center text-tx2 hover:bg-surf2 transition-colors relative">
            <Bell className="w-[14px] h-[14px]" strokeWidth={2} />
          </button>
          <button className="h-[30px] px-[13px] rounded-[8px] bg-acc text-[#07090E] text-[0.76rem] font-[600] flex items-center gap-[5px] hover:opacity-85 transition-opacity border-none">
            <Plus className="w-[13px] h-[13px]" strokeWidth={2.5} />
            New Schedule
          </button>
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1 overflow-y-auto p-[22px]">
        {/* Greeting */}
        <div className="mb-[20px] animate-up">
          <div className="text-[1.3rem] font-[600] tracking-[-0.04em] text-tx leading-[1.2]">
            {greeting}, {user?.firstName || "there"}
          </div>
          <div className="text-[0.8rem] text-tx2 mt-[3px]">{dateStr} · {selectedLocName} · {orgName}</div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-[11px] mb-[18px]" style={{ animation: "up 0.5s 0.04s both" }}>
          <StatCard icon={Users} iconClass="text-acc" label="On Shift Today" value="0" delta="No active shifts" dimClass="bg-acc-bg" />
          <StatCard icon={ClipboardList} iconClass="text-[#FFB000]" label="Pending Requests" value="0" delta="No pending requests" dimClass="bg-[rgba(255,176,0,0.1)]" />
          <StatCard icon={Calendar} iconClass="text-blu" label="Shifts This Week" value="0" delta="Add shifts to get started" dimClass="bg-blu-bg" />
          <StatCard icon={AlertTriangle} iconClass="text-[#FF4D4D]" label="Coverage Gaps" value="0" delta="Nothing to flag" dimClass="bg-[rgba(255,77,77,0.1)]" />
        </div>

        {/* Bottom grid */}
        <div className="grid grid-cols-[1fr_280px] gap-[14px] mb-[14px]" style={{ animation: "up 0.5s 0.08s both" }}>
          {/* Today's schedule */}
          <div className="bg-surf border border-brd rounded-[14px] overflow-hidden">
            <div className="flex justify-between items-center p-[13px_17px] border-b border-brd">
              <div>
                <div className="text-[0.84rem] font-[600] tracking-[-0.02em] text-tx">Today&apos;s Schedule</div>
                <div className="text-[0.68rem] text-tx2 mt-[1px]">{selectedLocName} · {schedSubDate}</div>
              </div>
              <button className="text-[0.72rem] font-[500] text-acc bg-transparent border-none cursor-pointer hover:opacity-70 transition-opacity whitespace-nowrap">
                Full schedule →
              </button>
            </div>

            {/* Day strip */}
            <div className="flex gap-[3px] px-[17px] py-[10px] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {days.map((d, i) => (
                <div
                  key={i}
                  className={`shrink-0 min-w-[42px] flex flex-col items-center p-[6px_7px] rounded-[8px] cursor-pointer border transition-colors duration-150 ${
                    d.isToday ? "border-brd2 bg-surf2" : "border-transparent hover:bg-surf2"
                  }`}
                >
                  <div className="text-[0.54rem] font-[600] uppercase tracking-[0.07em] text-tx3">{d.dayName}</div>
                  <div className="text-[0.86rem] font-[600] text-tx mt-[1px]">{d.dayNum}</div>
                </div>
              ))}
            </div>

            {/* Empty state */}
            <div className="flex flex-col items-center justify-center py-[40px] px-[24px] text-center">
              <div className="w-[40px] h-[40px] rounded-[10px] bg-acc-bg flex items-center justify-center mb-[12px]">
                <Calendar className="w-[18px] h-[18px] text-acc" strokeWidth={2} />
              </div>
              <div className="text-[0.86rem] font-[600] text-tx mb-[6px]">No shifts scheduled</div>
              <div className="text-[0.75rem] text-tx2 max-w-[240px]">
                Add team members and create shifts to see your schedule here.
              </div>
              {activeLocId && (
                <button className="mt-[16px] flex items-center gap-[5px] text-[0.76rem] font-[600] text-acc hover:opacity-75 transition-opacity bg-transparent border-none cursor-pointer">
                  Create first shift <ArrowRight className="w-[12px] h-[12px]" strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>

          {/* On shift now */}
          <div className="bg-surf border border-brd rounded-[14px] overflow-hidden flex flex-col">
            <div className="p-[13px_17px] border-b border-brd">
              <div className="text-[0.84rem] font-[600] tracking-[-0.02em] text-tx">On Shift Now</div>
              <div className="text-[0.68rem] text-tx2 mt-[1px]">Live · All Locations</div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center py-[32px] px-[20px] text-center">
              <div className="w-[36px] h-[36px] rounded-full bg-blu-bg flex items-center justify-center mb-[10px]">
                <UserCheck className="w-[16px] h-[16px] text-blu" strokeWidth={2} />
              </div>
              <div className="text-[0.82rem] font-[600] text-tx mb-[5px]">Nobody on shift</div>
              <div className="text-[0.7rem] text-tx2 max-w-[180px]">
                Staff will appear here when their shift starts.
              </div>
            </div>
          </div>
        </div>

        {/* Pending member requests */}
        {managesSelection && (
          <PendingRequests
            orgId={orgId}
            locationId={activeLocId}
            locationName={selectedLocName}
            locations={managed}
            invitedById={user?.id ?? null}
            canInviteAnyRole={isAdmin}
            allLocationIds={locations.map((l) => l.id)}
          />
        )}
      </div>
    </>
  );
}

// ─── StaffDashboard ──────────────────────────────────────────────────────────

/** Staff see their own shifts and the locations they work at, nothing org-wide. */
function StaffDashboard({ user }: { user: any }) {
  const { activeOrg } = useOrg();
  const locations = activeOrg?.locations ?? [];

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const days = getDayStrip(now);

  return (
    <>
      <div className="h-[50px] shrink-0 flex items-center justify-between px-[22px] bg-nav backdrop-blur-[18px] border-b border-brd">
        <span className="text-[0.92rem] font-[600] tracking-[-0.02em] text-tx">My Shifts</span>
        <div className="flex gap-[7px] items-center">
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-[22px]">
        <div className="mb-[20px] animate-up">
          <div className="text-[1.3rem] font-[600] tracking-[-0.04em] text-tx leading-[1.2]">
            {greeting}, {user?.firstName || "there"}
          </div>
          <div className="text-[0.8rem] text-tx2 mt-[3px]">{dateStr} · {activeOrg?.name}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-[14px]" style={{ animation: "up 0.5s 0.06s both" }}>
          {/* This week */}
          <div className="bg-surf border border-brd rounded-[14px] overflow-hidden">
            <div className="p-[13px_17px] border-b border-brd">
              <div className="text-[0.84rem] font-[600] tracking-[-0.02em] text-tx">This Week</div>
              <div className="text-[0.68rem] text-tx2 mt-[1px]">Your upcoming shifts</div>
            </div>
            <div className="flex gap-[3px] px-[17px] py-[10px] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {days.map((d, i) => (
                <div
                  key={i}
                  className={`shrink-0 min-w-[42px] flex flex-col items-center p-[6px_7px] rounded-[8px] border ${d.isToday ? "border-brd2 bg-surf2" : "border-transparent"}`}
                >
                  <div className="text-[0.54rem] font-[600] uppercase tracking-[0.07em] text-tx3">{d.dayName}</div>
                  <div className="text-[0.86rem] font-[600] text-tx mt-[1px]">{d.dayNum}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-center py-[40px] px-[24px] text-center">
              <div className="w-[40px] h-[40px] rounded-[10px] bg-acc-bg flex items-center justify-center mb-[12px]">
                <Calendar className="w-[18px] h-[18px] text-acc" strokeWidth={2} />
              </div>
              <div className="text-[0.86rem] font-[600] text-tx mb-[6px]">No shifts yet</div>
              <div className="text-[0.75rem] text-tx2 max-w-[260px]">
                Your shifts will show up here once a manager publishes the schedule.
              </div>
            </div>
          </div>

          {/* My locations */}
          <div className="bg-surf border border-brd rounded-[14px] overflow-hidden self-start">
            <div className="p-[13px_17px] border-b border-brd">
              <div className="text-[0.84rem] font-[600] tracking-[-0.02em] text-tx">My Locations</div>
              <div className="text-[0.68rem] text-tx2 mt-[1px]">Where you work</div>
            </div>
            {locations.length === 0 ? (
              <div className="px-[17px] py-[24px] text-[0.75rem] text-tx2 text-center">
                You haven&apos;t been added to a location yet. Ask a manager to add you.
              </div>
            ) : (
              locations.map((loc) => (
                <div key={loc.id} className="flex items-center gap-[10px] px-[17px] py-[11px] border-b border-brd last:border-none">
                  <div className="w-[6px] h-[6px] rounded-full bg-acc shrink-0" />
                  <span className="text-[0.82rem] font-[500] text-tx flex-1 truncate">{loc.name}</span>
                  <span className="text-[0.68rem] text-tx3">{LOCATION_ROLE_LABEL[loc.role]}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── empty state (user has no org) ───────────────────────────────────────────

export function EmptyOrgComponent({ user }: { user: any }) {
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 w-full animate-up">
      <div className="w-[80px] h-[80px] rounded-full bg-acc-bg text-acc flex items-center justify-center mb-[24px]">
        <Building2 className="w-[36px] h-[36px]" />
      </div>
      <h1 className="text-[1.8rem] font-[600] tracking-[-0.03em] text-tx mb-[12px] text-center max-w-[400px] leading-[1.2]">
        You haven&apos;t joined an organization
      </h1>
      <p className="text-[0.9rem] text-tx2 font-light mb-[32px] max-w-[480px] text-center leading-[1.6]">
        To jump into scheduling and workforce management, you need to set up
        your primary clinic or be invited to one.
      </p>
      <button
        type="button"
        onClick={() => router.push("/onboarding")}
        className="px-[24px] py-[13px] rounded-[10px] bg-acc text-[#07090E] text-[0.95rem] font-[600] tracking-[-0.01em] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_4px_14px_rgba(0,212,138,0.25)] flex justify-center items-center gap-[6px] border-none cursor-pointer"
      >
        Add your Organization <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.5} />
      </button>
    </div>
  );
}
