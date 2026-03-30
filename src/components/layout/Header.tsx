"use client";

import { cn } from "@/lib/cn";
import { ThemeToggle } from "@/components/common";

export default function Header() {
  return (
    <header
      className={cn(
        "fixed top-0 left-64 right-0 z-30 h-16",
        "bg-surface/80 backdrop-blur-xl",
        "border-b border-outline-variant/15",
        "shadow-glow-strong",
      )}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="시스템 전체 검색..."
            className={cn(
              "w-full bg-surface-container-high border-none rounded-lg",
              "pl-10 pr-4 py-2 text-sm text-on-surface",
              "placeholder:text-outline",
              "focus:ring-1 focus:ring-primary/50 focus:outline-none",
              "transition-all duration-200",
            )}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          <ThemeToggle />
          <button className="relative p-2 text-on-surface-variant hover:bg-surface-bright hover:text-primary transition-all duration-200 rounded-lg active:scale-95">
            <span className="material-symbols-outlined text-xl">
              notifications
            </span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error animate-pulse" />
          </button>
        </div>
      </div>
    </header>
  );
}
