"use client";

import * as React from "react";
import { History, Loader2, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PageLoader } from "@/components/PageLoader";
import { useOrg } from "@/context/OrgContext";
import { personName, useLocationRequests, type MemberRequest } from "@/hooks/invites/useLocationRequests";
import { INVITE_ROLE_LABEL, dashboardKind, managedLocations } from "@/lib/roles";

const STATUS_FILTERS = ["all", "pending", "accepted", "expired", "declined"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-[rgba(255,176,0,0.12)] text-[#FFB000]",
  accepted: "bg-acc-bg text-acc",
  declined: "bg-red-500/10 text-red-500",
  expired: "bg-surf2 text-tx3",
};

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

/** A pending invite past its expiry date reads as expired, even before the server marks it. */
function effectiveStatus(r: MemberRequest) {
  return r.status === "pending" && new Date(r.expiresAt) < new Date() ? "expired" : r.status;
}

function InvitationHistory({ orgId, locationId, locationName }: { orgId: string; locationId: string | null; locationName: string }) {
  const { data: requests, isLoading, isError } = useLocationRequests(orgId, locationId);
  const [filter, setFilter] = React.useState<StatusFilter>("all");

  const rows = (requests ?? []).filter((r) => filter === "all" || effectiveStatus(r) === filter);

  return (
    <section className="bg-surf border border-brd rounded-[14px] overflow-hidden animate-up">
      <div className="flex flex-wrap gap-[10px] justify-between items-center p-[13px_17px] border-b border-brd">
        <div>
          <div className="text-[0.84rem] font-[600] tracking-[-0.02em] text-tx">Invitation History</div>
          <div className="text-[0.68rem] text-tx2 mt-[1px]">{locationName} · Every invite sent</div>
        </div>
        <div className="inline-flex border border-brd2 rounded-[8px] overflow-hidden" role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map((s, i) => (
            <button
              key={s}
              type="button"
              aria-pressed={filter === s}
              onClick={() => setFilter(s)}
              className={`px-[10px] py-[5px] text-[0.72rem] font-[500] capitalize border-none cursor-pointer ${i > 0 ? "border-l border-brd2" : ""} ${filter === s ? "bg-acc-bg text-acc" : "bg-transparent text-tx2 hover:bg-surf2"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-[36px]"><Loader2 className="w-[18px] h-[18px] animate-spin text-acc" /></div>
      )}
      {isError && <div className="px-[17px] py-[24px] text-[0.8rem] text-red-500">Couldn&apos;t load the invitation history.</div>}

      {!isLoading && !isError && rows.length === 0 && (
        <div className="flex flex-col items-center py-[40px] text-center">
          <History className="w-[16px] h-[16px] text-tx3 mb-[8px]" strokeWidth={2} />
          <div className="text-[0.8rem] text-tx2">
            {filter === "all" ? "No invites have been sent yet." : `No ${filter} invites.`}
          </div>
        </div>
      )}

      {rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[0.78rem] min-w-[720px]">
            <thead>
              <tr className="text-[0.62rem] font-[600] uppercase tracking-[0.07em] text-tx3 border-b border-brd">
                <th className="px-[17px] py-[9px] font-[600]">Person</th>
                <th className="px-[12px] py-[9px] font-[600]">Role</th>
                <th className="px-[12px] py-[9px] font-[600]">Location</th>
                <th className="px-[12px] py-[9px] font-[600]">Invited by</th>
                <th className="px-[12px] py-[9px] font-[600]">Sent</th>
                <th className="px-[12px] py-[9px] font-[600]">Status</th>
                <th className="px-[17px] py-[9px] font-[600]">Responded</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const status = effectiveStatus(r);
                const name = personName(r.acceptedBy);
                return (
                  <tr key={r.id} className="border-b border-brd last:border-none align-top">
                    <td className="px-[17px] py-[10px]">
                      <div className="font-[500] text-tx">{name ?? r.email}</div>
                      {name && <div className="text-[0.7rem] text-tx3">{r.email}</div>}
                    </td>
                    <td className="px-[12px] py-[10px] text-tx2">{INVITE_ROLE_LABEL[r.role] ?? "Staff"}</td>
                    <td className="px-[12px] py-[10px] text-tx2">{r.role === "admin" ? "All locations" : r.location.name}</td>
                    <td className="px-[12px] py-[10px] text-tx2">{personName(r.invitedBy) ?? "—"}</td>
                    <td className="px-[12px] py-[10px] text-tx2 tabular-nums whitespace-nowrap">{fmtDate(r.createdAt)}</td>
                    <td className="px-[12px] py-[10px]">
                      <span className={`text-[0.66rem] font-[600] uppercase tracking-[0.05em] px-[7px] py-[3px] rounded-[5px] ${STATUS_STYLE[status] ?? STATUS_STYLE.expired}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-[17px] py-[10px] text-tx2 tabular-nums whitespace-nowrap">{fmtDate(r.respondedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function AnalyticsPage() {
  const { activeOrg, activeLocId, isLoading } = useOrg();
  if (isLoading) return <PageLoader />;

  const kind = dashboardKind(activeOrg);
  const managed = managedLocations(activeOrg);
  // Managers only see history for locations they manage.
  const canSeeSelection = kind === "admin" || activeLocId === null || managed.some((l) => l.id === activeLocId);
  const locationName = activeLocId
    ? activeOrg?.locations.find((l) => l.id === activeLocId)?.name ?? "All Locations"
    : kind === "admin" ? "All Locations" : "Your locations";

  return (
    <>
      <div className="h-[50px] shrink-0 flex items-center justify-between px-[22px] bg-nav backdrop-blur-[18px] border-b border-brd">
        <div className="flex items-center gap-[7px] min-w-0">
          <span className="text-[0.92rem] font-[600] tracking-[-0.02em] text-tx">Analytics</span>
          <span className="text-tx3 text-[0.75rem]">·</span>
          <span className="text-[0.8rem] text-tx2 truncate">{locationName}</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="flex-1 overflow-y-auto p-[22px]">
        {kind === "staff" || !activeOrg || !canSeeSelection ? (
          <div className="flex flex-col items-center justify-center py-[60px] text-center">
            <ShieldCheck className="w-[22px] h-[22px] text-tx3 mb-[10px]" strokeWidth={2} />
            <div className="text-[0.88rem] font-[600] text-tx">Analytics are for admins and managers</div>
            <div className="text-[0.76rem] text-tx2 mt-[4px]">
              {kind === "manager" ? "Pick a location you manage in the sidebar." : "Ask an admin if you need access."}
            </div>
          </div>
        ) : (
          <InvitationHistory orgId={activeOrg.id} locationId={activeLocId} locationName={locationName} />
        )}
      </div>
    </>
  );
}
