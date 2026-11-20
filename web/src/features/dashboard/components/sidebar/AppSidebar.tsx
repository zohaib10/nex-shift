"use client";

import { useOrg } from "@/context/OrgContext";
import { dashboardKind } from "@/lib/roles";
import { NAV_MAIN, NAV_MANAGE } from "../../nav";
import { OrgSwitcher } from "./OrgSwitcher";
import { SidebarLocations } from "./SidebarLocations";
import { NavSection } from "./NavSection";
import { LogoutButton } from "./LogoutButton";

export function AppSidebar() {
  const { activeOrg } = useOrg();
  const audience = dashboardKind(activeOrg);

  return (
    <aside className="w-[224px] shrink-0 flex flex-col h-full overflow-hidden bg-bg border-r border-brd">
      <OrgSwitcher />
      <SidebarLocations />
      <nav className="flex-1 overflow-y-auto p-[10px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <NavSection title="Main" items={NAV_MAIN.filter((i) => i.for.includes(audience))} first />
        <NavSection title="Manage" items={NAV_MANAGE.filter((i) => i.for.includes(audience))} />
      </nav>
      <LogoutButton />
    </aside>
  );
}
