"use client";

import * as React from "react";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

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
