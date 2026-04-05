"use client";

import * as React from "react";
import { NexShiftLogo } from "./NexShiftLogo";

export function PageLoader() {
  return (
    <div className="min-h-[100svh] flex flex-col items-center justify-center bg-bg transition-colors duration-300">
      <div className="flex flex-col items-center gap-[20px]">
        <NexShiftLogo size="md" />
        <div className="flex items-center gap-[5px]">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-[5px] h-[5px] rounded-full bg-acc"
              style={{
                animation: "pageDot 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
