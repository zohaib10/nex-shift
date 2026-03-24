import * as React from "react";

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: "default" | "hero" | "section" | "cta" | "eyebrow" | "small";
}

export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    let styles = "transition-colors duration-300";
    
    if (variant === "default") {
      styles += " text-tx2 text-[0.835rem] font-light leading-[1.66]";
    } else if (variant === "small") {
      styles += " text-tx3 text-[0.7rem] font-medium tracking-[0.09em] uppercase";
    } else if (variant === "hero") {
      styles += " text-tx2 text-[1.08rem] font-light max-w-[500px] leading-[1.74] mt-[20px] animate-up [animation-delay:140ms]";
    } else if (variant === "section") {
      styles += " text-tx2 text-[0.93rem] font-light max-w-[430px] mt-[11px] leading-[1.72]";
    } else if (variant === "cta") {
      styles += " text-tx2 text-[0.95rem] font-light max-w-[380px] mx-auto mb-[34px] leading-[1.7]";
    } else if (variant === "eyebrow") {
      styles += " text-acc text-[0.69rem] font-semibold tracking-[0.1em] uppercase mb-[13px]";
    }

    return <p ref={ref} className={`${styles} ${className}`} {...props} />;
  }
);
Text.displayName = "Text";
