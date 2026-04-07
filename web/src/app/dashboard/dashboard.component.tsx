"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DashboardHeader } from "@/features/Dashboard/components/Header";
import {
  LayoutDashboard,
  Calendar,
  Users,
  ClipboardList,
  Building2,
  BarChart3,
  Settings,
  Bell,
  Plus,
  ChevronDown,
  ArrowRight,
  AlertTriangle,
  UserCheck,
  MapPin,
  X,
  Map,
  Building,
  Loader2,
} from "lucide-react";
import api from "@/lib/api";
import { useTimezone } from "@/features/onboarding/hooks/useTimezone.hook";
import { useOrg } from "@/context/OrgContext";

interface OrgLocation {
  id: string;
  name: string;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getDayStrip(today: Date) {
  const dow = today.getDay(); // 0 = Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
      dayNum: d.getDate(),
      isToday: d.toDateString() === today.toDateString(),
    };
  });
}

// ─── sub-components ─────────────────────────────────────────────────────────

const NAV_MAIN = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Schedule", icon: Calendar, href: "/dashboard/schedule" },
  { label: "Team", icon: Users, href: "/dashboard/team" },
  { label: "Requests", icon: ClipboardList, href: "/dashboard/requests" },
];

const NAV_MANAGE = [
  { label: "Locations", icon: Building2, href: "/dashboard/locations" },
  { label: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
  { label: "Settings", icon: Settings, href: "/dashboard/settings" },
];

function NavItem({
  label,
  icon: Icon,
  active,
}: {
  label: string;
  icon: React.ElementType;
  active: boolean;
}) {
  return (
    <div
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

function StatCard({
  icon: Icon,
  iconClass,
  label,
  value,
  delta,
  dimClass,
}: {
  icon: React.ElementType;
  iconClass: string;
  label: string;
  value: string;
  delta: string;
  dimClass: string;
}) {
  return (
    <div className="bg-surf border border-brd rounded-[12px] p-[16px_17px] hover:border-brd2 hover:-translate-y-[2px] transition-all duration-200 cursor-pointer">
      <div
        className={`w-[28px] h-[28px] rounded-[7px] ${dimClass} flex items-center justify-center mb-[10px]`}
      >
        <Icon className={`w-[14px] h-[14px] ${iconClass}`} strokeWidth={2} />
      </div>
      <div className="text-[0.68rem] font-[500] text-tx2 uppercase tracking-[0.05em] mb-[3px]">
        {label}
      </div>
      <div className="text-[1.6rem] font-[600] tracking-[-0.04em] text-tx leading-none">
        {value}
      </div>
      <div className="text-[0.68rem] text-tx3 mt-[5px]">{delta}</div>
    </div>
  );
}

// ─── add location panel ──────────────────────────────────────────────────────

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

  // Reset form when panel opens
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
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-[49] transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[340px] bg-surf border-l border-brd2 z-[50] flex flex-col shadow-2xl transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[18px] py-[14px] border-b border-brd shrink-0">
          <span className="text-[0.86rem] font-[600] text-tx">Add Location</span>
          <button
            onClick={onClose}
            className="w-[26px] h-[26px] rounded-[6px] border border-brd2 bg-transparent flex items-center justify-center text-tx2 hover:bg-surf2 transition-colors cursor-pointer"
          >
            <X className="w-[13px] h-[13px]" strokeWidth={2} />
          </button>
        </div>

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
      </div>
    </>
  );
}

// ─── main dashboard (user has org) ──────────────────────────────────────────

export function DashboardComponent({
  user,
  onLocationAdded,
}: {
  user: any;
  onLocationAdded: (loc: OrgLocation) => void;
}) {
  const router = useRouter();
  const { activeOrg, activeLocId, setActiveLocId, setActiveOrgId, orgs } = useOrg();

  const orgId = activeOrg?.id ?? null;
  const orgName = activeOrg?.name ?? null;
  const locations = activeOrg?.locations ?? [];

  const [panelOpen, setPanelOpen] = React.useState(false);
  const [orgDropOpen, setOrgDropOpen] = React.useState(false);

  const selectedLocId = activeLocId;
  const setSelectedLocId = setActiveLocId;

  const selectedLocName = selectedLocId
    ? (locations.find((l: OrgLocation) => l.id === selectedLocId)?.name ?? "All Locations")
    : "All Locations";

  const displayName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    user?.email ||
    "User";
  const initials = getInitials(displayName);

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const schedSubDate = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const days = getDayStrip(now);

  return (
    <div className="flex h-[100svh] overflow-hidden">
      {/* ── SIDEBAR ── */}
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
              <div className="text-[0.6rem] text-tx3">Admin</div>
            </div>
            <ChevronDown
              className={`w-[11px] h-[11px] shrink-0 transition-transform duration-200 text-tx3 ${orgDropOpen ? "rotate-180" : ""}`}
              strokeWidth={2}
            />
          </button>

          {/* Dropdown */}
          {orgDropOpen && (
            <div
              className="mt-[5px] rounded-[10px] overflow-hidden bg-surf2 border border-brd"
            >
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
              <div
                onClick={() => { setOrgDropOpen(false); router.push("/onboarding?mode=add"); }}
                className="flex items-center gap-[7px] px-[11px] py-[8px] cursor-pointer transition-all duration-150 border-t border-brd text-tx3 hover:text-acc hover:bg-surf2"
              >
                <Plus className="w-[12px] h-[12px] shrink-0" strokeWidth={2.5} />
                <span className="text-[0.74rem]">Add organization</span>
              </div>
            </div>
          )}
        </div>

        {/* Locations */}
        <div className="px-[10px] py-[8px] shrink-0 border-b border-brd">
          <div className="text-[0.59rem] font-[600] tracking-[0.09em] uppercase px-[9px] pb-[4px] text-tx3">
            Locations
          </div>
          {/* All Locations row */}
          {(() => {
            const active = selectedLocId === null;
            return (
              <div
                onClick={() => setSelectedLocId(null)}
                className={`flex items-center gap-[7px] px-[9px] py-[6px] rounded-[7px] cursor-pointer transition-colors duration-150 ${active ? "bg-acc-bg" : "hover:bg-surf2"}`}
              >
                <div
                  className={`w-[5px] h-[5px] rounded-full shrink-0 transition-colors duration-150 ${active ? "bg-acc" : "bg-brd2"}`}
                />
                <span
                  className={`text-[0.78rem] flex-1 truncate transition-colors duration-150 ${active ? "font-[600] text-tx" : "font-[500] text-tx2"}`}
                >
                  All Locations
                </span>
                <span className="text-[0.62rem] shrink-0 text-tx3">{locations.length}</span>
              </div>
            );
          })()}
          {locations.map((loc: OrgLocation) => {
            const active = selectedLocId === loc.id;
            return (
              <div
                key={loc.id}
                onClick={() => setSelectedLocId(active ? null : loc.id)}
                className={`flex items-center gap-[7px] px-[9px] py-[6px] rounded-[7px] cursor-pointer transition-colors duration-150 ${active ? "bg-acc-bg" : "hover:bg-surf2"}`}
              >
                <div
                  className={`w-[5px] h-[5px] rounded-full shrink-0 transition-colors duration-150 ${active ? "bg-acc" : "bg-brd2"}`}
                />
                <span
                  className={`text-[0.78rem] flex-1 truncate transition-colors duration-150 ${active ? "font-[600] text-tx" : "font-[500] text-tx2"}`}
                >
                  {loc.name}
                </span>
                <span className="text-[0.62rem] shrink-0 text-tx3">0</span>
              </div>
            );
          })}
          <button
            onClick={() => setPanelOpen(true)}
            className="flex items-center gap-[6px] px-[9px] py-[5px] rounded-[7px] w-full text-left mt-[3px] border-none bg-transparent cursor-pointer transition-all duration-150 group hover:bg-surf2"
          >
            <Plus className="w-[11px] h-[11px] shrink-0 text-tx3 group-hover:text-acc transition-colors duration-150" strokeWidth={2.5} />
            <span className="text-[0.74rem] transition-colors duration-150 text-tx3 group-hover:text-acc">Add location</span>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-[10px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="text-[0.58rem] font-[600] tracking-[0.09em] uppercase text-tx3 px-[9px] pt-[6px] pb-[4px]">
            Main
          </div>
          {NAV_MAIN.map((item) => (
            <NavItem
              key={item.href}
              label={item.label}
              icon={item.icon}
              active={item.href === "/dashboard"}
            />
          ))}
          <div className="text-[0.58rem] font-[600] tracking-[0.09em] uppercase text-tx3 px-[9px] pt-[10px] pb-[4px]">
            Manage
          </div>
          {NAV_MANAGE.map((item) => (
            <NavItem
              key={item.href}
              label={item.label}
              icon={item.icon}
              active={false}
            />
          ))}
        </nav>

        {/* Profile footer */}
        <div className="p-[10px] border-t border-brd shrink-0">
          <button
            onClick={() => router.push("/dashboard/profile")}
            className="w-full flex items-center gap-[8px] p-[7px_9px] rounded-[8px] hover:bg-surf2 transition-colors duration-150 text-left"
          >
            <div className="w-[28px] h-[28px] rounded-full bg-gradient-to-br from-acc to-blu flex items-center justify-center text-[0.55rem] font-[600] text-[#07090E] shrink-0 border-[1.5px] border-acc-brd">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[0.56rem] font-[600] tracking-[0.08em] uppercase text-tx3 leading-none">
                Profile
              </div>
              <div className="text-[0.77rem] font-[600] text-tx leading-[1.3] truncate">
                {displayName}
              </div>
            </div>
            <ChevronDown
              className="w-[10px] h-[10px] text-tx3 shrink-0"
              strokeWidth={2}
            />
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <div className="h-[50px] shrink-0 flex items-center justify-between px-[22px] bg-nav backdrop-blur-[18px] border-b border-brd">
          <div className="flex items-center gap-[7px]">
            <span className="text-[0.92rem] font-[600] tracking-[-0.02em] text-tx">
              Dashboard
            </span>
            <span className="text-tx3 text-[0.75rem]">·</span>
            <span className="text-[0.8rem] text-tx2">{selectedLocName}</span>
          </div>
          <div className="flex gap-[7px] items-center">
            <ThemeToggle />
            <button className="w-[32px] h-[32px] rounded-[8px] border border-brd2 bg-surf flex items-center justify-center text-tx2 hover:bg-surf2 transition-colors relative">
              <Bell className="w-[14px] h-[14px]" strokeWidth={2} />
            </button>
            <button className="h-[30px] px-[13px] rounded-[8px] bg-acc text-[#07090E] text-[0.76rem] font-[600] flex items-center gap-[5px] hover:opacity-85 transition-opacity border-none">
              <Plus className="w-[13px] h-[13px]" strokeWidth={2.5} />
              New Schedule
            </button>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-[22px]">
          {/* Greeting */}
          <div className="mb-[20px] animate-up">
            <div className="text-[1.3rem] font-[600] tracking-[-0.04em] text-tx leading-[1.2]">
              {greeting}, {user?.firstName || "there"}
            </div>
            <div className="text-[0.8rem] text-tx2 mt-[3px]">{dateStr} · {selectedLocName} · {orgName}</div>
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-4 gap-[11px] mb-[18px]"
            style={{ animation: "up 0.5s 0.04s both" }}
          >
            <StatCard
              icon={Users}
              iconClass="text-acc"
              label="On Shift Today"
              value="0"
              delta="No active shifts"
              dimClass="bg-acc-bg"
            />
            <StatCard
              icon={ClipboardList}
              iconClass="text-[#FFB000]"
              label="Pending Requests"
              value="0"
              delta="No pending requests"
              dimClass="bg-[rgba(255,176,0,0.1)]"
            />
            <StatCard
              icon={Calendar}
              iconClass="text-blu"
              label="Shifts This Week"
              value="0"
              delta="Add shifts to get started"
              dimClass="bg-blu-bg"
            />
            <StatCard
              icon={AlertTriangle}
              iconClass="text-[#FF4D4D]"
              label="Coverage Gaps"
              value="0"
              delta="Nothing to flag"
              dimClass="bg-[rgba(255,77,77,0.1)]"
            />
          </div>

          {/* Bottom grid */}
          <div
            className="grid grid-cols-[1fr_280px] gap-[14px]"
            style={{ animation: "up 0.5s 0.08s both" }}
          >
            {/* Today's schedule */}
            <div className="bg-surf border border-brd rounded-[14px] overflow-hidden">
              <div className="flex justify-between items-center p-[13px_17px] border-b border-brd">
                <div>
                  <div className="text-[0.84rem] font-[600] tracking-[-0.02em] text-tx">
                    Today&apos;s Schedule
                  </div>
                  <div className="text-[0.68rem] text-tx2 mt-[1px]">
                    {selectedLocName} · {schedSubDate}
                  </div>
                </div>
                <button className="text-[0.72rem] font-[500] text-acc bg-transparent border-none cursor-pointer hover:opacity-70 transition-opacity whitespace-nowrap">
                  Full schedule →
                </button>
              </div>

              {/* Day strip */}
              <div className="flex gap-[3px] px-[17px] py-[10px] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {days.map((d, i) => (
                  <div
                    key={i}
                    className={`shrink-0 min-w-[42px] flex flex-col items-center p-[6px_7px] rounded-[8px] cursor-pointer border transition-colors duration-150 ${
                      d.isToday
                        ? "border-brd2 bg-surf2"
                        : "border-transparent hover:bg-surf2"
                    }`}
                  >
                    <div className="text-[0.54rem] font-[600] uppercase tracking-[0.07em] text-tx3">
                      {d.dayName}
                    </div>
                    <div className="text-[0.86rem] font-[600] text-tx mt-[1px]">
                      {d.dayNum}
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty state */}
              <div className="flex flex-col items-center justify-center py-[40px] px-[24px] text-center">
                <div className="w-[40px] h-[40px] rounded-[10px] bg-acc-bg flex items-center justify-center mb-[12px]">
                  <Calendar className="w-[18px] h-[18px] text-acc" strokeWidth={2} />
                </div>
                <div className="text-[0.86rem] font-[600] text-tx mb-[6px]">
                  No shifts scheduled
                </div>
                <div className="text-[0.75rem] text-tx2 max-w-[240px]">
                  Add team members and create shifts to see your schedule here.
                </div>
                <button className="mt-[16px] flex items-center gap-[5px] text-[0.76rem] font-[600] text-acc hover:opacity-75 transition-opacity bg-transparent border-none cursor-pointer">
                  Create first shift{" "}
                  <ArrowRight className="w-[12px] h-[12px]" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* On shift now */}
            <div className="bg-surf border border-brd rounded-[14px] overflow-hidden flex flex-col">
              <div className="p-[13px_17px] border-b border-brd">
                <div className="text-[0.84rem] font-[600] tracking-[-0.02em] text-tx">
                  On Shift Now
                </div>
                <div className="text-[0.68rem] text-tx2 mt-[1px]">
                  Live · All Locations
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center py-[32px] px-[20px] text-center">
                <div className="w-[36px] h-[36px] rounded-full bg-blu-bg flex items-center justify-center mb-[10px]">
                  <UserCheck className="w-[16px] h-[16px] text-blu" strokeWidth={2} />
                </div>
                <div className="text-[0.82rem] font-[600] text-tx mb-[5px]">
                  Nobody on shift
                </div>
                <div className="text-[0.7rem] text-tx2 max-w-[180px]">
                  Staff will appear here when their shift starts.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddLocationPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onSaved={onLocationAdded}
        orgId={orgId}
      />
    </div>
  );
}

