"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { IconSearch } from "@tabler/icons-react";
import { cn } from "@/lib/cn";

const ASSIGNMENT_TABS = [
  { label: "전체", value: "" },
  { label: "배정리스트", value: "list" },
  { label: "대학원", value: "grad" },
  { label: "PIMS", value: "pims" },
  { label: "성적산출", value: "score" },
  { label: "상담앱", value: "app" },
] as const;

interface AssignmentFiltersProps {
  regions: string[];
  categories: string[];
}

const selectClass =
  "search-input px-4 py-2.5 rounded-xl text-sm font-medium text-on-surface focus:outline-none transition-colors appearance-none cursor-pointer min-w-[140px]";

export default function AssignmentFilters({
  regions,
  categories,
}: AssignmentFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTab = searchParams.get("tab") ?? "";
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
      <div className="flex items-center gap-1 bg-surface-container-high rounded-xl p-1 w-fit">
        {ASSIGNMENT_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => updateParams({ tab: tab.value })}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all whitespace-nowrap",
              currentTab === tab.value
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <IconSearch
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="text"
            defaultValue={currentSearch}
            onChange={(e) => updateParams({ search: e.target.value })}
            placeholder="대학명 / 운영자 검색..."
            className="search-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-on-surface focus:outline-none transition-colors"
          />
        </div>

        <select
          value={currentCategory}
          onChange={(e) => updateParams({ category: e.target.value })}
          className={selectClass}
        >
          <option value="">전체 카테고리</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
