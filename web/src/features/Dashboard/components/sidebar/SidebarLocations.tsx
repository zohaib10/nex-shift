"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { useOrg } from "@/context/OrgContext";
import { isOrgAdmin } from "@/lib/roles";
import { LocationRow } from "./LocationRow";
import { AddLocationPanel } from "./AddLocationPanel";

/** The location picker in the sidebar, plus "Add location" for admins. */
export function SidebarLocations() {
  const { activeOrg, activeLocId, setActiveLocId, addLocationToOrg, showAllLocations } = useOrg();
  const [panelOpen, setPanelOpen] = React.useState(false);
  const orgId = activeOrg?.id ?? null;
  const locations = activeOrg?.locations ?? [];

  return (
    <div className="px-[10px] py-[8px] shrink-0 border-b border-brd">
      <div className="text-[0.59rem] font-[600] tracking-[0.09em] uppercase px-[9px] pb-[4px] text-tx3">Locations</div>

      {/* Hidden when the user only has one location */}
      {showAllLocations && (
        <LocationRow
          label="All Locations"
          count={locations.length}
          active={activeLocId === null}
          onClick={() => setActiveLocId(null)}
        />
      )}
      {locations.map((loc) => {
        const active = activeLocId === loc.id;
        return (
          <LocationRow
            key={loc.id}
            label={loc.name}
            count={0}
            active={active}
            onClick={() => setActiveLocId(active && showAllLocations ? null : loc.id)}
          />
        );
      })}

      {isOrgAdmin(activeOrg?.role) && (
        <button
          onClick={() => setPanelOpen(true)}
          className="flex items-center gap-[6px] px-[9px] py-[5px] rounded-[7px] w-full text-left mt-[3px] border-none bg-transparent cursor-pointer transition-all duration-150 group hover:bg-surf2"
        >
          <Plus className="w-[11px] h-[11px] shrink-0 text-tx3 group-hover:text-acc transition-colors duration-150" strokeWidth={2.5} />
          <span className="text-[0.74rem] transition-colors duration-150 text-tx3 group-hover:text-acc">Add location</span>
        </button>
      )}

      <AddLocationPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onSaved={(loc) => { if (orgId) addLocationToOrg(orgId, { ...loc, role: "manager" }); }}
        orgId={orgId}
      />
    </div>
  );
}
