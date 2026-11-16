const OPTIONS = [
  { value: "member", title: "Location access only", hint: "Works at or manages the locations chosen below." },
  { value: "admin", title: "Admin", hint: "Manages every location, the team and settings." },
] as const;

/** Admin vs. location-only access. Only the owner can change it. */
export function OrgAccessPicker({
  value,
  onChange,
  disabled,
}: {
  value: "admin" | "member";
  onChange: (role: "admin" | "member") => void;
  disabled: boolean;
}) {
  return (
    <fieldset disabled={disabled}>
      <legend className="block text-[0.78rem] font-[500] text-tx2 mb-[6px]">Organization access</legend>
      <div className="border border-brd2 rounded-[10px] overflow-hidden">
        {OPTIONS.map((o, i) => (
          <label
            key={o.value}
            className={`flex items-start gap-[9px] px-[13px] py-[10px] ${disabled ? "opacity-70" : "cursor-pointer"} ${i > 0 ? "border-t border-brd" : ""} ${value === o.value ? "bg-acc-bg" : ""}`}
          >
            <input
              type="radio"
              name="org-role"
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="w-[14px] h-[14px] accent-acc shrink-0 mt-[2px]"
            />
            <span>
              <span className="block text-[0.84rem] font-[600] text-tx">{o.title}</span>
              <span className="block text-[0.72rem] text-tx3 leading-[1.45]">{o.hint}</span>
            </span>
          </label>
        ))}
      </div>
      {disabled && <p className="text-[0.7rem] text-tx3 mt-[5px]">Only the owner can make someone an admin.</p>}
    </fieldset>
  );
}
