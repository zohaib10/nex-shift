import Link from "next/link";
import { EyeOff, X } from "lucide-react";

/** Shown right after hiding a dashboard card: undo, or where to bring it back. */
export function HiddenCardNotice({ label, onUndo, onDismiss }: { label: string; onUndo: () => void; onDismiss: () => void }) {
  return (
    <div className="flex items-center gap-[10px] px-[14px] py-[9px] mb-[14px] rounded-[10px] border border-brd bg-surf2 text-[0.76rem] text-tx2 animate-up">
      <EyeOff className="w-[13px] h-[13px] text-tx3 shrink-0" strokeWidth={2} />
      <span className="flex-1">
        {label} hidden. Bring it back any time in{" "}
        <Link href="/dashboard/settings" className="text-acc no-underline hover:underline">Settings</Link>.
      </span>
      <button type="button" onClick={onUndo} className="text-acc font-[600] bg-transparent border-none cursor-pointer hover:opacity-75">
        Undo
      </button>
      <button type="button" onClick={onDismiss} aria-label="Dismiss" className="text-tx3 bg-transparent border-none cursor-pointer hover:text-tx">
        <X className="w-[13px] h-[13px]" strokeWidth={2} />
      </button>
    </div>
  );
}
