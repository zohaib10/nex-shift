"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-[38px] h-[38px] rounded-[9px] bg-transparent" />;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-[38px] h-[38px] rounded-[9px] bg-surf2 border border-brd cursor-pointer flex items-center justify-center text-[0.95rem] text-tx2 transition-all duration-300 hover:border-brd2 hover:text-tx"
    >
      {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
    </button>
  );
}
