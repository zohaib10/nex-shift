import * as React from "react";

/** A one-line note in the invite panel, such as which location an invite is for. */
export function InviteNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-[7px] py-[8px] px-[12px] bg-surf2 border border-brd rounded-[8px]">
      <div className="w-[6px] h-[6px] rounded-full bg-acc shrink-0" />
      <span className="text-[0.75rem] text-tx2">{children}</span>
    </div>
  );
}
