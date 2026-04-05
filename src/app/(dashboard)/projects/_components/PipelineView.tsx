"use client";

import { cn } from "@/lib/cn";
import { STATUS_COLUMNS } from "./types";
import type { ProjectTask } from "./types";

interface PipelineViewProps {
  tasks: ProjectTask[];
}

const stageColors: Record<string, { bg: string; text: string; bar: string }> = {
  request: { bg: "bg-tertiary/10", text: "text-tertiary", bar: "bg-tertiary" },
  planning: { bg: "bg-on-surface-variant/10", text: "text-on-surface-variant", bar: "bg-on-surface-variant" },
  development: { bg: "bg-primary/10", text: "text-primary", bar: "bg-primary" },
  testing: { bg: "bg-info/10", text: "text-info", bar: "bg-info" },
  done: { bg: "bg-primary/5", text: "text-on-surface-variant", bar: "bg-primary/40" },
  hold: { bg: "bg-error/10", text: "text-error", bar: "bg-error" },
};

export default function PipelineView({ tasks }: PipelineViewProps) {
  const total = tasks.length;

  return (
    <div className="flex items-stretch gap-1">
      {STATUS_COLUMNS.map((col, i) => {
        const count = tasks.filter((t) => t.status === col.key).length;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        const colors = stageColors[col.key] ?? stageColors.request;
        const isLast = i === STATUS_COLUMNS.length - 1;

        return (
          <div
            key={col.key}
            className={cn(
              "flex-1 rounded-lg p-3 relative transition-colors",
              colors.bg,
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={cn("text-[10px] font-bold uppercase tracking-widest", colors.text)}>
                {col.label}
              </span>
              {!isLast && (
                <span className="text-on-surface-variant/30 text-xs">→</span>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className={cn("text-xl font-black tabular-nums", count > 0 ? "text-on-surface" : "text-on-surface-variant/30")}>
                {count}
              </span>
              {total > 0 && count > 0 && (
                <span className="text-[10px] text-on-surface-variant">{pct}%</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
