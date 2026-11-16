"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

const CUSTOMERS = ["MedGroup", "CareAxis", "NovaClinics", "HealthBridge", "PulseHealth"];

export function HeroSection() {
  const router = useRouter();
  return (
    <section className="min-h-[100svh] flex flex-col items-center justify-center px-6 md:px-[52px] pt-28 md:pt-[100px] pb-16 md:pb-[64px] text-center relative overflow-hidden">
      <div className="absolute rounded-full blur-[120px] pointer-events-none w-[400px] h-[400px] md:w-[660px] md:h-[500px] bg-acc-bg top-[-60px] left-[-160px] animate-[var(--animate-od1)]" />
      <div className="absolute rounded-full blur-[120px] pointer-events-none w-[350px] h-[350px] md:w-[520px] md:h-[520px] bg-blu-bg bottom-[-40px] right-[-100px] animate-[var(--animate-od2)]" />

      <div className="inline-flex items-center gap-[7px] bg-acc-bg border border-acc-brd text-acc py-[5px] px-[14px] rounded-full text-[0.7rem] font-semibold tracking-[0.07em] uppercase mb-6 md:mb-[26px] animate-up relative z-10">
        <span className="w-[5px] h-[5px] rounded-full bg-acc animate-[var(--animate-blink)]" />
        Healthcare Workforce Platform
      </div>

      <Heading variant="hero" as="h1" className="relative z-10">
        Staff smarter.<br /><span className="grad">Schedule faster.</span>
      </Heading>

      <Text variant="hero" className="relative z-10">
        NexShift brings scheduling, workforce management, and staff coordination into one fluid platform — for clinics and hospital systems alike.
      </Text>

      <div className="mt-8 md:mt-[34px] flex flex-col sm:flex-row gap-4 sm:gap-[11px] items-center justify-center animate-up [animation-delay:210ms] relative z-10">
        <Button size="lg" className="w-full sm:w-auto" onClick={() => router.push("/signup")}>Start for free <ArrowRight className="w-[17px] h-[17px] ml-[2px]" /></Button>
        <Button variant="link"><Play className="w-[14px] h-[14px] fill-current mr-[1px]" /> Watch a demo</Button>
      </div>

      <div className="mt-12 md:mt-[54px] flex flex-col items-center gap-[13px] animate-up [animation-delay:280ms] relative z-10">
        <Text variant="small" className="transition-colors duration-300">Trusted by healthcare teams</Text>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 md:gap-[38px] items-center max-w-[400px] md:max-w-none">
          {CUSTOMERS.map((name) => (
            <span key={name} className="font-geist text-[0.8rem] font-semibold text-tx3 tracking-[0.03em] uppercase transition-colors duration-300">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
