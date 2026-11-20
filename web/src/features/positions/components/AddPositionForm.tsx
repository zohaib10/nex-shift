"use client";

import * as React from "react";
import { Loader2, Plus } from "lucide-react";
import { apiErrorMessage } from "@/features/team/hooks/useTeam";
import { useCreatePosition, usePositionSuggestions } from "../hooks/usePositions";
import { SuggestedPositions } from "./SuggestedPositions";

/** Add a position by name, or one of the suggestions for the org's type. Colours are assigned. */
export function AddPositionForm({ orgId }: { orgId: string }) {
  const [name, setName] = React.useState("");
  const create = useCreatePosition(orgId);
  const { data: suggestions = [] } = usePositionSuggestions(orgId);

  function add(value: string) {
    if (!value.trim()) return;
    create.mutate({ name: value.trim() }, { onSuccess: () => setName("") });
  }

  return (
    <div className="px-[17px] py-[12px] border-t border-brd space-y-[10px]">
      <SuggestedPositions names={suggestions} disabled={create.isPending} onAdd={add} />
      <form onSubmit={(e) => { e.preventDefault(); add(name); }} className="flex gap-[8px]">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add another position"
          maxLength={40}
          aria-label="Position name"
          className="flex-1 min-w-0 bg-bg border border-brd2 rounded-[8px] px-[11px] py-[7px] text-[0.82rem] text-tx outline-none focus:border-acc focus:ring-[3px] focus:ring-acc-brd"
        />
        <button
          type="submit"
          disabled={create.isPending || !name.trim()}
          className="h-[34px] px-[12px] rounded-[8px] bg-acc text-[#07090E] text-[0.78rem] font-[600] flex items-center gap-[5px] hover:opacity-85 transition-opacity disabled:opacity-50 border-none cursor-pointer shrink-0"
        >
          {create.isPending ? <Loader2 className="w-[13px] h-[13px] animate-spin" /> : <Plus className="w-[13px] h-[13px]" strokeWidth={2.5} />}
          Add
        </button>
      </form>
      {create.error && <p className="text-[0.74rem] text-red-500">{apiErrorMessage(create.error, "Couldn't add the position.")}</p>}
    </div>
  );
}
