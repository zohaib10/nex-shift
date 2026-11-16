"use client";

import Link from "next/link";
import { GuestGuard } from "@/components/GuestGuard";
import { PublicHeader } from "@/components/PublicHeader";
import { SignupForm } from "@/features/auth/components/SignupForm";

export default function SignupPage() {
  return (
    <GuestGuard>
      <main className="min-h-[100svh] flex flex-col relative bg-bg text-tx transition-colors duration-300">
        <PublicHeader
          variant="auth"
          authAction={
            <div className="flex items-center gap-[10px] sm:gap-[16px]">
              <span className="text-tx2 text-[0.84rem] hidden sm:inline">Already have an account?</span>
              <Link href="/login" className="px-[16px] py-[6px] rounded-[10px] border border-brd2 bg-transparent text-tx text-[0.84rem] font-medium transition-colors duration-200 hover:bg-surf2 focus:outline-none flex items-center justify-center">
                Log in
              </Link>
            </div>
          }
        />

        <div className="flex-1 flex flex-col justify-start items-center p-6 md:p-[40px_24px_60px] pt-[84px] md:pt-[100px] relative z-10 w-full min-h-[100svh]">
          <div className="w-full max-w-[400px] my-auto relative z-20 animate-up">
            <SignupForm />
          </div>
        </div>
      </main>
    </GuestGuard>
  );
}
