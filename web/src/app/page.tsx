"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PublicHeader } from "@/components/PublicHeader";
import { hasSession } from "@/lib/session";
import { useRevealOnScroll } from "@/features/landing/hooks/useRevealOnScroll";
import { HeroSection } from "@/features/landing/components/HeroSection";
import { StatsBand } from "@/features/landing/components/StatsBand";
import { FeaturesSection } from "@/features/landing/components/FeaturesSection";
import { HowItWorksSection } from "@/features/landing/components/HowItWorksSection";
import { RolesSection } from "@/features/landing/components/RolesSection";
import { CtaSection } from "@/features/landing/components/CtaSection";
import { LandingFooter } from "@/features/landing/components/LandingFooter";

export default function Home() {
  const router = useRouter();
  const [ready, setReady] = React.useState(false);

  // Logged-in visitors go straight to their dashboard.
  React.useEffect(() => {
    hasSession().then((ok) => {
      if (ok) router.replace("/dashboard");
      else setReady(true);
    });
  }, [router]);

  useRevealOnScroll(ready);

  if (!ready) return null;

  return (
    <main>
      <PublicHeader variant="marketing" />
      <HeroSection />
      <StatsBand />
      <FeaturesSection />
      <HowItWorksSection />
      <RolesSection />
      <CtaSection />
      <LandingFooter />
    </main>
  );
}
