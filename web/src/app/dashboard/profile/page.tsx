"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();

  const handleLogout = () => {
    // We are natively using local storage simulation for now until frontend supabase is wired
    localStorage.removeItem("rosta_session");
    router.push("/");
  };

  return (
    <div className="grid grid-cols-[220px_1fr] min-h-[calc(100svh-58px)] pt-[58px]">
      <aside className="border-r border-brd p-[24px_12px]">
        <button 
          className="flex items-center gap-[10px] w-full p-[9px_14px] rounded-[8px] border-none bg-transparent font-inherit text-[0.85rem] font-medium text-red-500 cursor-pointer transition-colors duration-150 hover:bg-red-500/10"
          onClick={handleLogout}
        >
          <LogOut className="w-[16px] h-[16px]" strokeWidth={2} />
          Log out
        </button>
      </aside>
      <main className="p-[40px] animate-up">
        {/* Right side is intentionally empty for future content per user specs */}
      </main>
    </div>
  );
}
