"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NexShiftLogo } from "@/components/NexShiftLogo";

interface PublicHeaderProps {
  variant?: "marketing" | "auth";
  authAction?: React.ReactNode;
}

export function PublicHeader({ variant = "marketing", authAction }: PublicHeaderProps) {
  const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between px-6 md:px-[52px] h-[72px] bg-bg/80 backdrop-blur-[24px] saturate-[180%] border-b border-brd/50 transition-all duration-300">
      <Link href="/" className="flex items-center no-underline shrink-0 group">
        <div className="transition-transform duration-300 group-hover:scale-[1.02]">
          <NexShiftLogo size="md" />
        </div>
      </Link>
      
      {variant === "marketing" && (
        <ul className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-[2px] list-none bg-surf/60 backdrop-blur-md border border-brd2 rounded-full p-[4px] shadow-sm">
          <li><a href="#" className="block px-[18px] py-[6px] rounded-full text-tx2 no-underline text-[0.84rem] font-[500] tracking-[-0.01em] transition-all duration-200 hover:text-tx hover:bg-surf2">Features</a></li>
          <li><a href="#" className="block px-[18px] py-[6px] rounded-full text-tx2 no-underline text-[0.84rem] font-[500] tracking-[-0.01em] transition-all duration-200 hover:text-tx hover:bg-surf2">How It Works</a></li>
          <li><a href="#" className="block px-[18px] py-[6px] rounded-full text-tx2 no-underline text-[0.84rem] font-[500] tracking-[-0.01em] transition-all duration-200 hover:text-tx hover:bg-surf2">Pricing</a></li>
          <li><a href="#" className="block px-[18px] py-[6px] rounded-full text-tx2 no-underline text-[0.84rem] font-[500] tracking-[-0.01em] transition-all duration-200 hover:text-tx hover:bg-surf2">Docs</a></li>
        </ul>
      )}

      {/* Right Actions */}
      <div className="flex gap-[16px] sm:gap-[20px] items-center">
        <ThemeToggle />
        
        {variant === "marketing" && (
          <>
            <div className="h-[20px] w-[1px] bg-brd2 hidden sm:block" />
            <button 
              onClick={() => router.push('/login')}
              className="hidden sm:flex text-[0.86rem] font-[500] text-tx2 hover:text-tx transition-colors duration-200"
            >
              Log in
            </button>
            <button 
              onClick={() => router.push('/signup')}
              className="h-[38px] px-[20px] text-[0.86rem] font-[600] text-[#07090E] bg-acc rounded-full tracking-tight transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_4px_14px_rgba(0,212,138,0.25)] focus:scale-[0.98] focus:outline-none"
            >
              Get started
            </button>
          </>
        )}

        {variant === "auth" && authAction && (
          authAction
        )}
      </div>
    </nav>
  );
}
