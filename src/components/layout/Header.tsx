"use client";

import { cn } from "@/lib/cn";
import { ThemeToggle } from "@/components/common";
import { IconSearch } from "@tabler/icons-react";
import NotificationDropdown from "./NotificationDropdown";
import SessionTimer from "./SessionTimer";

export default function Header() {
  return (
    <header
      className={cn(
        "fixed top-0 left-64 right-0 z-30 h-16",
        "bg-surface/80 backdrop-blur-xl",
        "",
        "shadow-glow-strong",
      )}
    >
      <div className="flex items-center h-full px-6">
        {/* 좌측 여백 */}
        <div className="flex-1" />

        {/* Search (가운데) */}
        <div className="relative w-full max-w-md">
          <IconSearch
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
          />
          <input
            type="text"
            placeholder="시스템 전체 검색..."
            className="search-input w-full pl-10 pr-4 py-2 rounded-[14px] text-sm text-[var(--color-text)] focus:outline-none transition-all duration-200"
          />
        </div>

        {/* Actions (우측) */}
        <div className="flex-1 flex items-center justify-end gap-2">
          <SessionTimer />
          <ThemeToggle />
          <NotificationDropdown />
        </div>
      </div>
    </header>
  );
}
