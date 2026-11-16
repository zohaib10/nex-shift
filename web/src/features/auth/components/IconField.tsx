import * as React from "react";

const inputBase =
  "w-full bg-bg border rounded-[10px] py-[11px] pl-[38px] text-[0.88rem] text-tx outline-none transition-all duration-200 focus:ring-[3px] focus:ring-acc-brd";

/** Input classes for an IconField, with room on the right for a trailing button if needed. */
export function iconInputClass(hasError: boolean, trailing = false): string {
  const state = hasError ? "border-red-500 bg-red-500/10 focus:border-red-500" : "border-brd2 focus:border-acc";
  return `${inputBase} ${state} ${trailing ? "pr-[40px]" : "pr-[13px]"}`;
}

/** Label, an input with a leading icon, and an error line underneath. */
export function IconField({
  label,
  labelAction,
  icon: Icon,
  error,
  trailing,
  children,
}: {
  label: string;
  /** Shown at the right of the label row, e.g. "Forgot password?". */
  labelAction?: React.ReactNode;
  icon: React.ElementType;
  error?: string;
  /** A button inside the right edge of the input, e.g. show/hide password. */
  trailing?: React.ReactNode;
  /** The <input>, styled with iconInputClass(). */
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-[6px]">
        <label className="text-[0.78rem] font-medium text-tx2 tracking-[0.01em] m-0">{label}</label>
        {labelAction}
      </div>
      <div className="relative">
        <Icon className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-tx3" />
        {children}
        {trailing}
      </div>
      {error && <div className="text-[0.72rem] text-red-500 mt-[5px]">{error}</div>}
    </div>
  );
}
