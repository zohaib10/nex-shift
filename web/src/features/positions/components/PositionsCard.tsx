"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { apiErrorMessage } from "@/features/team/hooks/useTeam";
import { useDeletePosition, usePositions } from "../hooks/usePositions";
import { PositionRow } from "./PositionRow";
import { AddPositionForm } from "./AddPositionForm";

/** The organization's positions (RN, CNA…). Admins add and delete them here. */
export function PositionsCard({ orgId }: { orgId: string }) {
  const { data: positions, isLoading, error } = usePositions(orgId);
  const remove = useDeletePosition(orgId);
  const [confirmId, setConfirmId] = React.useState<string | null>(null);

  function handleDelete(id: string) {
    if (confirmId !== id) { setConfirmId(id); return; }
    remove.mutate({ positionId: id }, { onSuccess: () => setConfirmId(null) });
  }

  return (
    <div className="bg-surf border border-brd rounded-[14px] overflow-hidden animate-up">
      <div className="p-[13px_17px] border-b border-brd">
        <div className="text-[0.84rem] font-[600] tracking-[-0.02em] text-tx">Positions</div>
        <div className="text-[0.68rem] text-tx2 mt-[1px]">The jobs people are scheduled as. Each gets its own colour on the schedule. Give people positions with Edit.</div>
      </div>

      {isLoading && <div className="flex justify-center py-[20px]"><Loader2 className="w-[16px] h-[16px] animate-spin text-acc" /></div>}
      {error && <div className="px-[17px] py-[14px] text-[0.8rem] text-red-500">{apiErrorMessage(error, "Couldn't load positions.")}</div>}
      {positions?.length === 0 && <div className="px-[17px] py-[14px] text-[0.78rem] text-tx3">No positions yet.</div>}
      {positions?.map((p) => (
        <PositionRow key={p.id} position={p} confirming={confirmId === p.id} onDelete={() => handleDelete(p.id)} />
      ))}
      {remove.error && <p className="px-[17px] pb-[10px] text-[0.74rem] text-red-500">{apiErrorMessage(remove.error, "Couldn't delete it.")}</p>}

      <AddPositionForm orgId={orgId} />
    </div>
  );
}
