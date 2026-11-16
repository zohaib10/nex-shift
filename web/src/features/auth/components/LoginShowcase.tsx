import { MiniSchedulePreview } from "./MiniSchedulePreview";

/** The left half of the login page on large screens. */
export function LoginShowcase() {
  return (
    <div className="hidden lg:flex flex-col justify-center px-[56px] py-[64px] bg-bg2 relative overflow-hidden border-r border-brd transition-colors duration-300 z-10">
      <div className="absolute rounded-full blur-[120px] pointer-events-none w-[500px] h-[500px] bg-acc-bg top-[-80px] left-[-80px] animate-[var(--animate-od1)]" />
      <div className="absolute rounded-full blur-[120px] pointer-events-none w-[400px] h-[400px] bg-blu-bg bottom-[-60px] right-[-60px] animate-[var(--animate-od2)]" />

      <div className="relative z-20 max-w-[480px]">
        <div className="text-[0.68rem] font-[600] tracking-[0.1em] uppercase text-acc mb-[18px]">Welcome back</div>
        <h2 className="font-geist text-[2.6rem] font-[600] tracking-[-0.04em] leading-[1.1] text-tx mb-[16px]">
          Your team is<br /><span className="text-acc">on the clock.</span>
        </h2>
        <p className="text-[0.9rem] text-tx2 font-light max-w-[380px] leading-[1.7] mb-[40px] transition-colors duration-300">
          Log in to view schedules, manage your facilities, and keep your staff coordinated — all in one place.
        </p>

        <MiniSchedulePreview />

        <div className="mt-7 p-4 md:p-[16px_18px] bg-acc-bg border border-acc-brd rounded-[10px] transition-colors duration-300">
          <div className="text-[0.82rem] text-tx italic leading-[1.6] mb-[8px] transition-colors duration-300">&quot;NexShift cut our scheduling time in half. Our team always knows exactly where to be.&quot;</div>
          <div className="text-[0.72rem] text-tx2 font-medium transition-colors duration-300">— Dr. Okonkwo, ER Lead · CityMed</div>
        </div>
      </div>
    </div>
  );
}
