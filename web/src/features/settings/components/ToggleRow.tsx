/** A labelled on/off switch. */
export function ToggleRow({
  label,
  hint,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-[12px] px-[17px] py-[12px] border-t border-brd first:border-none cursor-pointer">
      <span className="flex-1 min-w-0">
        <span className="block text-[0.84rem] font-[600] text-tx">{label}</span>
        <span className="block text-[0.72rem] text-tx3">{hint}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative w-[36px] h-[20px] rounded-full border-none cursor-pointer transition-colors shrink-0 disabled:opacity-60 ${checked ? "bg-acc" : "bg-brd2"}`}
      >
        <span
          className={`absolute top-[2px] left-[2px] w-[16px] h-[16px] rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[16px]" : ""}`}
        />
      </button>
    </label>
  );
}
