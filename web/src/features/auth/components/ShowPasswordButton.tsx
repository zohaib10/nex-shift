import { Eye, EyeOff } from "lucide-react";

export function ShowPasswordButton({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? "Hide password" : "Show password"}
      className="absolute right-[12px] top-1/2 -translate-y-1/2 text-tx3 hover:text-tx2 transition-colors duration-150 flex items-center justify-center p-1"
    >
      {shown ? <EyeOff className="w-[16px] h-[16px]" /> : <Eye className="w-[16px] h-[16px]" />}
    </button>
  );
}
