"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { IconSearch } from "@tabler/icons-react";
import { cn } from "@/lib/cn";

const DOC_TYPE_TABS = [
  { label: "발신", value: "발신" },
  { label: "수신", value: "수신" },
] as const;

const DOC_YEAR_TABS = [
  { label: "2026", value: "2026" },
  { label: "2025", value: "2025" },
] as const;

interface EtcFiltersProps {
  mode: "documents" | "mail";
  writers?: string[];
  managers?: string[];
}

const selectClass = "search-input px-4 py-2.5 rounded-[20px] text-sm font-medium text-[var(--color-text)] focus:outline-none transition-colors appearance-none cursor-pointer min-w-[120px]";

export default function EtcFilters({ mode, writers, managers }: EtcFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") ?? "";
  const currentDocType = searchParams.get("docType") ?? "발신";
  const currentYear = searchParams.get("year") ?? "2026";
  const currentWriter = searchParams.get("writer") ?? "";

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  if (mode === "documents") {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-[var(--color-surface)] rounded-[20px] p-1">
            {DOC_YEAR_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => updateParams({ year: tab.value })}
                className={cn(
                  "px-3.5 py-1.5 rounded-[14px] text-xs font-bold tracking-wide transition-all",
                  currentYear === tab.value
                    ? "bg-primary text-on-primary"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-[var(--color-surface)] rounded-[20px] p-1">
            {DOC_TYPE_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => updateParams({ docType: tab.value })}
                className={cn(
                  "px-3.5 py-1.5 rounded-[14px] text-xs font-bold tracking-wide transition-all",
                  currentDocType === tab.value
                    ? "bg-primary text-on-primary"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              defaultValue={currentSearch}
              onChange={(e) => updateParams({ search: e.target.value })}
              placeholder="문서번호, 제목, 발신처 검색..."
              className="search-input w-full pl-10 pr-4 py-2.5 rounded-[20px] text-sm text-[var(--color-text)] focus:outline-none transition-colors"
            />
          </div>

          {writers && writers.length > 0 && (
            <select value={currentWriter} onChange={(e) => updateParams({ writer: e.target.value })} className={selectClass}>
              <option value="">전체 작성자</option>
              {writers.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          )}
        </div>
      </div>
    );
  }

  // mail mode
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative flex-1 min-w-[200px]">
        <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input
          type="text"
          defaultValue={currentSearch}
          onChange={(e) => updateParams({ search: e.target.value })}
          placeholder="수신처, 수신자, 담당자 검색..."
          className="search-input w-full pl-10 pr-4 py-2.5 rounded-[20px] text-sm text-[var(--color-text)] focus:outline-none transition-colors"
        />
      </div>

      {managers && managers.length > 0 && (
        <select value={currentWriter} onChange={(e) => updateParams({ writer: e.target.value })} className={selectClass}>
          <option value="">전체 담당자</option>
          {managers.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      )}
    </div>
  );
}
