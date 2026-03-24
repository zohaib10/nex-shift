import * as React from "react";

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  variant?: "hero" | "section" | "card" | "cta";
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className = "", as: Component = "h2", variant = "section", ...props }, ref) => {
    let styles = "font-geist text-tx transition-colors duration-300 tracking-[-0.04em]";
    
    if (variant === "hero") {
      styles += " font-[800] text-[clamp(3rem,6.5vw,5.8rem)] leading-[1.0] max-w-[900px] animate-up tracking-[-0.055em] [animation-delay:70ms]";
    } else if (variant === "section") {
      styles += " font-[800] text-[clamp(1.9rem,3.4vw,2.7rem)] leading-[1.08] tracking-[-0.045em]";
    } else if (variant === "cta") {
      styles += " font-[800] text-[clamp(2.3rem,4.4vw,3.7rem)] leading-[1.0] max-w-[660px] mx-auto mb-[18px] tracking-[-0.055em]";
    } else if (variant === "card") {
      styles += " font-[700] text-[0.97rem] mb-[7px] tracking-[-0.025em]";
    }

    return <Component ref={ref} className={`${styles} ${className}`} {...props} />;
  }
);
Heading.displayName = "Heading";
