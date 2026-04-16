"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useCallback } from "react";
import { cn } from "@/lib/cn";
import { IconSearch } from "@tabler/icons-react";

interface FilterBarProps {
  searchPlaceholder?: string;
  searchKey?: string;
  tabs?: { label: string; value: string }[];
  tabKey?: string;
  actions?: React.ReactNode;
}

export default function FilterBar({
  searchPlaceholder = "검색...",
  searchKey = "search",
  tabs,
  tabKey = "tab",
  actions,
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTab = searchParams.get(tabKey) ?? tabs?.[0]?.value ?? "";
  const [searchValue, setSearchValue] = useState(
    searchParams.get(searchKey) ?? "",
  );

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, val]) => {
        if (val) params.set(key, val);
        else params.delete(key);
      });
      params.delete("page");
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, searchParams],
  );

  function handleSearch(value: string) {
    setSearchValue(value);
    updateParams({ [searchKey]: value || null });
  }

  function handleTabChange(value: string) {
    const isDefault = value === tabs?.[0]?.value;
    updateParams({ [tabKey]: isDefault ? null : value });
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative flex-1 min-w-[200px]">
        <IconSearch
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
        />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-10 pr-4 py-2.5 rounded-[14px] text-sm text-[var(--color-text)] bg-[var(--color-surface)] shadow-neu-inset-soft focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all duration-[var(--duration-hover)] ease-[var(--ease-neu)] placeholder:text-[var(--color-text-faint)]"
        />
      </div>

      {tabs && tabs.length > 0 && (
        <div className="flex items-center gap-1 bg-[var(--color-surface)] shadow-neu-inset-soft rounded-[14px] p-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleTabChange(tab.value)}
              className={cn(
                "px-3.5 py-1.5 rounded-[8px] text-xs font-bold tracking-wide transition-all duration-[var(--duration-press)] ease-[var(--ease-neu)]",
                currentTab === tab.value
                  ? "shadow-neu-soft text-[var(--color-primary)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
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
