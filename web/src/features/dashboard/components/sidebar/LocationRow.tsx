export function LocationRow({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-[7px] px-[9px] py-[6px] rounded-[7px] cursor-pointer transition-colors duration-150 ${active ? "bg-acc-bg" : "hover:bg-surf2"}`}
    >
      <div className={`w-[5px] h-[5px] rounded-full shrink-0 transition-colors duration-150 ${active ? "bg-acc" : "bg-brd2"}`} />
      <span className={`text-[0.78rem] flex-1 truncate transition-colors duration-150 ${active ? "font-[600] text-tx" : "font-[500] text-tx2"}`}>
        {label}
      </span>
      <span className="text-[0.62rem] shrink-0 text-tx3">{count}</span>
    </div>
  );
}
