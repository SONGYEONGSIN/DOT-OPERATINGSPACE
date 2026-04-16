"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { IconSearch } from "@tabler/icons-react";
import { cn } from "@/lib/cn";

const RECEPTION_TABS = [
  { label: "전체", value: "" },
  { label: "반응형원서", value: "반응형원서" },
  { label: "공통원서", value: "공통원서" },
  { label: "일반원서", value: "일반원서" },
  { label: "일반접수", value: "일반접수" },
] as const;

interface ServiceFiltersProps {
  regions: string[];
  categories: string[];
}

const selectClass = "search-input px-4 py-2.5 rounded-[20px] text-sm font-medium text-[var(--color-text)] focus:outline-none transition-colors appearance-none cursor-pointer min-w-[140px]";

export default function ServiceFilters({ regions, categories }: ServiceFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentType = searchParams.get("type") ?? "";
  const currentSearch = searchParams.get("search") ?? "";
  const currentRegion = searchParams.get("region") ?? "";
  const currentCategory = searchParams.get("category") ?? "";

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1 bg-[var(--color-surface)] rounded-[20px] p-1 w-fit">
        {RECEPTION_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => updateParams({ type: tab.value })}
            className={cn(
              "px-3.5 py-1.5 rounded-[14px] text-xs font-bold tracking-wide transition-all",
              currentType === tab.value
                ? "bg-primary text-on-primary"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            defaultValue={currentSearch}
            onChange={(e) => updateParams({ search: e.target.value })}
            placeholder="대학명 / 서비스명 검색..."
            className="search-input w-full pl-10 pr-4 py-2.5 rounded-[20px] text-sm text-[var(--color-text)] focus:outline-none transition-colors"
          />
        </div>

        <select value={currentRegion} onChange={(e) => updateParams({ region: e.target.value })} className={selectClass}>
          <option value="">전체 지역</option>
          {regions.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>

        <select value={currentCategory} onChange={(e) => updateParams({ category: e.target.value })} className={selectClass}>
          <option value="">전체 카테고리</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>
  );
}
