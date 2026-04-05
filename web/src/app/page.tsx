"use client";

import * as React from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NexShiftLogo } from "@/components/NexShiftLogo";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Building2, 
  User, 
  Calendar, 
  Repeat, 
  Bell, 
  BarChart3, 
  ArrowRight, 
  Play, 
  Check 
} from "lucide-react";

import { PublicHeader } from "@/components/PublicHeader";
import { GuestGuard } from "@/components/GuestGuard";

export default function Home() {
  const router = useRouter();

  React.useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("in");
        });
      },
      { threshold: 0.07 }
    );
    document.querySelectorAll(".rev").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <GuestGuard>
      <main>
        <PublicHeader variant="marketing" />

      <section className="min-h-[100svh] flex flex-col items-center justify-center px-6 md:px-[52px] pt-28 md:pt-[100px] pb-16 md:pb-[64px] text-center relative overflow-hidden">
        <div className="absolute rounded-full blur-[120px] pointer-events-none w-[400px] h-[400px] md:w-[660px] md:h-[500px] bg-acc-bg top-[-60px] left-[-160px] animate-[var(--animate-od1)]" />
        <div className="absolute rounded-full blur-[120px] pointer-events-none w-[350px] h-[350px] md:w-[520px] md:h-[520px] bg-blu-bg bottom-[-40px] right-[-100px] animate-[var(--animate-od2)]" />
        
        <div className="inline-flex items-center gap-[7px] bg-acc-bg border border-acc-brd text-acc py-[5px] px-[14px] rounded-full text-[0.7rem] font-semibold tracking-[0.07em] uppercase mb-6 md:mb-[26px] animate-up relative z-10">
          <span className="w-[5px] h-[5px] rounded-full bg-acc animate-[var(--animate-blink)]" />
          Healthcare Workforce Platform
        </div>
        
        <Heading variant="hero" as="h1" className="relative z-10">
          Staff smarter.<br/><span className="grad">Schedule faster.</span>
        </Heading>
        
        <Text variant="hero" className="relative z-10">
          NexShift brings scheduling, workforce management, and staff coordination into one fluid platform — for clinics and hospital systems alike.
        </Text>
        
        <div className="mt-8 md:mt-[34px] flex flex-col sm:flex-row gap-4 sm:gap-[11px] items-center justify-center animate-up [animation-delay:210ms] relative z-10">
          <Button size="lg" className="w-full sm:w-auto" onClick={() => router.push('/signup')}>Start for free <ArrowRight className="w-[17px] h-[17px] ml-[2px]" /></Button>
          <Button variant="link"><Play className="w-[14px] h-[14px] fill-current mr-[1px]" /> Watch a demo</Button>
        </div>
        
        <div className="mt-12 md:mt-[54px] flex flex-col items-center gap-[13px] animate-up [animation-delay:280ms] relative z-10">
          <Text variant="small" className="transition-colors duration-300">Trusted by healthcare teams</Text>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 md:gap-[38px] items-center max-w-[400px] md:max-w-none">
            {["MedGroup", "CareAxis", "NovaClinics", "HealthBridge", "PulseHealth"].map((name) => (
              <span key={name} className="font-geist text-[0.8rem] font-semibold text-tx3 tracking-[0.03em] uppercase transition-colors duration-300">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="rev grid grid-cols-2 lg:grid-cols-4 border-y border-brd bg-surf transition-all duration-300 relative z-10">
        {[
          { n: "98%", l: "Schedule accuracy" },
          { n: "3.2×", l: "Faster to build" },
          { n: "500+", l: "Facilities managed" },
          { n: "40k+", l: "Staff scheduled" }
        ].map((stat, i) => (
          <div key={i} className="py-6 md:py-[30px] px-2 text-center border-b border-r lg:border-b-0 border-brd [&:nth-child(2)]:border-r-0 [&:nth-child(4)]:border-r-0 lg:[&:nth-child(2)]:border-r lg:[&:nth-child(2)]:border-b-0 [&:nth-child(3)]:border-b-0 [&:nth-child(4)]:border-b-0">
            <div className="font-geist text-3xl md:text-[2.3rem] font-[800] tracking-[-0.04em] text-acc leading-[1.0]">{stat.n}</div>
            <div className="text-[0.75rem] md:text-[0.79rem] text-tx2 mt-2 md:mt-[5px] font-normal transition-colors duration-300">{stat.l}</div>
          </div>
        ))}
      </div>

      <div className="rev max-w-[1160px] mx-auto py-16 md:py-[88px] px-6 md:px-[52px]">
        <Text variant="eyebrow">Core Features</Text>
        <Heading variant="section">Everything your team needs.<br/>Nothing they don't.</Heading>
        <Text variant="section">Built for clinical environments — from a single-location clinic to a multi-facility health system.</Text>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-brd border border-brd rounded-[15px] overflow-hidden mt-10 md:mt-[52px] transition-all duration-300">
          {[
            { icon: <Building2 className="w-[18px] h-[18px] text-acc" />, title: "Multi-Facility Management", desc: "Define facilities, switch contexts instantly, and manage staff across locations from one dashboard." },
            { icon: <User className="w-[18px] h-[18px] text-acc" />, title: "Roles & Staff Types", desc: "Create custom staff types — physicians, nurses, X-ray techs, front desk — with tailored permissions." },
            { icon: <Calendar className="w-[18px] h-[18px] text-acc" />, title: "Intelligent Scheduling", desc: "Build and publish schedules per role and facility. Automated conflict detection keeps things clean." },
            { icon: <Repeat className="w-[18px] h-[18px] text-acc" />, title: "Shift Swaps & Requests", desc: "Staff request swaps and time off — flowing through clean admin approval workflows." },
            { icon: <Bell className="w-[18px] h-[18px] text-acc" />, title: "Real-Time Notifications", desc: "Push, email, and in-app alerts keep everyone in sync the moment a schedule changes." },
            { icon: <BarChart3 className="w-[18px] h-[18px] text-acc" />, title: "Analytics & Insights", desc: "Utilization, fairness, coverage gaps — understand your workforce before issues surface." },
          ].map((feature, i) => (
            <div key={i} className="group bg-surf p-6 md:p-[34px_30px] relative overflow-hidden transition-colors duration-[220ms] hover:bg-surf2 cursor-default">
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-acc to-blu scale-x-0 origin-left transition-transform duration-[330ms] ease-out group-hover:scale-x-100" />
              <div className="w-[38px] h-[38px] rounded-[9px] bg-acc-bg flex items-center justify-center text-[1rem] mb-[16px] transition-colors duration-300">{feature.icon}</div>
              <Heading variant="card" as="h3">{feature.title}</Heading>
              <Text variant="default">{feature.desc}</Text>
            </div>
          ))}
        </div>
      </div>

      <div className="rev bg-bg2 border-y border-brd transition-all duration-300">
        <div className="max-w-[1160px] mx-auto py-16 md:py-[88px] px-6 md:px-[52px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-[72px] items-center">
            <div>
              <Text variant="eyebrow">How It Works</Text>
              <Heading variant="section">Up and running<br/>in minutes.</Heading>
              <Text variant="section">Four steps from sign-up to a live schedule your whole team can see.</Text>
              <div className="flex flex-col mt-8 md:mt-[36px]">
                {[
                  { n: "01", t: "Add your facilities", d: "Define each location — clinic, hospital wing, satellite office. Switch between them instantly." },
                  { n: "02", t: "Define roles & staff types", d: "Create the roles your team needs — physicians, nurses, techs, front desk, and anything in between." },
                  { n: "03", t: "Invite your team", d: "Add staff, assign their roles, and set facility access. Admins get full control; staff get their view." },
                  { n: "04", t: "Build & publish schedules", d: "Create schedules per role and facility. Publish — your team is notified the moment it goes live." },
                ].map((step, i) => (
                  <div key={i} className="flex gap-4 md:gap-[18px] py-5 md:py-[22px] border-b border-brd last:border-none transition-colors duration-300">
                    <div className="font-geist text-[0.68rem] font-bold text-tx3 w-[22px] shrink-0 pt-[3px] tracking-[0.05em] transition-colors duration-300">{step.n}</div>
                    <div>
                      <Heading variant="card" as="h4">{step.t}</Heading>
                      <Text variant="default">{step.d}</Text>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-mock border border-brd rounded-[14px] p-4 md:p-[26px] transition-all duration-300 w-full overflow-x-auto shadow-sm">
              <div className="min-w-[500px]">
                <div className="flex justify-between items-center mb-[18px]">
                  <div className="font-geist text-[0.83rem] font-[700] tracking-[-0.025em] text-tx transition-colors duration-300">Weekly Schedule — Main Clinic</div>
                  <div className="bg-acc-bg text-acc border border-acc-brd text-[0.6rem] font-semibold py-[3px] px-[9px] rounded-full tracking-[0.06em] uppercase">Live</div>
                </div>
                <div className="grid grid-cols-[84px_repeat(7,1fr)] gap-[3px] mb-[5px]">
                  <div />
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
                    <div key={i} className="text-center text-[0.58rem] font-semibold text-tx3 py-[4px] tracking-[0.04em] uppercase transition-colors duration-300">{d}</div>
                  ))}
                </div>
                <div className="flex flex-col gap-[4px]">
                  {[
                    { n: "Dr. Patel", s: ["am", "am", "off", "am", "pm", "off", "off"] },
                    { n: "RN Torres", s: ["pm", "pm", "am", "am", "off", "on", "off"] },
                    { n: "XR Tech", s: ["am", "off", "pm", "pm", "am", "off", "off"] },
                    { n: "Front Desk", s: ["am", "am", "am", "am", "am", "off", "off"] },
                    { n: "Dr. Okonkwo", s: ["off", "am", "am", "off", "pm", "on", "off"] },
                  ].map((row, i) => (
                    <div key={i} className="grid grid-cols-[84px_repeat(7,1fr)] gap-[3px] items-center">
                      <div className="text-[0.6rem] text-tx2 font-medium whitespace-nowrap overflow-hidden text-ellipsis pr-[4px] transition-colors duration-300">{row.n}</div>
                      {row.s.map((shift, j) => {
                        let mc = "h-[21px] rounded-[4px] flex items-center justify-center text-[0.5rem] font-bold tracking-[0.03em] ";
                        if (shift === "am") mc += "bg-[rgba(0,158,118,0.1)] text-[#009E76] dark:bg-[rgba(0,212,160,0.16)] dark:text-[#00D4A0]";
                        else if (shift === "pm") mc += "bg-[rgba(37,99,235,0.09)] text-[#2563EB] dark:bg-[rgba(59,130,246,0.16)] dark:text-[#7EB8FF]";
                        else if (shift === "on") mc += "bg-[rgba(217,119,6,0.09)] text-[#D97706] dark:bg-[rgba(251,191,36,0.14)] dark:text-[#FBBf24]";
                        else mc += "bg-[rgba(0,0,0,0.045)] text-tx3 dark:bg-[rgba(255,255,255,0.04)]";

                        return <div key={j} className={mc}>{shift.toUpperCase()}</div>;
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rev max-w-[1160px] mx-auto py-16 md:py-[88px] px-6 md:px-[52px]">
        <Text variant="eyebrow">Access Control</Text>
        <Heading variant="section">Two roles. Total clarity.</Heading>
        <Text variant="section">Admins configure and control. Staff view and act. Simple, secure, purpose-built for healthcare teams.</Text>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-[18px] mt-10 md:mt-[52px]">
          <div className="bg-surf border border-brd rounded-[15px] p-6 md:p-[34px] transition-all duration-[220ms] hover:border-brd2 hover:text-tx hover:-translate-y-[3px]">
            <span className="inline-block text-[0.64rem] font-bold tracking-[0.08em] uppercase py-[3px] px-[11px] rounded-[6px] mb-4 bg-blu-bg text-blu border border-[rgba(37,99,235,0.18)] dark:border-[rgba(59,130,246,0.22)]">Admin</span>
            <div className="font-geist text-[1.65rem] font-[800] tracking-[-0.045em] mb-[9px] text-tx transition-colors duration-300">Admins</div>
            <div className="text-[0.855rem] text-tx2 mb-[22px] font-light leading-[1.68] transition-colors duration-300">Full control over facilities, roles, staff, and schedules. Configure the platform to fit your workflow exactly.</div>
            <div className="flex flex-col gap-[8px]">
              {["Create & manage facilities", "Define custom staff roles & types", "Invite and manage all users", "Build, edit & publish schedules", "Approve shift swaps & requests", "View analytics & reports"].map((p, i) => (
                <div key={i} className="flex items-center gap-[9px] text-[0.81rem] text-tx2 font-normal transition-colors duration-300">
                  <div className="w-[16px] h-[16px] rounded-[4px] shrink-0 flex items-center justify-center bg-blu-bg text-blu border border-[rgba(37,99,235,0.18)] dark:border-[rgba(59,130,246,0.22)] transition-colors duration-300">
                    <Check className="w-[10px] h-[10px]" strokeWidth={3} />
                  </div>
                  {p}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surf border border-brd rounded-[15px] p-6 md:p-[34px] transition-all duration-[220ms] hover:border-brd2 hover:text-tx hover:-translate-y-[3px]">
            <span className="inline-block text-[0.64rem] font-bold tracking-[0.08em] uppercase py-[3px] px-[11px] rounded-[6px] mb-4 bg-acc-bg text-acc border border-acc-brd">Staff</span>
            <div className="font-geist text-[1.65rem] font-[800] tracking-[-0.045em] mb-[9px] text-tx transition-colors duration-300">Staff Members</div>
            <div className="text-[0.855rem] text-tx2 mb-[22px] font-light leading-[1.68] transition-colors duration-300">A clean, focused view of their schedule. Request changes, get notified, and stay in sync without the noise.</div>
            <div className="flex flex-col gap-[8px]">
              {["View personal schedule", "Request time off or shift swaps", "Receive real-time notifications", "View facility & team roster", "Submit availability preferences", "Access via web or mobile app"].map((p, i) => (
                <div key={i} className="flex items-center gap-[9px] text-[0.81rem] text-tx2 font-normal transition-colors duration-300">
                  <div className="w-[16px] h-[16px] rounded-[4px] shrink-0 flex items-center justify-center bg-acc-bg text-acc border border-acc-brd transition-colors duration-300">
                    <Check className="w-[10px] h-[10px]" strokeWidth={3} />
                  </div>
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rev py-16 md:py-[96px] px-6 md:px-[52px] text-center relative overflow-hidden bg-bg border-t border-brd transition-colors duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_50%_100%,var(--color-acc-bg),transparent)] pointer-events-none" />
        <Heading variant="cta" className="relative z-10">Your team deserves<br/>a better schedule.</Heading>
        <Text variant="cta" className="relative z-10">Join healthcare teams that run cleaner, faster, and with less chaos using NexShift.</Text>
        
        <div className="flex flex-col sm:flex-row max-w-[400px] mx-auto bg-surf border border-brd2 rounded-[10px] overflow-hidden transition-colors duration-300 relative z-10 font-plus text-[0.86rem] focus-within:border-tx3 p-1 sm:p-0">
          <input type="email" placeholder="Enter your work email" className="flex-1 bg-transparent border-none outline-none py-3 px-4 text-tx transition-colors duration-300 placeholder:text-tx3" />
          <Button onClick={() => router.push('/signup')} className="!rounded-[7px] sm:!rounded-l-none sm:!rounded-r-[9px] !h-[42px] sm:!h-auto !px-[18px]">Start free <ArrowRight className="w-[16px] h-[16px] ml-1" /></Button>
        </div>
        <p className="text-[0.73rem] text-tx3 mt-4 transition-colors duration-300 relative z-10">No credit card required · Free 30-day trial</p>
      </div>

      <footer className="py-8 md:py-[30px] px-6 md:px-[52px] border-t border-brd flex flex-col md:flex-row items-center justify-between gap-6 md:gap-[14px] bg-bg transition-colors duration-300">
        <div className="font-geist font-[800] text-[1.3rem] tracking-[-0.04em] text-tx transition-colors duration-300">
          Nex<span className="text-acc">Shift</span>
        </div>
        <ul className="flex flex-wrap justify-center gap-4 md:gap-[22px] list-none">
          {["Product", "Pricing", "Docs", "Privacy", "Terms"].map((l) => (
            <li key={l}><a href="#" className="text-tx3 no-underline text-[0.79rem] transition-colors duration-[180ms] hover:text-tx2">{l}</a></li>
          ))}
        </ul>
        <div className="text-[0.76rem] text-tx3 transition-colors duration-300">© 2026 NexShift. All rights reserved.</div>
      </footer>
    </main>
  </GuestGuard>
  );
}
