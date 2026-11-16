"use client";

import Link from "next/link";
import { GuestGuard } from "@/components/GuestGuard";
import { PublicHeader } from "@/components/PublicHeader";
import { LoginShowcase } from "@/features/auth/components/LoginShowcase";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function Login() {
  return (
    <GuestGuard>
      <main className="min-h-[100svh] flex flex-col pt-[58px] relative bg-bg text-tx transition-colors duration-300">
        <PublicHeader
          variant="auth"
          authAction={
            <div className="flex items-center gap-[10px] sm:gap-[16px]">
              <span className="text-tx2 text-[0.84rem] hidden sm:inline">Don&apos;t have an account?</span>
              <Link href="/signup" className="h-[36px] px-[16px] flex items-center rounded-full bg-acc text-[#07090E] font-geist font-[600] text-[0.84rem] tracking-[-0.01em] transition-all duration-150 hover:scale-[1.03] hover:shadow-[0_2px_8px_rgba(0,212,138,0.2)]">
                Sign up free
              </Link>
            </div>
          }
        />

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
          <LoginShowcase />
          <div className="flex flex-col justify-center items-center py-12 px-6 sm:px-10 bg-bg transition-colors duration-300 relative z-20">
            <LoginForm />
          </div>
        </div>
      </main>
    </GuestGuard>
  );
}
