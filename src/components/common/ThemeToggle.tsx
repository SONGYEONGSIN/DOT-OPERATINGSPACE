"use client";

import { useEffect } from "react";
import { useThemeStore, applyTheme } from "@/lib/theme";
import { cn } from "@/lib/cn";

export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useThemeStore();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <button
      onClick={toggle}
      className={cn(
        "p-2 text-on-surface-variant hover:bg-surface-bright hover:text-primary transition-all duration-200 rounded-lg active:scale-95",
        className,
      )}
      aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
    >
      <span className="material-symbols-outlined">
        {theme === "dark" ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
