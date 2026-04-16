"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import HandoverFlow from "./HandoverFlow";
import type { Service, Profile } from "./types";

interface HandoverPageTabsProps {
  services: Service[];
  profiles: Profile[];
  operatorCounts: Record<string, number>;
  children: React.ReactNode;
  historyContent: React.ReactNode;
}

type Tab = "dashboard" | "execute" | "history";

export default function HandoverPageTabs({
  services,
  profiles,
  operatorCounts,
  children,
  historyContent,
}: HandoverPageTabsProps) {
  const [tab, setTab] = useState<Tab>("dashboard");

  return (
    <div className="space-y-6">
      {/* 탭 전환 */}
      <div className="flex items-center gap-1 bg-[var(--color-surface)] rounded-[20px] p-1 w-fit">
        <button
          type="button"
          onClick={() => setTab("dashboard")}
          className={cn(
            "px-5 py-2 rounded-[14px] text-xs font-bold transition-all",
            tab === "dashboard"
              ? "bg-primary text-on-primary shadow-neu-soft"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
          )}
        >
          담당자 현황
        </button>
        <button
          type="button"
          onClick={() => setTab("execute")}
          className={cn(
            "px-5 py-2 rounded-[14px] text-xs font-bold transition-all",
            tab === "execute"
              ? "bg-primary text-on-primary shadow-neu-soft"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
          )}
        >
          인수인계 실행
        </button>
        <button
          type="button"
          onClick={() => setTab("history")}
          className={cn(
            "px-5 py-2 rounded-[14px] text-xs font-bold transition-all",
            tab === "history"
              ? "bg-primary text-on-primary shadow-neu-soft"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
          )}
        >
          인수인계 확인
        </button>
      </div>

      {/* 콘텐츠 */}
      {tab === "dashboard" && (
        <div className="space-y-8">{children}</div>
      )}
      {tab === "execute" && (
        <HandoverFlow
          services={services}
          profiles={profiles}
          operatorCounts={operatorCounts}
          onComplete={() => setTab("dashboard")}
        />
      )}
      {tab === "history" && (
        <div className="space-y-8">{historyContent}</div>
      )}
    </div>
  );
}
