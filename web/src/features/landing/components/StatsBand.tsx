const STATS = [
  { n: "98%", l: "Schedule accuracy" },
  { n: "3.2×", l: "Faster to build" },
  { n: "500+", l: "Facilities managed" },
  { n: "40k+", l: "Staff scheduled" },
];

export function StatsBand() {
  return (
    <div className="rev grid grid-cols-2 lg:grid-cols-4 border-y border-brd bg-surf transition-all duration-300 relative z-10">
      {STATS.map((stat) => (
        <div key={stat.l} className="py-6 md:py-[30px] px-2 text-center border-b border-r lg:border-b-0 border-brd [&:nth-child(2)]:border-r-0 [&:nth-child(4)]:border-r-0 lg:[&:nth-child(2)]:border-r lg:[&:nth-child(2)]:border-b-0 [&:nth-child(3)]:border-b-0 [&:nth-child(4)]:border-b-0">
          <div className="font-geist text-3xl md:text-[2.3rem] font-[800] tracking-[-0.04em] text-acc leading-[1.0]">{stat.n}</div>
          <div className="text-[0.75rem] md:text-[0.79rem] text-tx2 mt-2 md:mt-[5px] font-normal transition-colors duration-300">{stat.l}</div>
        </div>
      ))}
    </div>
  );
}
