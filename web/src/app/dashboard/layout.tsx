"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/PageLoader";
import { OrgProvider } from "@/context/OrgContext";
import { hasSession } from "@/lib/session";
import { AppSidebar } from "@/features/dashboard/components/sidebar/AppSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    hasSession().then((ok) => {
      if (ok) setIsLoading(false);
      else router.replace("/");
    });
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
