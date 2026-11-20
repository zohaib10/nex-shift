import * as React from "react";

/** The field-looking button that opens a picker. */
export function PickerButton({
  icon: Icon,
  label,
  open,
  onClick,
  disabled,
}: {
  icon: React.ElementType;
  label: string;
  open: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-haspopup="dialog"
      aria-expanded={open}
      className={`w-full flex items-center gap-[8px] bg-bg border rounded-[10px] px-[12px] py-[8px] text-[0.86rem] text-tx text-left cursor-pointer outline-none transition-colors disabled:opacity-60 disabled:cursor-default ${
        open ? "border-acc ring-[3px] ring-acc-brd" : "border-brd2 hover:border-tx3 focus-visible:border-acc focus-visible:ring-[3px] focus-visible:ring-acc-brd"
      }`}
    >
      <Icon className="w-[14px] h-[14px] text-tx3 shrink-0" strokeWidth={2} />
      <span className="truncate tabular-nums">{label}</span>
    </button>
  );
}
