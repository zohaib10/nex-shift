import { Plus } from "lucide-react";

/** Common positions for this kind of organization, added with one click. */
export function SuggestedPositions({
  names,
  disabled,
  onAdd,
}: {
  names: string[];
  disabled: boolean;
  onAdd: (name: string) => void;
}) {
  if (names.length === 0) return null;
  return (
    <div>
      <div className="text-[0.7rem] text-tx3 mb-[6px]">Suggested</div>
      <div className="flex flex-wrap gap-[6px]">
        {names.map((n) => (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onAdd(n)}
            className="inline-flex items-center gap-[4px] text-[0.74rem] font-[500] text-tx2 px-[9px] py-[4px] rounded-[7px] border border-dashed border-brd2 bg-transparent hover:text-acc hover:border-acc transition-colors cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-[11px] h-[11px]" strokeWidth={2.5} />
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
