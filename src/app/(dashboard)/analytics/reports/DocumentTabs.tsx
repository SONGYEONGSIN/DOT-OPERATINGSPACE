"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import IncidentReportForm from "./IncidentReportForm";
import QuotationForm from "./QuotationForm";

const TABS = [
  { key: "incident", label: "경위서" },
  { key: "quotation", label: "견적서" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function DocumentTabs() {
  const [tab, setTab] = useState<TabKey>("incident");

  return (
    <>
      <div className="flex items-center gap-1 bg-[var(--color-surface)] rounded-[20px] p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "px-4 py-2 rounded-[14px] text-xs font-bold tracking-wide transition-all",
              tab === t.key
                ? "bg-primary text-on-primary"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "incident" && <IncidentReportForm />}
      {tab === "quotation" && <QuotationForm />}
    </>
  );
}
