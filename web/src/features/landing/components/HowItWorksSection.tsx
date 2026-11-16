import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { WeeklySchedulePreview } from "./WeeklySchedulePreview";

const STEPS = [
  { n: "01", t: "Add your facilities", d: "Define each location — clinic, hospital wing, satellite office. Switch between them instantly." },
  { n: "02", t: "Define roles & staff types", d: "Create the roles your team needs — physicians, nurses, techs, front desk, and anything in between." },
  { n: "03", t: "Invite your team", d: "Invite people as staff, managers or admins and choose their locations. Everyone sees only what their role allows." },
  { n: "04", t: "Build & publish schedules", d: "Create schedules per role and facility. Publish — your team is notified the moment it goes live." },
];

export function HowItWorksSection() {
  return (
    <div className="rev bg-bg2 border-y border-brd transition-all duration-300">
      <div className="max-w-[1160px] mx-auto py-16 md:py-[88px] px-6 md:px-[52px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-[72px] items-center">
          <div>
            <Text variant="eyebrow">How It Works</Text>
            <Heading variant="section">Up and running<br />in minutes.</Heading>
            <Text variant="section">Four steps from sign-up to a live schedule your whole team can see.</Text>
            <div className="flex flex-col mt-8 md:mt-[36px]">
              {STEPS.map((step) => (
                <div key={step.n} className="flex gap-4 md:gap-[18px] py-5 md:py-[22px] border-b border-brd last:border-none transition-colors duration-300">
                  <div className="font-geist text-[0.68rem] font-bold text-tx3 w-[22px] shrink-0 pt-[3px] tracking-[0.05em] transition-colors duration-300">{step.n}</div>
                  <div>
                    <Heading variant="card" as="h4">{step.t}</Heading>
                    <Text variant="default">{step.d}</Text>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <WeeklySchedulePreview />
        </div>
      </div>
    </div>
  );
}
