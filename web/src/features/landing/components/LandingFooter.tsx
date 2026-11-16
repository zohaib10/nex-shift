const LINKS = ["Product", "Pricing", "Docs", "Privacy", "Terms"];

export function LandingFooter() {
  return (
    <footer className="py-8 md:py-[30px] px-6 md:px-[52px] border-t border-brd flex flex-col md:flex-row items-center justify-between gap-6 md:gap-[14px] bg-bg transition-colors duration-300">
      <div className="font-geist font-[800] text-[1.3rem] tracking-[-0.04em] text-tx transition-colors duration-300">
        Nex<span className="text-acc">Shift</span>
      </div>
      <ul className="flex flex-wrap justify-center gap-4 md:gap-[22px] list-none">
        {LINKS.map((l) => (
          <li key={l}><a href="#" className="text-tx3 no-underline text-[0.79rem] transition-colors duration-[180ms] hover:text-tx2">{l}</a></li>
        ))}
      </ul>
      <div className="text-[0.76rem] text-tx3 transition-colors duration-300">© 2026 NexShift. All rights reserved.</div>
    </footer>
  );
}
