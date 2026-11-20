"use client";

import { SlidePanel } from "@/components/ui/SlidePanel";
import type { Position } from "@/features/positions/hooks/usePositions";
import type { RosterMember } from "../hooks/useRoster";
import type { Shift } from "../hooks/useShifts";
import type { DateKey } from "../utils/time";
import { ShiftForm } from "./ShiftForm";

/** What the panel is open for: a new shift on a day (maybe for someone), or an existing one. */
export type ShiftPanelTarget =
  | { kind: "new"; day: DateKey; userId: string | null; seq: number }
  | { kind: "edit"; shift: Shift };

export function ShiftPanel({
  target,
  onClose,
  orgId,
  locationId,
  tz,
  roster,
  positions,
}: {
  target: ShiftPanelTarget | null;
  onClose: () => void;
  orgId: string;
  locationId: string;
  tz: string;
  roster: RosterMember[];
  positions: Position[];
}) {
  // A new key per opening, so the form starts from the target's values.
  const formKey = target ? (target.kind === "edit" ? target.shift.id : `new-${target.seq}`) : "closed";
  return (
    <SlidePanel open={!!target} onClose={onClose} title={target?.kind === "edit" ? "Edit shift" : "Add shift"}>
      {target && (
        <ShiftForm
          key={formKey}
          target={target}
          onDone={onClose}
          orgId={orgId}
          locationId={locationId}
          tz={tz}
          roster={roster}
          positions={positions}
        />
      )}
    </SlidePanel>
  );
}
