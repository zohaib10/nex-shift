"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageLoader } from "./PageLoader";

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem("rosta_session");
    if (session) {
      router.replace("/dashboard");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) {
    return <PageLoader />;
  }

  return <>{children}</>;
}
