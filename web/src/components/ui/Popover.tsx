"use client";

import * as React from "react";

/**
 * A trigger with a panel that opens below it. Closes on outside click or
 * Escape. Positioned in normal flow (absolute), so it scrolls with its parent.
 */
export function Popover({
  open,
  onOpenChange,
  trigger,
  children,
  align = "left",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOpenChange(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopPropagation(); onOpenChange(false); }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={ref} className="relative">
      {trigger}
      {open && (
        <div
          className={`absolute z-[60] mt-[6px] bg-surf border border-brd2 rounded-[12px] shadow-2xl ${align === "right" ? "right-0" : "left-0"}`}
          style={{ animation: "up 0.15s ease both" }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
