"use client";

import * as React from "react";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2 } from "lucide-react";

export function DashboardComponent() {
  return (
    <main className="flex-1 flex flex-col p-6 md:p-[40px] pt-[84px] md:pt-[100px] w-full max-w-[1200px] mx-auto animate-up">
      <Heading as="h1" variant="hero" className="!text-[2rem] !mb-[8px] text-left">Dashboard</Heading>
      <Text variant="default" className="!mb-[40px] !font-light max-w-none text-left">Welcome back to your scheduling center.</Text>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mock Dashboard Cards */}
        <div className="bg-surf border border-brd rounded-[14px] p-6 shadow-sm">
          <div className="text-[0.85rem] font-[600] text-tx mb-[8px]">Active Staff</div>
          <div className="text-[2rem] font-geist font-[600] text-acc">24</div>
        </div>
        <div className="bg-surf border border-brd rounded-[14px] p-6 shadow-sm">
          <div className="text-[0.85rem] font-[600] text-tx mb-[8px]">Open Shifts</div>
          <div className="text-[2rem] font-geist font-[600] text-tx">12</div>
        </div>
        <div className="bg-surf border border-brd rounded-[14px] p-6 shadow-sm">
          <div className="text-[0.85rem] font-[600] text-tx mb-[8px]">Notifications</div>
          <div className="text-[2rem] font-geist font-[600] text-tx">3</div>
        </div>
      </div>
    </main>
  );
}

export function EmptyOrgComponent() {
  const router = useRouter();

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 w-full animate-up min-h-[calc(100svh-100px)]">
      <div className="w-[80px] h-[80px] rounded-full bg-acc-bg text-acc flex items-center justify-center mb-[24px]">
        <Building2 className="w-[36px] h-[36px]" />
      </div>
      <Heading as="h1" variant="hero" className="!text-[1.8rem] !mb-[12px] text-center max-w-[400px]">You haven&apos;t joined an organization</Heading>
      <Text variant="default" className="!mb-[32px] !font-light max-w-[480px] text-center">
        To jump into scheduling and workforce management, you need to set up your primary clinic or be invited to one.
      </Text>

      <button
        type="button"
        onClick={() => router.push('/onboarding')}
        className="px-[24px] py-[13px] rounded-[10px] bg-acc text-[#07090E] text-[0.95rem] font-[600] tracking-[-0.01em] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_4px_14px_rgba(0,212,138,0.25)] flex justify-center items-center gap-[6px]"
      >
        Add your Organization <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.5} />
      </button>
    </main>
  );
}
