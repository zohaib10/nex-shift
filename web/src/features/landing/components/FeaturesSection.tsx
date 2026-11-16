import { BarChart3, Bell, Building2, Calendar, Repeat, User } from "lucide-react";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

const FEATURES = [
  { icon: Building2, title: "Multi-Facility Management", desc: "Define facilities, switch contexts instantly, and manage staff across locations from one dashboard." },
  { icon: User, title: "Roles & Staff Types", desc: "Create custom staff types — physicians, nurses, X-ray techs, front desk — with tailored permissions." },
  { icon: Calendar, title: "Intelligent Scheduling", desc: "Build and publish schedules per role and facility. Automated conflict detection keeps things clean." },
  { icon: Repeat, title: "Shift Swaps & Requests", desc: "Staff request swaps and time off — flowing through clean admin approval workflows." },
  { icon: Bell, title: "Real-Time Notifications", desc: "Push, email, and in-app alerts keep everyone in sync the moment a schedule changes." },
  { icon: BarChart3, title: "Analytics & Insights", desc: "Utilization, fairness, coverage gaps — understand your workforce before issues surface." },
];

export function FeaturesSection() {
  return (
    <div className="rev max-w-[1160px] mx-auto py-16 md:py-[88px] px-6 md:px-[52px]">
      <Text variant="eyebrow">Core Features</Text>
      <Heading variant="section">Everything your team needs.<br />Nothing they don&apos;t.</Heading>
      <Text variant="section">Built for clinical environments — from a single-location clinic to a multi-facility health system.</Text>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-brd border border-brd rounded-[15px] overflow-hidden mt-10 md:mt-[52px] transition-all duration-300">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="group bg-surf p-6 md:p-[34px_30px] relative overflow-hidden transition-colors duration-[220ms] hover:bg-surf2 cursor-default">
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-acc to-blu scale-x-0 origin-left transition-transform duration-[330ms] ease-out group-hover:scale-x-100" />
            <div className="w-[38px] h-[38px] rounded-[9px] bg-acc-bg flex items-center justify-center text-[1rem] mb-[16px] transition-colors duration-300">
              <Icon className="w-[18px] h-[18px] text-acc" />
            </div>
            <Heading variant="card" as="h3">{title}</Heading>
            <Text variant="default">{desc}</Text>
          </div>
        ))}
      </div>
    </div>
  );
}
