"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DashboardHeader } from "@/features/Dashboard/components/Header";
import { PageLoader } from "@/components/PageLoader";
import api from "@/lib/api";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const raw = localStorage.getItem("rosta_session");

    if (!raw) {
      router.replace("/");
      return;
    }

    const session = JSON.parse(raw);

    if (!session.id) {
      // Stale session without an id — clear it and send to login
      localStorage.removeItem("rosta_session");
      router.replace("/");
      return;
    }

    // Profile page is always accessible — it's where logout lives
    if (pathname === "/dashboard/profile") {
      setUser(session);
      setIsLoading(false);
      return;
    }

    // Assign the user immediately and stop loading without blocking access
    setUser(session);
    setIsLoading(false);
  }, [router, pathname]);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-[100svh] bg-bg text-tx flex flex-col relative transition-colors duration-300">
      <DashboardHeader user={user} />
      {children}
    </div>
  );
}
