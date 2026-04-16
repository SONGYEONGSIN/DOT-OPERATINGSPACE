"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { IconFileText, IconMailForward } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import AddDocumentButton from "./AddDocumentButton";
import AddMailButton from "./AddMailButton";

type Tab = "documents" | "mail";

export default function EtcTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTab = (searchParams.get("tab") as Tab) ?? "documents";

  const switchTab = useCallback(
    (tab: Tab) => {
      const params = new URLSearchParams();
      params.set("tab", tab);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname],
  );

  const tabs: { key: Tab; label: string; icon: typeof IconFileText }[] = [
    { key: "documents", label: "공문 관리", icon: IconFileText },
    { key: "mail", label: "우편물 관리", icon: IconMailForward },
  ];

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1 bg-[var(--color-surface)] rounded-[20px] p-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => switchTab(t.key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-[14px] text-xs font-bold tracking-wide transition-all",
                currentTab === t.key
                  ? "bg-primary text-on-primary"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]",
              )}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>
      {currentTab === "documents" ? <AddDocumentButton /> : <AddMailButton />}
    </div>
  );
}
