import * as React from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

/** The bar across the top of every dashboard page: title, context, actions. */
export function Topbar({
  title,
  subtitle,
  children,
}: {
  title: string;
  /** Shown after a dot, e.g. the selected location or org. */
  subtitle?: string | null;
  /** Extra actions, shown left of the theme toggle. */
  children?: React.ReactNode;
}) {
  return (
    <div className="h-[50px] shrink-0 flex items-center justify-between px-[22px] bg-nav backdrop-blur-[18px] border-b border-brd">
      <div className="flex items-center gap-[7px] min-w-0">
        <span className="text-[0.92rem] font-[600] tracking-[-0.02em] text-tx">{title}</span>
        {subtitle && (
          <>
            <span className="text-tx3 text-[0.75rem]">·</span>
            <span className="text-[0.8rem] text-tx2 truncate">{subtitle}</span>
          </>
        )}
      </div>
      <div className="flex gap-[7px] items-center">
        <ThemeToggle />
        {children}
      </div>
    </div>
  );
}
