"use client";

import { Loader2 } from "lucide-react";
import { DASHBOARD_CARD_INFO, type DashboardCard } from "@/lib/preferences";
import { useDashboardCards } from "../hooks/usePreferences";
import { ToggleRow } from "./ToggleRow";

/** Which cards show on this user's dashboard. Saved to their account. */
export function DashboardSettings() {
  const { ready, isHidden, setHidden } = useDashboardCards();
  const cards = Object.keys(DASHBOARD_CARD_INFO) as DashboardCard[];

  return (
    <section className="bg-surf border border-brd rounded-[14px] overflow-hidden max-w-[560px] animate-up">
      <div className="p-[13px_17px] border-b border-brd">
        <div className="text-[0.84rem] font-[600] tracking-[-0.02em] text-tx">Dashboard</div>
        <div className="text-[0.68rem] text-tx2 mt-[1px]">Choose what shows on your dashboard. Only affects you.</div>
      </div>
      {!ready ? (
        <div className="flex justify-center py-[24px]"><Loader2 className="w-[16px] h-[16px] animate-spin text-acc" /></div>
      ) : (
        cards.map((c) => (
          <ToggleRow
            key={c}
            label={DASHBOARD_CARD_INFO[c].label}
            hint={DASHBOARD_CARD_INFO[c].hint}
            checked={!isHidden(c)}
            onChange={(show) => setHidden(c, !show)}
          />
        ))
      )}
    </section>
  );
}
