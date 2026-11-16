import * as React from "react";

/** Adds the "in" class to every `.rev` element as it scrolls into view. */
export function useRevealOnScroll(enabled: boolean) {
  React.useEffect(() => {
    if (!enabled) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("in");
        });
      },
      { threshold: 0.07 }
    );
    document.querySelectorAll(".rev").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [enabled]);
}
