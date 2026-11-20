"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { TimePicker } from "@/components/ui/TimePicker";
import type { Position } from "@/features/positions/hooks/usePositions";
import { apiErrorMessage } from "@/features/team/hooks/useTeam";
import type { RosterMember } from "../hooks/useRoster";
import { useCancelShift, useCreateShift, useDeleteShift, useSetNoShow, useUpdateShift, type ShiftInput } from "../hooks/useShifts";
import { shiftState } from "../utils/state";
import { ShiftStateBadge } from "./ShiftStateBadge";
import { addDays, dateKeyIn, formatHours, hoursBetween, timeIn, zonedToUtc } from "../utils/time";
import type { ShiftPanelTarget } from "./ShiftPanel";
import { FormField, inputClass } from "./FormField";

const DEFAULT_START = "09:00";
const DEFAULT_END = "17:00";

const fullName = (m: { firstName: string; lastName: string }) => `${m.firstName} ${m.lastName}`.trim();

export function ShiftForm({
  target,
  onDone,
  orgId,
  locationId,
  tz,
  roster,
  positions,
}: {
  target: ShiftPanelTarget;
  onDone: () => void;
  orgId: string;
  locationId: string;
  tz: string;
  roster: RosterMember[];
  positions: Position[];
}) {
  const existing = target.kind === "edit" ? target.shift : null;
  const [day, setDay] = React.useState(existing ? dateKeyIn(existing.startsAt, tz) : target.kind === "new" ? target.day : "");
  const [start, setStart] = React.useState(existing ? timeIn(existing.startsAt, tz) : DEFAULT_START);
  const [end, setEnd] = React.useState(existing ? timeIn(existing.endsAt, tz) : DEFAULT_END);
  const [userId, setUserId] = React.useState<string | null>(existing ? existing.userId : target.kind === "new" ? target.userId : null);
  const [positionId, setPositionId] = React.useState<string | null>(
    existing?.positionId ?? defaultPosition(roster, target.kind === "new" ? target.userId : null)
  );
  const [notes, setNotes] = React.useState(existing?.notes ?? "");
  const [confirm, setConfirm] = React.useState<"delete" | "cancel" | null>(null);

  const create = useCreateShift(orgId);
  const update = useUpdateShift(orgId);
  const remove = useDeleteShift(orgId);
  const cancel = useCancelShift(orgId);
  const noShow = useSetNoShow(orgId);
  const pending = create.isPending || update.isPending || remove.isPending || cancel.isPending || noShow.isPending;
  const error = create.error ?? update.error ?? remove.error ?? cancel.error ?? noShow.error;

  // What the manager can do to an existing shift depends on where it is in its life.
  const now = new Date();
  const state = existing ? shiftState(existing, now) : null;
  const readOnly = state === "cancelled";
  const canCancel = existing?.status === "published" && new Date(existing.endsAt) > now;
  const canMarkNoShow = existing?.status === "published" && !!existing.userId && new Date(existing.startsAt) <= now;
  const canDelete = existing?.status === "draft" || state === "cancelled";

  // An end time at or before the start means the shift runs past midnight.
  const overnight = !!start && !!end && end <= start;
  const startsAt = day && start ? zonedToUtc(day, start, tz).toISOString() : null;
  const endsAt = day && end ? zonedToUtc(overnight ? addDays(day, 1) : day, end, tz).toISOString() : null;
  const hours = startsAt && endsAt ? hoursBetween(startsAt, endsAt) : 0;

  // With a position picked, only people set up for it can take the shift.
  const eligible = positionId ? roster.filter((m) => m.positions.some((p) => p.id === positionId)) : roster;
  const assignee = roster.find((m) => m.userId === userId);
  const assigneeUnqualified = !!assignee && !eligible.includes(assignee);

  function changePosition(id: string | null) {
    setPositionId(id);
    if (id && assignee && !assignee.positions.some((p) => p.id === id)) setUserId(null);
  }

  function changePerson(id: string | null) {
    setUserId(id);
    if (!positionId) setPositionId(defaultPosition(roster, id));
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!startsAt || !endsAt) return;
    const input: ShiftInput = { userId, positionId, startsAt, endsAt, notes: notes.trim() || null };
    if (existing) update.mutate({ shiftId: existing.id, ...input }, { onSuccess: onDone });
    else create.mutate({ locationId, ...input }, { onSuccess: onDone });
  }

  function handleDelete() {
    if (!existing) return;
    if (confirm !== "delete") { setConfirm("delete"); return; }
    remove.mutate({ shiftId: existing.id }, { onSuccess: onDone });
  }

  function handleCancel() {
    if (!existing) return;
    if (confirm !== "cancel") { setConfirm("cancel"); return; }
    cancel.mutate({ shiftId: existing.id }, { onSuccess: onDone });
  }

  return (
    <form onSubmit={save} className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto p-[18px] space-y-[16px]">
        {existing && state && (
          <div className="text-[0.74rem] text-tx2 bg-surf2 border border-brd rounded-[8px] p-[8px_11px] flex items-start gap-[8px]">
            <ShiftStateBadge state={state} />
            <span>
              {state === "draft"
                ? "Staff can't see it until you publish the week."
                : state === "cancelled"
                  ? "This shift was cancelled. The assignee sees it crossed out."
                  : state === "no_show"
                    ? "Marked as a no-show. It doesn't count toward hours worked."
                    : "Published: changes show on their schedule right away."}
            </span>
          </div>
        )}

        <fieldset disabled={readOnly} className="space-y-[16px] disabled:opacity-60">

        <FormField label="Date" as="div">
          <DatePicker value={day} onChange={setDay} today={dateKeyIn(now, tz)} disabled={readOnly} />
        </FormField>

        <div className="grid grid-cols-2 gap-[10px]">
          <FormField label="Start" as="div">
            <TimePicker value={start} onChange={setStart} disabled={readOnly} />
          </FormField>
          <FormField label="End" as="div">
            <TimePicker value={end} onChange={setEnd} hint={(t) => lengthFrom(start, t)} disabled={readOnly} />
          </FormField>
        </div>
        {hours > 0 && (
          <p className="text-[0.72rem] text-tx3 -mt-[8px]">
            {formatHours(hours)}{overnight ? " · ends the next day" : ""}
          </p>
        )}

        <FormField label="Position">
          <Select value={positionId ?? ""} onChange={(e) => changePosition(e.target.value || null)}>
            <option value="">No position</option>
            {positions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </FormField>

        <FormField
          label="Assigned to"
          hint={
            positionId && eligible.length === 0
              ? "No one is set up for this position yet. Assign positions on the Team page."
              : !userId
                ? "Left open, it shows in the Open shifts row."
                : undefined
          }
        >
          <Select value={assigneeUnqualified ? "" : (userId ?? "")} onChange={(e) => changePerson(e.target.value || null)}>
            <option value="">Open shift (nobody yet)</option>
            {eligible.map((m) => <option key={m.userId} value={m.userId}>{fullName(m) || "Unnamed"}</option>)}
          </Select>
        </FormField>

        <FormField label="Notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Optional, e.g. covering for Sam"
            className={`${inputClass} resize-none`}
          />
        </FormField>

        </fieldset>

        {error && <p className="text-[0.78rem] text-red-500">{apiErrorMessage(error, "Couldn't save the shift.")}</p>}

        {existing && (
          <div className="flex flex-col items-start gap-[10px]">
            {canMarkNoShow && (
              <button
                type="button"
                onClick={() => noShow.mutate({ shiftId: existing.id, noShow: !existing.noShowAt }, { onSuccess: onDone })}
                disabled={pending}
                className="text-[0.78rem] font-[500] underline underline-offset-2 bg-transparent border-none cursor-pointer text-tx2 hover:text-tx"
              >
                {existing.noShowAt ? "Undo no-show" : "Mark as no-show"}
              </button>
            )}
            {canCancel && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={pending}
                className={`text-[0.78rem] font-[500] underline underline-offset-2 bg-transparent border-none cursor-pointer ${confirm === "cancel" ? "text-red-500" : "text-tx2 hover:text-red-500"}`}
              >
                {cancel.isPending ? "Cancelling…" : confirm === "cancel" ? "Click again to cancel this shift" : "Cancel shift"}
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
                className={`text-[0.78rem] font-[500] underline underline-offset-2 bg-transparent border-none cursor-pointer ${confirm === "delete" ? "text-red-500" : "text-tx2 hover:text-red-500"}`}
              >
                {remove.isPending ? "Deleting…" : confirm === "delete" ? "Click again to delete this shift" : "Delete shift"}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="p-[14px_18px] border-t border-brd shrink-0">
        <button
          type="submit"
          disabled={pending || readOnly || !startsAt || !endsAt}
          className="w-full h-[42px] rounded-[10px] bg-acc text-[#07090E] text-[0.88rem] font-[600] flex items-center justify-center gap-[6px] hover:opacity-85 transition-opacity disabled:opacity-60 cursor-pointer border-none"
        >
          {create.isPending || update.isPending ? <Loader2 className="w-[15px] h-[15px] animate-spin" strokeWidth={2} /> : existing ? "Save changes" : "Add shift"}
        </button>
      </div>
    </form>
  );
}

/** "8h" / "7.5h" from a start to an end time; an end at or before the start is the next day. */
function lengthFrom(start: string, end: string): string | null {
  if (!start) return null;
  const mins = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
  let diff = mins(end) - mins(start);
  if (diff <= 0) diff += 24 * 60;
  return formatHours(diff / 60);
}

/** Someone with exactly one position gets it picked for them. */
function defaultPosition(roster: RosterMember[], userId: string | null): string | null {
  const positions = roster.find((m) => m.userId === userId)?.positions ?? [];
  return positions.length === 1 ? positions[0].id : null;
}
