import type * as React from "react";
import { BarChart3, Building2, Calendar, ClipboardList, LayoutDashboard, Settings, Users } from "lucide-react";
import type { dashboardKind } from "@/lib/roles";

export type Audience = ReturnType<typeof dashboardKind>;

export interface NavEntry {
  label: string;
  icon: React.ElementType;
  href: string;
  /** Who sees this item. */
  for: Audience[];
  /** Pages that exist yet; the rest show in the menu but don't navigate. */
  ready?: boolean;
}

export const NAV_MAIN: NavEntry[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", for: ["admin", "manager", "staff"], ready: true },
  { label: "Schedule", icon: Calendar, href: "/dashboard/schedule", for: ["admin", "manager", "staff"], ready: true },
  { label: "Team", icon: Users, href: "/dashboard/team", for: ["admin", "manager"], ready: true },
  { label: "Requests", icon: ClipboardList, href: "/dashboard/requests", for: ["admin", "manager", "staff"] },
];

export const NAV_MANAGE: NavEntry[] = [
  { label: "Locations", icon: Building2, href: "/dashboard/locations", for: ["admin"] },
  { label: "Analytics", icon: BarChart3, href: "/dashboard/analytics", for: ["admin", "manager"] },
  { label: "Settings", icon: Settings, href: "/dashboard/settings", for: ["admin", "manager"], ready: true },
];