// ─── empty state (user has no org) ──────────────────────────────────────────

export function EmptyOrgComponent({ user }: { user: any }) {
  const router = useRouter();

  return (
    <>
      <DashboardHeader user={user} />
      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full animate-up min-h-[calc(100svh-58px)] mt-[58px]">
        <div className="w-[80px] h-[80px] rounded-full bg-acc-bg text-acc flex items-center justify-center mb-[24px]">
          <Building2 className="w-[36px] h-[36px]" />
        </div>
        <h1 className="text-[1.8rem] font-[600] tracking-[-0.03em] text-tx mb-[12px] text-center max-w-[400px] leading-[1.2]">
          You haven&apos;t joined an organization
        </h1>
        <p className="text-[0.9rem] text-tx2 font-light mb-[32px] max-w-[480px] text-center leading-[1.6]">
          To jump into scheduling and workforce management, you need to set up
          your primary clinic or be invited to one.
        </p>
        <button
          type="button"
          onClick={() => router.push("/onboarding")}
          className="px-[24px] py-[13px] rounded-[10px] bg-acc text-[#07090E] text-[0.95rem] font-[600] tracking-[-0.01em] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_4px_14px_rgba(0,212,138,0.25)] flex justify-center items-center gap-[6px] border-none cursor-pointer"
        >
          Add your Organization{" "}
          <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.5} />
        </button>
      </main>
    </>
  );
}
