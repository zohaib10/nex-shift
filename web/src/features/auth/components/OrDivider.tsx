export function OrDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-[12px] my-[20px]">
      <div className="flex-1 h-[1px] bg-brd" />
      <div className="text-[0.72rem] text-tx3">{label}</div>
      <div className="flex-1 h-[1px] bg-brd" />
    </div>
  );
}
