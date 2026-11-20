import type * as React from "react";

export const inputClass =
  "w-full bg-bg border border-brd2 rounded-[10px] px-[12px] py-[8px] text-[0.86rem] text-tx outline-none focus:border-acc focus:ring-[3px] focus:ring-acc-brd";

/**
 * A label above a control. Use `as="div"` for custom pickers: a <label> would
 * forward clicks anywhere in it to the first button inside.
 */
export function FormField({
  label,
  hint,
  children,
  as: Tag = "label",
}: {
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
  as?: "label" | "div";
}) {
  return (
    <Tag className="block">
      <span className="block text-[0.78rem] font-[500] text-tx2 mb-[6px]">{label}</span>
      {children}
      {hint && <span className="block text-[0.7rem] text-tx3 mt-[5px]">{hint}</span>}
    </Tag>
  );
}
