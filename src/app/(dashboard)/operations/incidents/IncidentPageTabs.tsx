"use client";

import { cn } from "@/lib/cn";
import { IconListDetails, IconChartBar } from "@tabler/icons-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const PAGE_TABS = [
  { label: "현황", value: "list", icon: IconListDetails },
  { label: "분석", value: "analytics", icon: IconChartBar },
] as const;

export default function IncidentPageTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = searchParams.get("view") ?? "list";

  const handleChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "list") {
        params.delete("view");
      } else {
        params.set("view", value);
      }
      params.delete("page");
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="flex items-center gap-1 bg-surface-container-high rounded-xl p-1">
      {PAGE_TABS.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleChange(tab.value)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold tracking-wide transition-all",
              current === tab.value
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container",
            )}
          >
            <Icon size={16} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
