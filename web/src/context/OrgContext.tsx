"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

export interface OrgLocation {
  id: string;
  name: string;
}

export interface UserOrg {
  id: string;
  name: string;
  role: string;
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
}

const OrgContext = createContext<OrgContextValue | null>(null);

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const [orgs, setOrgs] = useState<UserOrg[]>([]);
  const [activeOrgId, setActiveOrgIdState] = useState<string | null>(null);
  const [activeLocId, setActiveLocId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("rosta_session");
    if (!raw) { setIsLoading(false); return; }
    const session = JSON.parse(raw);

    api.get(`/organizations/user/${session.id}`)
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

  return (
    <OrgContext.Provider value={{ orgs, activeOrg, activeLocId, setActiveOrgId, setActiveLocId, addOrg, addLocationToOrg, isLoading }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg(): OrgContextValue {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used inside OrgProvider");
  return ctx;
}
