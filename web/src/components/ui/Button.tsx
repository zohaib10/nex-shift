import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "link";
  size?: "default" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "default", ...props }, ref) => {
    let baseStyles = "inline-flex items-center justify-center rounded-[8px] font-plus font-medium transition-all duration-200 cursor-pointer tracking-tight";
    
    let variantStyles = "";
    if (variant === "primary") {
      variantStyles = "bg-acc text-white font-semibold hover:opacity-85 hover:-translate-y-[1px] dark:text-[#04120D]";
    } else if (variant === "ghost") {
      variantStyles = "bg-transparent border border-brd2 text-tx2 hover:text-tx hover:border-tx3";
    } else if (variant === "link") {
      variantStyles = "bg-transparent text-tx2 hover:text-tx !px-0 gap-[5px]";
    }

    let sizeStyles = "";
    if (size === "default" && variant !== "link") sizeStyles = "h-[37px] px-[18px] text-[0.84rem]";
    if (size === "lg" && variant !== "link") sizeStyles = "h-[46px] px-[26px] text-[0.93rem] rounded-[10px]";

    return (
      <button ref={ref} className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`} {...props} />
    );
  }
);
Button.displayName = "Button";
