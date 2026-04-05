"use client";

import React from "react";
import Image from "next/image";

interface NexShiftLogoProps {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  className?: string;
}

/**
 * NexShift Logo Component
 * Renders the PNG icon mark + optional wordmark.
 * Uses the official NexShift logo asset from /public/nexshift-logo.png.
 */
export function NexShiftLogo({ size = "md", showWordmark = true, className = "" }: NexShiftLogoProps) {
  const iconSizes = { sm: 28, md: 34, lg: 42 };
  const textSizes = { sm: "text-[0.95rem]", md: "text-[1.15rem]", lg: "text-[1.4rem]" };
  const iconPx = iconSizes[size];

  return (
    <div className={`flex items-center gap-[8px] ${className}`}>
      <Image
        src="/nexshift-logo.png"
        alt="NexShift"
        width={iconPx}
        height={iconPx}
        className="rounded-[8px]"
        priority
      />

      {showWordmark && (
        <span className={`font-geist font-[700] tracking-[-0.03em] ${textSizes[size]} leading-none`}>
          <span className="text-tx transition-colors duration-300">Nex</span>
          <span className="text-acc transition-colors duration-300">Shift</span>
        </span>
      )}
    </div>
  );
}
