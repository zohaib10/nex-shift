import { AlertTriangle } from "lucide-react";

/** A red message that slides open when `message` is set. */
export function ErrorBanner({ message }: { message: string | null }) {
  return (
    <div className={`overflow-hidden transition-all duration-300 ${message ? "max-h-[100px] mb-[16px] opacity-100" : "max-h-0 mb-0 opacity-0"}`}>
      <div className="flex items-center gap-[8px] p-[11px_14px] bg-red-500/10 border border-red-500/25 rounded-[10px] text-red-500 text-[0.82rem]">
        <AlertTriangle className="w-[16px] h-[16px] shrink-0" />
        <span>{message}</span>
      </div>
    </div>
  );
}
