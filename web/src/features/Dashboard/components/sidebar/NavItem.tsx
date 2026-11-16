import * as React from "react";

export function NavItem({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ElementType;
  active: boolean;
  /** Omitted for pages that don't exist yet. */
  onClick?: () => void;
}) {
  return (
    <div
      role={onClick ? "link" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter") onClick(); } : undefined}
      className={`flex items-center gap-[8px] p-[7px_9px] rounded-[8px] cursor-pointer transition-colors duration-150 mb-[1px] ${
        active ? "bg-acc-bg" : "hover:bg-surf2"
      }`}
    >
      <Icon className={`w-[15px] h-[15px] shrink-0 ${active ? "text-acc" : "text-tx3"}`} strokeWidth={2} />
      <span className={`text-[0.81rem] flex-1 ${active ? "font-[600] text-tx" : "font-[500] text-tx2"}`}>
        {label}
      </span>
    </div>
  );
}
