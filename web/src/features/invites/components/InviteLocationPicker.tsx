export function InviteLocationPicker({
  locations,
  selectedIds,
  onToggle,
  error,
}: {
  locations: { id: string; name: string }[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-[0.78rem] font-[500] text-tx2 mb-[6px]">
        Locations <span className="text-red-500">*</span>
      </label>
      <div className="border border-brd2 rounded-[10px] overflow-hidden">
        {locations.map((loc, i) => {
          const checked = selectedIds.includes(loc.id);
          return (
            <label
              key={loc.id}
              className={`flex items-center gap-[9px] px-[13px] py-[10px] cursor-pointer transition-colors duration-150 ${i > 0 ? "border-t border-brd" : ""} ${checked ? "bg-acc-bg" : "hover:bg-surf2"}`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(loc.id)}
                className="w-[14px] h-[14px] accent-acc shrink-0 cursor-pointer"
              />
              <span className={`text-[0.84rem] flex-1 truncate ${checked ? "font-[600] text-tx" : "font-[500] text-tx2"}`}>
                {loc.name}
              </span>
            </label>
          );
        })}
        {locations.length === 0 && (
          <div className="px-[13px] py-[14px] text-[0.78rem] text-tx3 text-center">No locations yet.</div>
        )}
      </div>
      {error && <p className="text-[0.72rem] text-red-500 mt-[5px]">{error}</p>}
    </div>
  );
}
