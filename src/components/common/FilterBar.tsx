"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

interface FilterBarProps {
  searchPlaceholder?: string;
  tabs?: { label: string; value: string }[];
  onSearch?: (value: string) => void;
  actions?: React.ReactNode;
}

export default function FilterBar({
  searchPlaceholder = "검색...",
  tabs,
  onSearch,
  actions,
}: FilterBarProps) {
  const [activeTab, setActiveTab] = useState(tabs?.[0]?.value ?? "");
  const [searchValue, setSearchValue] = useState("");

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSearchValue(value);
    onSearch?.(value);
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative flex-1 min-w-[200px]">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
          search
        </span>
        <input
          type="text"
          value={searchValue}
          onChange={handleSearchChange}
          placeholder={searchPlaceholder}
          className={cn(
            "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm",
            "bg-surface-container-high text-on-surface placeholder:text-on-surface-variant/50",
            "border border-outline-variant/15 focus:border-primary/30 focus:outline-none",
            "transition-colors",
          )}
        />
      </div>

      {tabs && tabs.length > 0 && (
        <div className="flex items-center gap-1 bg-surface-container-high rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all",
                activeTab === tab.value
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}
