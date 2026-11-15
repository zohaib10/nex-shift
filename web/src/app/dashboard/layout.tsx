"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/PageLoader";
import { OrgProvider } from "@/context/OrgContext";
import { AppSidebar } from "@/features/Dashboard/components/AppSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const raw = localStorage.getItem("rosta_session");

    if (!raw) {
      router.replace("/");
      return;
    }

    const session = JSON.parse(raw);

    if (!session.id) {
      localStorage.removeItem("rosta_session");
      router.replace("/");
      return;
    }

    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <OrgProvider>
      <div className="flex h-[100svh] overflow-hidden bg-bg text-tx transition-colors duration-300">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {children}
        </main>
      </div>
    </OrgProvider>
  );
}
