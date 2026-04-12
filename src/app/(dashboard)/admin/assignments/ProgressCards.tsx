"use client";

import { cn } from "@/lib/cn";
import { ProgressBar, Card } from "@/components/common";
import { IconArrowRight } from "@tabler/icons-react";

interface PhaseTypeInfo {
  type: string;
  label: string;
  total: number;
  assigned: number;
}

interface PhaseInfo {
  phase: number;
  label: string;
  types: PhaseTypeInfo[];
  status: "done" | "active" | "todo";
}

interface ProgressCardsProps {
  phases: PhaseInfo[];
}

const STATUS_ACCENT: Record<PhaseInfo["status"], string> = {
  done: "bg-primary",
  active: "bg-tertiary",
  todo: "bg-surface-container-highest",
};

function getProgressColor(pct: number): "primary" | "warning" | "error" {
  if (pct >= 100) return "primary";
  if (pct >= 50) return "warning";
  return "error";
}

export default function ProgressCards({ phases }: ProgressCardsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {phases.map((phase) => {
        const totalAll = phase.types.reduce((s, t) => s + t.total, 0);
        const totalAssigned = phase.types.reduce((s, t) => s + t.assigned, 0);
        const pct =
          totalAll > 0 ? Math.round((totalAssigned / totalAll) * 100) : 0;
        const unassigned = totalAll - totalAssigned;
        const firstType = phase.types[0]?.type ?? "";

        return (
          <Card key={phase.phase} className="relative overflow-hidden" hover>
            {/* Top accent bar */}
            <div className={cn("h-[3px]", STATUS_ACCENT[phase.status])} />

            <div className="p-5">
              {/* Phase header */}
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black",
                    phase.status === "done"
                      ? "bg-primary/15 text-primary"
                      : phase.status === "active"
                        ? "bg-tertiary/15 text-tertiary"
                        : "bg-surface-container-highest text-on-surface-variant",
                  )}
                >
                  {phase.phase}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-on-surface">
                    Phase {phase.phase}
                  </h4>
                  <p className="text-[10px] text-on-surface-variant">
                    {phase.label}
                  </p>
                </div>
              </div>

              {/* Type tags (clickable) */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {phase.types.map((t) => {
                  const typePct = t.total > 0 ? t.assigned / t.total : 0;
                  return (
                    <a
                      key={t.type}
                      href={`?type=${t.type}&step=1`}
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium",
                        "hover:ring-1 hover:ring-primary/30 transition-all",
                        typePct >= 1
                          ? "bg-primary/10 text-primary"
                          : typePct > 0
                            ? "bg-tertiary/10 text-tertiary"
                            : "bg-surface-container-highest text-on-surface-variant",
                      )}
                    >
                      {t.label}
                      <span className="tabular-nums opacity-70">
                        {t.assigned}/{t.total}
                      </span>
                    </a>
                  );
                })}
              </div>

              {/* Progress */}
              <ProgressBar
                value={totalAssigned}
                max={totalAll || 1}
                size="md"
                color={getProgressColor(pct)}
              />

              {/* Stats row */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="text-on-surface-variant">
                    배정{" "}
                    <span className="font-bold text-on-surface tabular-nums">
                      {totalAssigned}
                    </span>
                  </span>
                  {unassigned > 0 && (
                    <span className="flex items-center gap-1 text-error">
                      <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
                      미배정 {unassigned}
                    </span>
                  )}
                  <span className="text-on-surface-variant tabular-nums">
                    {pct}%
                  </span>
                </div>

                <a
                  href={`?type=${firstType}&step=1`}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors",
                    phase.status === "done"
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "bg-surface-container-high text-on-surface hover:bg-surface-bright",
                  )}
                >
                  {phase.status === "done" ? "확인" : "시작"}
                  <IconArrowRight size={10} />
                </a>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
