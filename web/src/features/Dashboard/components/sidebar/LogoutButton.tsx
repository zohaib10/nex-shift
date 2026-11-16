"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logout } from "@/lib/session";

export function LogoutButton() {
  const router = useRouter();
  return (
    <div className="p-[10px] border-t border-brd shrink-0">
      <button
        onClick={async () => { await logout(); router.push("/"); }}
        className="w-full flex items-center gap-[8px] p-[7px_9px] rounded-[8px] hover:bg-surf2 transition-colors duration-150 text-left"
      >
        <LogOut className="w-[14px] h-[14px] text-tx3 shrink-0" strokeWidth={2} />
        <span className="text-[0.77rem] font-[600] text-tx">Logout</span>
      </button>
    </div>
  );
}
