"use client";

import * as React from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { NexShiftLogo } from "@/components/NexShiftLogo";
import { ProfileTrigger } from "./ProfileTrigger";

export function DashboardHeader({ user }: { user: any }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 md:px-[40px] h-[58px] bg-nav backdrop-blur-[18px] saturate-[140%] border-b border-brd transition-all duration-300">
      <Link href="/dashboard" className="flex items-center no-underline shrink-0">
        <NexShiftLogo size="sm" />
      </Link>
      <div className="flex gap-[16px] items-center">
        <ThemeToggle />
        
        <div className="flex items-center gap-[12px] pl-[12px] border-l border-brd2">
          <ProfileTrigger user={user} />
        </div>
      </div>
    </nav>
  );
}
