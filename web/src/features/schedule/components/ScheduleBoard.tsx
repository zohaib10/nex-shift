"use client";

import * as React from "react";
import { Loader2, Send } from "lucide-react";
import type { OrgLocation } from "@/context/OrgContext";
import { usePositions } from "@/features/positions/hooks/usePositions";
import { PositionChip } from "@/features/positions/components/PositionChip";
import { apiErrorMessage } from "@/features/team/hooks/useTeam";
import { useRoster, type RosterMember } from "../hooks/useRoster";
import { usePublishShifts, useShifts, type Shift } from "../hooks/useShifts";
import { OPEN_ROW, groupByCell, totalHours } from "../utils/group";
import { addDays, dateKeyIn, formatHours, locationTimeZone, startOfWeek, weekDays, weekLabel, weekRange, type DateKey } from "../utils/time";
import { PeriodNav } from "./PeriodNav";
import { ScheduleGrid } from "./ScheduleGrid";
import type { ScheduleRowData } from "./ScheduleRow";
import { ShiftPanel, type ShiftPanelTarget } from "./ShiftPanel";

/** A manager's week at one location: add, edit and publish shifts. */
export function ScheduleBoard({ orgId, location }: { orgId: string; location: OrgLocation }) {
  const tz = locationTimeZone(location);
  const today = dateKeyIn(new Date(), tz);
  const [monday, setMonday] = React.useState<DateKey>(() => startOfWeek(today));
  const [target, setTarget] = React.useState<ShiftPanelTarget | null>(null);
  const seq = React.useRef(0);

  const range = weekRange(monday, tz);
  const { data: shifts = [], isLoading, error } = useShifts(orgId, range, location.id);
  const { data: roster = [] } = useRoster(orgId, location.id);
  const { data: positions = [] } = usePositions(orgId);
  const publish = usePublishShifts(orgId);

  const days = weekDays(monday, today);
  const cells = groupByCell(shifts, tz);
  const drafts = shifts.filter((s) => s.status === "draft").length;
  const rows = buildRows(roster, shifts);

  function openNew(rowId: string, day: DateKey) {
    seq.current += 1;
    setTarget({ kind: "new", day, userId: rowId === OPEN_ROW ? null : rowId, seq: seq.current });
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-[10px] mb-[14px]">
        <PeriodNav
          label={weekLabel(monday)}
          onPrev={() => setMonday(addDays(monday, -7))}
          onNext={() => setMonday(addDays(monday, 7))}
          onToday={() => setMonday(startOfWeek(today))}
        />
        <div className="flex items-center gap-[10px]">
          {publish.isSuccess && drafts === 0 && <span className="text-[0.74rem] text-acc">Published</span>}
          {publish.error && <span className="text-[0.74rem] text-red-500">{apiErrorMessage(publish.error, "Couldn't publish.")}</span>}
          <button
            type="button"
            disabled={drafts === 0 || publish.isPending}
            onClick={() => publish.mutate({ locationId: location.id, ...range })}
            className="h-[32px] px-[13px] rounded-[8px] bg-acc text-[#07090E] text-[0.78rem] font-[600] flex items-center gap-[6px] hover:opacity-85 transition-opacity disabled:opacity-50 border-none cursor-pointer"
          >
            {publish.isPending ? <Loader2 className="w-[13px] h-[13px] animate-spin" /> : <Send className="w-[13px] h-[13px]" strokeWidth={2.2} />}
            {drafts > 0 ? `Publish ${drafts} draft${drafts === 1 ? "" : "s"}` : "All published"}
          </button>
        </div>
      </div>

      {error && <p className="text-[0.8rem] text-red-500 mb-[10px]">{apiErrorMessage(error, "Couldn't load shifts.")}</p>}
      {isLoading ? (
        <div className="flex justify-center py-[48px]"><Loader2 className="w-[18px] h-[18px] animate-spin text-acc" /></div>
      ) : (
        <ScheduleGrid
          days={days}
          rows={rows}
          cells={cells}
          tz={tz}
          onAdd={openNew}
          onEdit={(shift) => setTarget({ kind: "edit", shift })}
        />
      )}
      {roster.filter((m) => m.role !== "admin").length === 0 && !isLoading && (
        <p className="text-[0.74rem] text-tx3 mt-[10px]">
          No one works at {location.name} yet. Invite staff from the dashboard, or add open shifts for now.
        </p>
      )}
      <p className="text-[0.7rem] text-tx3 mt-[10px]">
        Times are in {tz.replace(/_/g, " ")}. Dashed shifts are drafts that staff can&apos;t see until you publish.
      </p>

      <ShiftPanel
        target={target}
        onClose={() => setTarget(null)}
        orgId={orgId}
        locationId={location.id}
        tz={tz}
        roster={roster}
        positions={positions}
      />
    </>
  );
}

/**
 * Open shifts first, then everyone who works here. Admins work everywhere, so
 * they only get a row in weeks they have shifts here. People with shifts who
 * have since left still get a row so those shifts stay visible.
 */
function buildRows(roster: RosterMember[], shifts: Shift[]): ScheduleRowData[] {
  const withShifts = new Set(shifts.map((s) => s.userId).filter(Boolean));
  const shown = roster.filter((m) => m.role !== "admin" || withShifts.has(m.userId));
  const hoursFor = (id: string | null) => {
    const h = totalHours(shifts.filter((s) => s.userId === id));
    return h > 0 ? formatHours(h) : null;
  };

  const rows: ScheduleRowData[] = [
    {
      id: OPEN_ROW,
      label: "Open shifts",
      detail: <span className="text-[0.64rem] text-tx3">Not assigned yet</span>,
      hours: hoursFor(null),
    },
    ...shown.map((m) => ({
      id: m.userId,
      label: `${m.firstName} ${m.lastName}`.trim() || "Unnamed",
      detail: m.positions.length
        ? m.positions.map((p) => <PositionChip key={p.id} position={p} className="!text-[0.6rem] !px-[5px]" />)
        : <span className="text-[0.64rem] text-tx3 capitalize">{m.role}</span>,
      hours: hoursFor(m.userId),
    })),
  ];

  const known = new Set(shown.map((m) => m.userId));
  for (const s of shifts) {
    if (s.user && !known.has(s.user.id)) {
      known.add(s.user.id);
      rows.push({
        id: s.user.id,
        label: `${s.user.firstName} ${s.user.lastName}`.trim(),
        detail: <span className="text-[0.64rem] text-tx3">No longer here</span>,
        hours: hoursFor(s.user.id),
      });
    }
  }
  return rows;
}
