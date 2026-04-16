"use client";

import { useEffect } from "react";
import { useThemeStore, applyTheme } from "@/lib/theme";
import { cn } from "@/lib/cn";
import { IconSun, IconMoon } from "@tabler/icons-react";

export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useThemeStore();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <button
      onClick={toggle}
      className={cn(
        "p-2 text-[var(--color-text-muted)] hover:bg-surface-bright hover:text-primary transition-all duration-200 rounded-[14px] active:scale-95",
        className,
      )}
      aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
    >
      {theme === "dark" ? <IconSun size={20} /> : <IconMoon size={20} />}
    </button>
  );
}
