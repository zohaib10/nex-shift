"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

function getInitials(fullName: string): string {
  if (!fullName) return "U";
  return fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export function ProfileTrigger({ user }: { user: any }) {
  const router = useRouter();
  const displayName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'User';
  const initials = getInitials(displayName);

  return (
    <button 
      onClick={() => router.push("/dashboard/profile")}
      className="flex w-full items-center gap-[10px] p-[5px_10px_5px_5px] rounded-[10px] border border-transparent bg-transparent outline-none cursor-pointer text-left transition-all duration-150 hover:bg-surf hover:border-brd2 focus-visible:border-acc"
    >
      <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-br from-[#00D48A] to-[#2F6FFF] flex items-center justify-center text-[0.65rem] font-[600] text-[#07090E] border-[1.5px] border-[#00D48A]/20 shadow-[0_2px_8px_rgba(0,212,138,0.2)] shrink-0">
        {initials}
      </div>
      <div className="flex flex-col overflow-hidden">
        <span className="text-[0.58rem] font-[600] text-tx3 tracking-[0.1em] uppercase leading-none">Profile</span>
        <span className="text-[0.8rem] font-[600] text-tx tracking-[-0.01em] leading-[1.3] truncate">{displayName}</span>
      </div>
      <ChevronDown className="w-[12px] h-[12px] text-tx2 ml-auto shrink-0" strokeWidth={2} />
    </button>
  );
}
