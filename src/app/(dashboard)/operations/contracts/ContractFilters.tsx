"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { IconSearch } from "@tabler/icons-react";
import { cn } from "@/lib/cn";

const CATEGORY_TABS = [
  { label: "전체", value: "" },
  { label: "4년제", value: "4년제" },
  { label: "전문대", value: "전문대" },
  { label: "초중고", value: "초중고" },
  { label: "대학원", value: "대학원" },
  { label: "기타", value: "기타" },
] as const;

interface ContractFiltersProps {
  regions: string[];
  statuses: string[];
  chargeMethods: string[];
}

const selectClass = "search-input px-4 py-2.5 rounded-xl text-sm font-medium text-on-surface focus:outline-none transition-colors appearance-none cursor-pointer min-w-[140px]";

export default function ContractFilters({ regions, statuses, chargeMethods }: ContractFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") ?? "";
  const currentSearch = searchParams.get("search") ?? "";
  const currentRegion = searchParams.get("region") ?? "";
  const currentStatus = searchParams.get("status") ?? "";
  const currentCharge = searchParams.get("charge") ?? "";
  const currentScan = searchParams.get("scan") ?? "";

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
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => updateParams({ category: tab.value })}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all",
              currentCategory === tab.value
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
          <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            defaultValue={currentSearch}
            onChange={(e) => updateParams({ search: e.target.value })}
            placeholder="대학명 검색..."
            className="search-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-on-surface focus:outline-none transition-colors"
          />
        </div>

        {regions.length > 0 && (
          <select value={currentRegion} onChange={(e) => updateParams({ region: e.target.value })} className={selectClass}>
            <option value="">전체 지역</option>
            {regions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        )}

        {statuses.length > 0 && (
          <select value={currentStatus} onChange={(e) => updateParams({ status: e.target.value })} className={selectClass}>
            <option value="">전체 계약현황</option>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        )}

        {chargeMethods.length > 0 && (
          <select value={currentCharge} onChange={(e) => updateParams({ charge: e.target.value })} className={selectClass}>
            <option value="">전체 청구방식</option>
            {chargeMethods.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        )}

        <select value={currentScan} onChange={(e) => updateParams({ scan: e.target.value })} className={selectClass}>
          <option value="">전체 스캔본</option>
          <option value="incomplete">미완료만</option>
          <option value="complete">완료만</option>
        </select>
      </div>
    </div>
  );
}
