import * as React from "react";
import { ChevronDown } from "lucide-react";

/** Native select with our own arrow (the browser's sits too close to the edge). Full width. */
export function Select({ className = "", children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`w-full appearance-none bg-bg border border-brd2 rounded-[10px] text-[0.86rem] text-tx pl-[12px] pr-[32px] py-[9px] cursor-pointer outline-none focus:border-acc focus:ring-[3px] focus:ring-acc-brd disabled:opacity-60 ${className}`}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-[11px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-tx3"
        strokeWidth={2}
      />
    </div>
  );
}
