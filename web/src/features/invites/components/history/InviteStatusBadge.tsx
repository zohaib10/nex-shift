const STATUS_STYLE: Record<string, string> = {
  pending: "bg-[rgba(255,176,0,0.12)] text-[#FFB000]",
  accepted: "bg-acc-bg text-acc",
  declined: "bg-red-500/10 text-red-500",
  expired: "bg-surf2 text-tx3",
};

export function InviteStatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-[0.66rem] font-[600] uppercase tracking-[0.05em] px-[7px] py-[3px] rounded-[5px] ${STATUS_STYLE[status] ?? STATUS_STYLE.expired}`}>
      {status}
    </span>
  );
}
