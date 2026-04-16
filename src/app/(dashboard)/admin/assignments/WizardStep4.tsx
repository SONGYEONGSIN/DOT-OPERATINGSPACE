"use client";

import { IconCheck, IconArrowRight } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { Card, ProgressBar } from "@/components/common";
import { OPERATOR_GROUPS } from "./constants";

interface WizardStep4Props {
  typeLabel: string;
  totalUniversities: number;
  assignedCount: number;
  newCount: number;
  manualChangeCount: number;
  operatorLoads: Record<string, number>;
  maxes: Record<string, number>;
  isApplying: boolean;
  applied: boolean;
  onApply: () => void;
  onBack: () => void;
  onDone: () => void;
}

export default function WizardStep4({
  typeLabel,
  totalUniversities,
  assignedCount,
  newCount,
  manualChangeCount,
  operatorLoads,
  maxes,
  isApplying,
  applied,
  onApply,
  onBack,
  onDone,
}: WizardStep4Props) {
  const assignRate =
    totalUniversities > 0
      ? Math.round((assignedCount / totalUniversities) * 100)
      : 0;

  if (applied) {
    return (
      <Card className="p-0 overflow-hidden">
        {/* Success accent strip */}
        <div className="h-1 bg-primary" />
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="w-16 h-16 rounded-[20px] bg-primary/10 flex items-center justify-center mb-5">
            <IconCheck size={32} className="text-primary" />
          </div>
          <h3 className="text-lg font-black text-[var(--color-text)] mb-2">
            배정이 적용되었습니다
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-2">
            {typeLabel} {assignedCount}건 배정 완료
          </p>
          <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)] mb-8">
            <span>
              신규 <span className="font-bold text-tertiary">{newCount}</span>
            </span>
            <span className="text-[var(--color-text-faint)]">|</span>
            <span>
              수동 조정{" "}
              <span className="font-bold text-[var(--color-text)]">
                {manualChangeCount}
              </span>
            </span>
            <span className="text-[var(--color-text-faint)]">|</span>
            <span>
              배정률{" "}
              <span className="font-bold text-primary">{assignRate}%</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onDone}
            className="px-6 py-2.5 rounded-[14px] bg-primary text-on-primary text-xs font-bold hover:bg-primary-dim transition-colors"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-[var(--color-text)]">
          최종 확인 — <span className="text-primary">{typeLabel}</span>
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          배정 결과를 확인하고 적용합니다.
        </p>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryTile label="대상 대학" value={totalUniversities} />
        <SummaryTile
          label="배정 완료"
          value={assignedCount}
          variant="primary"
        />
        <SummaryTile label="신규 배정" value={newCount} variant="tertiary" />
        <SummaryTile label="수동 조정" value={manualChangeCount} />
      </div>

      {/* Assignment rate */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[var(--color-text)]">배정률</span>
          <span className="text-sm font-black text-primary tabular-nums">
            {assignRate}%
          </span>
        </div>
        <ProgressBar
          value={assignedCount}
          max={totalUniversities || 1}
          size="md"
          color={
            assignRate === 100
              ? "primary"
              : assignRate >= 80
                ? "warning"
                : "error"
          }
        />
      </Card>

      {/* Operator final heatmap */}
      <Card className="p-5">
        <h4 className="text-xs font-bold text-[var(--color-text)] mb-4">
          운영자별 최종 배정
        </h4>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {OPERATOR_GROUPS.map((group) => (
            <div
              key={group.group}
              className="bg-[var(--color-surface)] rounded-[20px] p-3"
            >
              <p className="text-[9px] font-bold text-primary uppercase tracking-widest mb-3">
                {group.label}
              </p>
              <div className="space-y-2">
                {group.operators.map((op) => {
                  const load = operatorLoads[op] ?? 0;
                  const max = maxes[op] ?? 15;
                  const isOver = load > max;
                  const ratio = max > 0 ? load / max : 0;

                  return (
                    <div key={op} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[var(--color-text)]">
                          {op}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-bold tabular-nums",
                            isOver ? "text-error" : "text-[var(--color-text)]",
                          )}
                        >
                          {load}
                          <span className="text-[var(--color-text-muted)] font-normal">
                            /{max}
                          </span>
                        </span>
                      </div>
                      <div className="h-1 bg-[var(--color-surface)] rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            isOver
                              ? "bg-error"
                              : ratio >= 0.9
                                ? "bg-primary"
                                : "bg-primary/60",
                          )}
                          style={{
                            width: `${Math.min(ratio * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-[14px] bg-[var(--color-surface)] text-[var(--color-text-muted)] text-xs font-bold hover:bg-surface-bright transition-colors"
        >
          수정하기
        </button>
        <button
          type="button"
          onClick={onApply}
          disabled={isApplying}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-[14px]",
            "bg-primary text-on-primary text-xs font-bold",
            "hover:bg-primary-dim transition-colors",
            isApplying && "opacity-60",
          )}
        >
          <IconArrowRight size={14} />
          {isApplying ? "적용 중..." : "배정 적용"}
        </button>
      </div>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: number;
  variant?: "default" | "primary" | "tertiary";
}) {
  const valueColors = {
    default: "text-[var(--color-text)]",
    primary: "text-primary",
    tertiary: "text-tertiary",
  } as const;

  return (
    <Card className="p-4 text-center">
      <div
        className={cn(
          "text-2xl font-black tabular-nums tracking-tight",
          valueColors[variant],
        )}
      >
        {value}
      </div>
      <div className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mt-1">
        {label}
      </div>
    </Card>
  );
}
