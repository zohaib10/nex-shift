"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  ClipboardList,
  Building2,
  BarChart3,
  Settings,
  Plus,
  ChevronDown,
  Map,
  Building,
  MapPin,
  Loader2,
  LogOut,
} from "lucide-react";
import api from "@/lib/api";
import { logout } from "@/lib/session";
import { useTimezone } from "@/features/onboarding/hooks/useTimezone.hook";
import { useOrg } from "@/context/OrgContext";
import { SlidePanel } from "@/components/ui/SlidePanel";
import { ORG_ROLE_LABEL, canCreateOrg, dashboardKind, isOrgAdmin } from "@/lib/roles";

// ─── types ───────────────────────────────────────────────────────────────────

interface OrgLocation {
  id: string;
  name: string;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── nav config ──────────────────────────────────────────────────────────────

type Audience = "admin" | "manager" | "staff";

interface NavEntry {
  label: string;
  icon: React.ElementType;
  href: string;
  /** Who sees this item. Admins see everything listed for managers too. */
  for: Audience[];
  /** Pages that exist yet; the rest show in the menu but don't navigate. */
  ready?: boolean;
}

const NAV_MAIN: NavEntry[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", for: ["admin", "manager", "staff"], ready: true },
  { label: "Schedule", icon: Calendar, href: "/dashboard/schedule", for: ["admin", "manager", "staff"] },
  { label: "Team", icon: Users, href: "/dashboard/team", for: ["admin"], ready: true },
  { label: "Requests", icon: ClipboardList, href: "/dashboard/requests", for: ["admin", "manager", "staff"] },
];

const NAV_MANAGE: NavEntry[] = [
  { label: "Locations", icon: Building2, href: "/dashboard/locations", for: ["admin"] },
  { label: "Analytics", icon: BarChart3, href: "/dashboard/analytics", for: ["admin", "manager"], ready: true },
  { label: "Settings", icon: Settings, href: "/dashboard/settings", for: ["admin"] },
];

// ─── NavItem ──────────────────────────────────────────────────────────────────

function NavItem({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      role={onClick ? "link" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter") onClick(); } : undefined}
      className={`flex items-center gap-[8px] p-[7px_9px] rounded-[8px] cursor-pointer transition-colors duration-150 mb-[1px] ${
        active ? "bg-acc-bg" : "hover:bg-surf2"
      }`}
    >
      <Icon
        className={`w-[15px] h-[15px] shrink-0 ${active ? "text-acc" : "text-tx3"}`}
        strokeWidth={2}
      />
      <span
        className={`text-[0.81rem] flex-1 ${
          active ? "font-[600] text-tx" : "font-[500] text-tx2"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

// ─── AddLocationPanel ────────────────────────────────────────────────────────

function AddLocationPanel({
  open,
  onClose,
  onSaved,
  orgId,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (loc: OrgLocation) => void;
  orgId: string | null;
}) {
  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [nameError, setNameError] = React.useState("");
  const [stateError, setStateError] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [apiError, setApiError] = React.useState("");

  const { data: tzData } = useTimezone(state);

  React.useEffect(() => {
    if (open) {
      setName(""); setAddress(""); setCity(""); setState("");
      setNameError(""); setStateError(""); setApiError("");
    }
  }, [open]);

  async function handleSave() {
    let valid = true;
    if (!name.trim()) { setNameError("Location name is required"); valid = false; }
    else setNameError("");
    if (state && (state.length !== 2 || !/^[A-Za-z]{2}$/.test(state))) {
      setStateError("Enter a 2-letter state code"); valid = false;
    } else setStateError("");
    if (!valid || !orgId) return;

    setSaving(true);
    setApiError("");
    try {
      const { data } = await api.post(`/organizations/${orgId}/locations`, {
        name: name.trim(),
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        state: state.toUpperCase() || undefined,
        timezone: tzData?.timezone || undefined,
      });
      onSaved(data);
      onClose();
    } catch {
      setApiError("Failed to save location. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputBase =
    "w-full bg-bg border rounded-[10px] py-[10px] pr-[13px] pl-[38px] text-[0.88rem] text-tx outline-none transition-all duration-200 focus:ring-[3px] focus:ring-acc-brd";
  const inputNormal = `${inputBase} border-brd2 focus:border-acc`;
  const inputError = `${inputBase} border-red-500 bg-red-500/10 focus:border-red-500`;
  const inputPlain =
    "w-full bg-bg border border-brd2 rounded-[10px] py-[10px] px-[13px] text-[0.88rem] text-tx outline-none transition-all duration-200 focus:ring-[3px] focus:ring-acc-brd focus:border-acc";

  return (
    <SlidePanel open={open} onClose={onClose} title="Add Location">
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-[18px] space-y-[16px]">
          {/* Location name */}
          <div>
            <label className="block text-[0.78rem] font-[500] text-tx2 mb-[6px]">
              Location name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-tx3" strokeWidth={2} />
              <input
                type="text"
                placeholder="e.g. Main Clinic"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={nameError ? inputError : inputNormal}
              />
            </div>
            {nameError && <p className="text-[0.72rem] text-red-500 mt-[5px]">{nameError}</p>}
          </div>

          {/* Street address */}
          <div>
            <label className="block text-[0.78rem] font-[500] text-tx2 mb-[6px]">
              Street address <span className="text-tx3 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-tx3" strokeWidth={2} />
              <input
                type="text"
                placeholder="123 Main St"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={inputNormal}
              />
            </div>
          </div>

          {/* City + State */}
          <div className="grid grid-cols-[1fr_80px] gap-[12px]">
            <div>
              <label className="block text-[0.78rem] font-[500] text-tx2 mb-[6px]">
                City <span className="text-tx3 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Map className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-tx3" strokeWidth={2} />
                <input
                  type="text"
                  placeholder="San Francisco"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={inputNormal}
                />
              </div>
            </div>
            <div>
              <label className="block text-[0.78rem] font-[500] text-tx2 mb-[6px]">State</label>
              <input
                type="text"
                placeholder="CA"
                maxLength={2}
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
                className={`w-full bg-bg border rounded-[10px] py-[10px] px-[13px] text-[0.88rem] text-tx outline-none transition-all duration-200 focus:ring-[3px] focus:ring-acc-brd uppercase ${stateError ? "border-red-500 bg-red-500/10" : "border-brd2 focus:border-acc"}`}
              />
              {stateError && <p className="text-[0.68rem] text-red-500 mt-[4px]">{stateError}</p>}
            </div>
          </div>

          {/* Timezone indicator */}
          <div
            className="overflow-hidden transition-all duration-300"
            style={{ maxHeight: tzData ? "48px" : "0px", opacity: tzData ? 1 : 0 }}
          >
            <div className="flex items-center gap-[8px] py-[8px] px-[12px] bg-acc-bg border border-acc-brd rounded-[8px]">
              <div className="w-[6px] h-[6px] rounded-full bg-acc shrink-0" />
              <span className="text-[0.78rem] text-acc font-[500]">
                Time zone detected: {tzData?.label}
              </span>
            </div>
          </div>

          {apiError && (
            <p className="text-[0.78rem] text-red-500">{apiError}</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-[14px_18px] border-t border-brd shrink-0">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-[42px] rounded-[10px] bg-acc text-[#07090E] text-[0.88rem] font-[600] flex items-center justify-center gap-[6px] hover:opacity-85 transition-opacity disabled:opacity-60 cursor-pointer border-none"
          >
            {saving ? (
              <Loader2 className="w-[15px] h-[15px] animate-spin" strokeWidth={2} />
            ) : (
              <>
                <Plus className="w-[14px] h-[14px]" strokeWidth={2.5} />
                Save Location
              </>
            )}
          </button>
        </div>
    </SlidePanel>
  );
}

// ─── AppSidebar ───────────────────────────────────────────────────────────────

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { activeOrg, activeLocId, setActiveLocId, setActiveOrgId, orgs, addLocationToOrg, showAllLocations } = useOrg();

  const orgId = activeOrg?.id ?? null;
  const orgName = activeOrg?.name ?? null;
  const locations: OrgLocation[] = activeOrg?.locations ?? [];
  const audience = dashboardKind(activeOrg);
  const isAdmin = isOrgAdmin(activeOrg?.role);
  const navMain = NAV_MAIN.filter((i) => i.for.includes(audience));
  const navManage = NAV_MANAGE.filter((i) => i.for.includes(audience));

  const [panelOpen, setPanelOpen] = React.useState(false);
  const [orgDropOpen, setOrgDropOpen] = React.useState(false);

  return (
    <>
      <aside className="w-[224px] shrink-0 flex flex-col h-full overflow-hidden bg-bg border-r border-brd">
        {/* Org switcher */}
        <div className="p-[14px_12px_12px] shrink-0 border-b border-brd">
          <button
            onClick={() => setOrgDropOpen((o) => !o)}
            className="w-full flex items-center gap-[9px] p-[8px_9px] rounded-[9px] border-none bg-transparent cursor-pointer transition-colors duration-150 text-left hover:bg-surf2"
          >
            <div className="w-[30px] h-[30px] rounded-[7px] bg-gradient-to-br from-acc to-blu flex items-center justify-center text-[0.6rem] font-[700] text-[#07090E] shrink-0">
              {getInitials(orgName ?? "??")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[0.82rem] font-[600] tracking-[-0.01em] truncate text-tx">
                {orgName ?? "My Organization"}
              </div>
              <div className="text-[0.6rem] text-tx3">
                {!activeOrg ? "" : audience === "admin" ? ORG_ROLE_LABEL[activeOrg.role] : audience === "manager" ? "Manager" : "Staff"}
              </div>
            </div>
            <ChevronDown
              className={`w-[11px] h-[11px] shrink-0 transition-transform duration-200 text-tx3 ${orgDropOpen ? "rotate-180" : ""}`}
              strokeWidth={2}
            />
          </button>

          {/* Dropdown */}
          {orgDropOpen && (
            <div className="mt-[5px] rounded-[10px] overflow-hidden bg-surf2 border border-brd">
              {orgs.map((org) => {
                const isActive = org.id === orgId;
                return (
                  <div
                    key={org.id}
                    onClick={() => { setActiveOrgId(org.id); setOrgDropOpen(false); }}
                    className={`flex items-center gap-[8px] px-[11px] py-[9px] cursor-pointer transition-colors duration-150 ${isActive ? "bg-acc-bg" : "hover:bg-surf2"}`}
                  >
                    <div className="w-[22px] h-[22px] rounded-[5px] bg-gradient-to-br from-acc to-blu flex items-center justify-center text-[0.52rem] font-[700] text-[#07090E] shrink-0">
                      {getInitials(org.name)}
                    </div>
                    <span className="text-[0.78rem] font-[500] flex-1 truncate text-tx">{org.name}</span>
                    {isActive && <span className="text-[0.62rem] text-acc">✓</span>}
                  </div>
                );
              })}
              {canCreateOrg(orgs) && (
                <div
                  onClick={() => { setOrgDropOpen(false); router.push("/onboarding?mode=add"); }}
                  className="flex items-center gap-[7px] px-[11px] py-[8px] cursor-pointer transition-all duration-150 border-t border-brd text-tx3 hover:text-acc hover:bg-surf2"
                >
                  <Plus className="w-[12px] h-[12px] shrink-0" strokeWidth={2.5} />
                  <span className="text-[0.74rem]">Add organization</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Locations */}
        <div className="px-[10px] py-[8px] shrink-0 border-b border-brd">
          <div className="text-[0.59rem] font-[600] tracking-[0.09em] uppercase px-[9px] pb-[4px] text-tx3">
            Locations
          </div>
          {/* All Locations row (hidden when the user only has one location) */}
          {showAllLocations && (() => {
            const active = activeLocId === null;
            return (
              <div
                onClick={() => setActiveLocId(null)}
                className={`flex items-center gap-[7px] px-[9px] py-[6px] rounded-[7px] cursor-pointer transition-colors duration-150 ${active ? "bg-acc-bg" : "hover:bg-surf2"}`}
              >
                <div className={`w-[5px] h-[5px] rounded-full shrink-0 transition-colors duration-150 ${active ? "bg-acc" : "bg-brd2"}`} />
                <span className={`text-[0.78rem] flex-1 truncate transition-colors duration-150 ${active ? "font-[600] text-tx" : "font-[500] text-tx2"}`}>
                  All Locations
                </span>
                <span className="text-[0.62rem] shrink-0 text-tx3">{locations.length}</span>
              </div>
            );
          })()}
          {locations.map((loc) => {
            const active = activeLocId === loc.id;
            return (
              <div
                key={loc.id}
                onClick={() => setActiveLocId(active && showAllLocations ? null : loc.id)}
                className={`flex items-center gap-[7px] px-[9px] py-[6px] rounded-[7px] cursor-pointer transition-colors duration-150 ${active ? "bg-acc-bg" : "hover:bg-surf2"}`}
              >
                <div className={`w-[5px] h-[5px] rounded-full shrink-0 transition-colors duration-150 ${active ? "bg-acc" : "bg-brd2"}`} />
                <span className={`text-[0.78rem] flex-1 truncate transition-colors duration-150 ${active ? "font-[600] text-tx" : "font-[500] text-tx2"}`}>
                  {loc.name}
                </span>
                <span className="text-[0.62rem] shrink-0 text-tx3">0</span>
              </div>
            );
          })}
          {isAdmin && (
            <button
              onClick={() => setPanelOpen(true)}
              className="flex items-center gap-[6px] px-[9px] py-[5px] rounded-[7px] w-full text-left mt-[3px] border-none bg-transparent cursor-pointer transition-all duration-150 group hover:bg-surf2"
            >
              <Plus className="w-[11px] h-[11px] shrink-0 text-tx3 group-hover:text-acc transition-colors duration-150" strokeWidth={2.5} />
              <span className="text-[0.74rem] transition-colors duration-150 text-tx3 group-hover:text-acc">Add location</span>
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-[10px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="text-[0.58rem] font-[600] tracking-[0.09em] uppercase text-tx3 px-[9px] pt-[6px] pb-[4px]">
            Main
          </div>
          {navMain.map((item) => (
            <NavItem
              key={item.href}
              label={item.label}
              icon={item.icon}
              active={pathname === item.href}
              onClick={item.ready ? () => router.push(item.href) : undefined}
            />
          ))}
          {navManage.length > 0 && (
            <div className="text-[0.58rem] font-[600] tracking-[0.09em] uppercase text-tx3 px-[9px] pt-[10px] pb-[4px]">
              Manage
            </div>
          )}
          {navManage.map((item) => (
            <NavItem
              key={item.href}
              label={item.label}
              icon={item.icon}
              active={pathname === item.href}
              onClick={item.ready ? () => router.push(item.href) : undefined}
            />
          ))}
        </nav>

        <div className="p-[10px] border-t border-brd shrink-0">
          <button
            onClick={async () => { await logout(); router.push("/"); }}
            className="w-full flex items-center gap-[8px] p-[7px_9px] rounded-[8px] hover:bg-surf2 transition-colors duration-150 text-left"
          >
            <LogOut className="w-[14px] h-[14px] text-tx3 shrink-0" strokeWidth={2} />
            <span className="text-[0.77rem] font-[600] text-tx">Logout</span>
          </button>
        </div>
      </aside>

      <AddLocationPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onSaved={(loc) => { if (orgId) addLocationToOrg(orgId, { ...loc, role: "manager" }); }}
        orgId={orgId}
      />
    </>
  );
}
