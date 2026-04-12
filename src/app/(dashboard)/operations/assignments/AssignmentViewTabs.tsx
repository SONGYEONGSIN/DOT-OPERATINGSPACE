"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { IconSearch } from "@tabler/icons-react";
import { cn } from "@/lib/cn";

const TABS = [
  { key: "summary", label: "배정현황" },
  { key: "list", label: "배정리스트" },
  { key: "grad", label: "대학원" },
  { key: "pims", label: "PIMS" },
  { key: "score", label: "성적산출" },
  { key: "app", label: "상담앱" },
  { key: "roles", label: "업무분장" },
  { key: "pricing", label: "가격정책" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

interface Props {
  contents: Record<string, React.ReactNode>;
}

export default function AssignmentViewTabs({ contents }: Props) {
  const [tab, setTab] = useState<TabKey>("summary");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") ?? "";

  function handleSearch(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("search", value);
    else params.delete("search");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <>
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1 bg-surface-container-high rounded-xl p-1 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              className={cn("px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all whitespace-nowrap",
                tab === t.key ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container")}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input type="text" defaultValue={currentSearch} onChange={(e) => handleSearch(e.target.value)} placeholder="운영자 또는 대학명 검색..."
            className="search-input w-full pl-9 pr-4 py-2 rounded-lg text-xs text-on-surface focus:outline-none" />
        </div>
      </div>
      {contents[tab]}
    </>
  );
}
