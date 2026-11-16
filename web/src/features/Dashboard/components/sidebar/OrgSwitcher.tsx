"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus } from "lucide-react";
import { useOrg } from "@/context/OrgContext";
import { ORG_ROLE_LABEL, canCreateOrg, dashboardKind } from "@/lib/roles";
import { OrgBadge } from "./OrgBadge";

/** The active organization, the user's role in it, and a menu to switch. */
export function OrgSwitcher() {
  const router = useRouter();
  const { activeOrg, orgs, setActiveOrgId } = useOrg();
  const [open, setOpen] = React.useState(false);

  const audience = dashboardKind(activeOrg);
  const roleLabel = !activeOrg
    ? ""
    : audience === "admin" ? ORG_ROLE_LABEL[activeOrg.role] : audience === "manager" ? "Manager" : "Staff";

  return (
    <div className="p-[14px_12px_12px] shrink-0 border-b border-brd">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-[9px] p-[8px_9px] rounded-[9px] border-none bg-transparent cursor-pointer transition-colors duration-150 text-left hover:bg-surf2"
      >
        <OrgBadge name={activeOrg?.name ?? "??"} />
        <div className="flex-1 min-w-0">
          <div className="text-[0.82rem] font-[600] tracking-[-0.01em] truncate text-tx">
            {activeOrg?.name ?? "My Organization"}
          </div>
          <div className="text-[0.6rem] text-tx3">{roleLabel}</div>
        </div>
        <ChevronDown
          className={`w-[11px] h-[11px] shrink-0 transition-transform duration-200 text-tx3 ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>

      {open && (
        <div className="mt-[5px] rounded-[10px] overflow-hidden bg-surf2 border border-brd">
          {orgs.map((org) => {
            const isActive = org.id === activeOrg?.id;
            return (
              <div
                key={org.id}
                onClick={() => { setActiveOrgId(org.id); setOpen(false); }}
                className={`flex items-center gap-[8px] px-[11px] py-[9px] cursor-pointer transition-colors duration-150 ${isActive ? "bg-acc-bg" : "hover:bg-surf2"}`}
              >
                <OrgBadge name={org.name} size="sm" />
                <span className="text-[0.78rem] font-[500] flex-1 truncate text-tx">{org.name}</span>
                {isActive && <span className="text-[0.62rem] text-acc">✓</span>}
              </div>
            );
          })}
          {canCreateOrg(orgs) && (
            <div
              onClick={() => { setOpen(false); router.push("/onboarding?mode=add"); }}
              className="flex items-center gap-[7px] px-[11px] py-[8px] cursor-pointer transition-all duration-150 border-t border-brd text-tx3 hover:text-acc hover:bg-surf2"
            >
              <Plus className="w-[12px] h-[12px] shrink-0" strokeWidth={2.5} />
              <span className="text-[0.74rem]">Add organization</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
