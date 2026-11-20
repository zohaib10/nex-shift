"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { isOrgAdmin, type LocationRole, type OrgRole } from "@/lib/roles";

export interface OrgLocation {
  id: string;
  name: string;
  /** The user's role here. Admins and owners are managers everywhere. */
  role: LocationRole;
  /** IANA timezone; shifts here are shown in it. Missing on older locations. */
  timezone?: string | null;
}

export interface UserOrg {
  id: string;
  name: string;
  role: OrgRole;
  /** Admins see every location; members only the ones they belong to. */
  locations: OrgLocation[];
}

interface OrgContextValue {
  orgs: UserOrg[];
  activeOrg: UserOrg | null;
  activeLocId: string | null;
  setActiveOrgId: (id: string) => void;
  setActiveLocId: (id: string | null) => void;
  addOrg: (org: UserOrg) => void;
  addLocationToOrg: (orgId: string, loc: OrgLocation) => void;
  isLoading: boolean;
  /** False when the user belongs to only one location (and isn't an admin). */
  showAllLocations: boolean;
}

const OrgContext = createContext<OrgContextValue | null>(null);

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const [orgs, setOrgs] = useState<UserOrg[]>([]);
  const [activeOrgId, setActiveOrgIdState] = useState<string | null>(null);
  const [activeLocId, setActiveLocId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get(`/organizations/mine`)
      .then((res) => {
        const fetched: UserOrg[] = res.data;
        setOrgs(fetched);
        if (fetched.length > 0) {
          const pending = sessionStorage.getItem("rosta_pending_org");
          if (pending && fetched.find((o) => o.id === pending)) {
            sessionStorage.removeItem("rosta_pending_org");
            setActiveOrgIdState(pending);
          } else {
            setActiveOrgIdState(fetched[0].id);
          }
        }
      })
      .catch(() => {/* silently fall through — container handles empty state */})
      .finally(() => setIsLoading(false));
  }, []);

  const setActiveOrgId = useCallback((id: string) => {
    setActiveOrgIdState(id);
    setActiveLocId(null); // reset location whenever org changes
  }, []);

  const addOrg = useCallback((org: UserOrg) => {
    setOrgs((prev) => [...prev, org]);
    setActiveOrgIdState(org.id);
    setActiveLocId(null);
  }, []);

  const addLocationToOrg = useCallback((orgId: string, loc: OrgLocation) => {
    setOrgs((prev) =>
      prev.map((o) =>
        o.id === orgId ? { ...o, locations: [...o.locations, loc] } : o
      )
    );
  }, []);

  const activeOrg = orgs.find((o) => o.id === activeOrgId) ?? null;

  // Staff or managers at a single location have no "All Locations" view:
  // that one location is always the selected one.
  const onlyLocationId =
    activeOrg && !isOrgAdmin(activeOrg.role) && activeOrg.locations.length === 1
      ? activeOrg.locations[0].id
      : null;
  const showAllLocations = !onlyLocationId;
  const effectiveLocId = onlyLocationId ?? activeLocId;

  return (
    <OrgContext.Provider
      value={{
        orgs,
        activeOrg,
        activeLocId: effectiveLocId,
        setActiveOrgId,
        setActiveLocId,
        addOrg,
        addLocationToOrg,
        isLoading,
        showAllLocations,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg(): OrgContextValue {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used inside OrgProvider");
  return ctx;
}
