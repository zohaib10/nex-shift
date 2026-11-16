"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export function CtaSection() {
  const router = useRouter();
  return (
    <div className="rev py-16 md:py-[96px] px-6 md:px-[52px] text-center relative overflow-hidden bg-bg border-t border-brd transition-colors duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_50%_100%,var(--color-acc-bg),transparent)] pointer-events-none" />
      <Heading variant="cta" className="relative z-10">Your team deserves<br />a better schedule.</Heading>
      <Text variant="cta" className="relative z-10">Join healthcare teams that run cleaner, faster, and with less chaos using NexShift.</Text>

      <div className="flex flex-col sm:flex-row max-w-[400px] mx-auto bg-surf border border-brd2 rounded-[10px] overflow-hidden transition-colors duration-300 relative z-10 font-plus text-[0.86rem] focus-within:border-tx3 p-1 sm:p-0">
        <input type="email" placeholder="Enter your work email" className="flex-1 bg-transparent border-none outline-none py-3 px-4 text-tx transition-colors duration-300 placeholder:text-tx3" />
        <Button onClick={() => router.push("/signup")} className="!rounded-[7px] sm:!rounded-l-none sm:!rounded-r-[9px] !h-[42px] sm:!h-auto !px-[18px]">Start free <ArrowRight className="w-[16px] h-[16px] ml-1" /></Button>
      </div>
      <p className="text-[0.73rem] text-tx3 mt-4 transition-colors duration-300 relative z-10">No credit card required · Free 30-day trial</p>
    </div>
  );
}
