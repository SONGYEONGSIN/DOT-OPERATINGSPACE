"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

const TABS = [
  { key: "guide", label: "온보딩 가이드" },
  { key: "materials", label: "업무매뉴얼" },
  { key: "manage", label: "온보딩 체크리스트" },
  { key: "history", label: "활동로그" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

interface OnboardingTabsProps {
  guideContent: React.ReactNode;
  materialsContent: React.ReactNode;
  manageContent: React.ReactNode;
  historyContent: React.ReactNode;
}

export default function OnboardingTabs({ guideContent, materialsContent, manageContent, historyContent }: OnboardingTabsProps) {
  const [tab, setTab] = useState<TabKey>("guide");

  return (
    <>
      <div className="flex items-center gap-1 bg-surface-container-high rounded-xl p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all",
              tab === t.key
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "guide" && guideContent}
      {tab === "materials" && materialsContent}
      {tab === "manage" && manageContent}
      {tab === "history" && historyContent}
    </>
  );
}
