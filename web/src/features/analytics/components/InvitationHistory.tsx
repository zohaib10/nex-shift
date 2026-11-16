"use client";

import * as React from "react";
import { History, Loader2 } from "lucide-react";
import { useLocationRequests } from "@/features/invites/hooks/useLocationRequests";
import { effectiveStatus, type StatusFilter } from "../utils/invites";
import { StatusFilterTabs } from "./StatusFilterTabs";
import { InvitationHistoryRow } from "./InvitationHistoryRow";

const COLUMNS = ["Person", "Role", "Location", "Invited by", "Sent", "Status", "Responded"];

/** Every invite sent for the selected location (or all the user can see). */
export function InvitationHistory({
  orgId,
  locationId,
  locationName,
}: {
  orgId: string;
  locationId: string | null;
  locationName: string;
}) {
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
        <StatusFilterTabs value={filter} onChange={setFilter} />
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
                {COLUMNS.map((c, i) => (
                  <th
                    key={c}
                    className={`py-[9px] font-[600] ${i === 0 || i === COLUMNS.length - 1 ? "px-[17px]" : "px-[12px]"}`}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => <InvitationHistoryRow key={r.id} invite={r} />)}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
