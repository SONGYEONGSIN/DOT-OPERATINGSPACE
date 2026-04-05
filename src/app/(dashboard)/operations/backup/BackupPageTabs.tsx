"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import BackupForm from "./BackupForm";

interface Profile {
  id: number;
  name: string;
  team: string;
  email: string;
}

interface BackupPageTabsProps {
  profiles: Profile[];
  children: React.ReactNode;
}

type Tab = "list" | "create";

export default function BackupPageTabs({ profiles, children }: BackupPageTabsProps) {
  const [tab, setTab] = useState<Tab>("list");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1 bg-surface-container-high rounded-xl p-1 w-fit">
        <button
          type="button"
          onClick={() => setTab("list")}
          className={cn(
            "px-5 py-2 rounded-lg text-xs font-bold transition-all",
            tab === "list"
              ? "bg-primary text-on-primary shadow-sm"
              : "text-on-surface-variant hover:text-on-surface",
          )}
        >
          백업 현황
        </button>
        <button
          type="button"
          onClick={() => setTab("create")}
          className={cn(
            "px-5 py-2 rounded-lg text-xs font-bold transition-all",
            tab === "create"
              ? "bg-primary text-on-primary shadow-sm"
              : "text-on-surface-variant hover:text-on-surface",
          )}
        >
          백업 요청
        </button>
      </div>

      {tab === "list" && <div className="space-y-8">{children}</div>}
      {tab === "create" && (
        <BackupForm profiles={profiles} onComplete={() => setTab("list")} />
      )}
    </div>
  );
}
