import type * as React from "react";

/** An underlined tab bar, with optional actions on the right. */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  actions,
}: {
  tabs: { value: T; label: string }[];
  value: T;
  onChange: (tab: T) => void;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-[10px] border-b border-brd mb-[16px]">
      <div role="tablist" className="flex gap-[2px]">
        {tabs.map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={value === t.value}
            onClick={() => onChange(t.value)}
            className={`px-[12px] py-[8px] -mb-px text-[0.8rem] bg-transparent border-0 border-b-2 cursor-pointer transition-colors ${
              value === t.value ? "border-acc text-tx font-[600]" : "border-transparent text-tx2 font-[500] hover:text-tx"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {actions && <div className="pb-[6px]">{actions}</div>}
    </div>
  );
}
