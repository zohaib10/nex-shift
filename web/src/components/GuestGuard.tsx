"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageLoader } from "./PageLoader";
import { hasSession } from "@/lib/session";

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    hasSession().then((ok) => {
      if (ok) router.replace("/dashboard");
      else setIsChecking(false);
    });
  }, [router]);

  if (isChecking) {
    return <PageLoader />;
  }

  return <>{children}</>;
}
