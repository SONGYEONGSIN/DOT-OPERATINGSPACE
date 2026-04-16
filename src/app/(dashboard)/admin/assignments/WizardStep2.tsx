"use client";

import { IconPlayerPlay, IconRefresh } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { OPERATOR_GROUPS } from "./constants";

interface SimResult {
  assignedCount: number;
  newCount: number;
  failedCount: number;
  operatorLoads: Record<string, number>;
  maxes: Record<string, number>;
}

interface WizardStep2Props {
  typeLabel: string;
  totalUniversities: number;
  simResult: SimResult | null;
  isRunning: boolean;
  onRun: () => void;
  onBack: () => void;
  onNext: () => void;
}

function getHeatColor(load: number, max: number): string {
  if (load > max) return "bg-error text-white";
  const ratio = max > 0 ? load / max : 0;
  if (ratio >= 0.95) return "bg-primary text-on-primary";
  if (ratio >= 0.8) return "bg-primary/50 text-on-primary";
  if (ratio >= 0.6) return "bg-primary/30 text-primary";
  if (ratio >= 0.3) return "bg-primary/15 text-primary";
  if (ratio > 0) return "bg-primary/8 text-primary";
  return "bg-[var(--color-surface)] text-[var(--color-text-muted)]/40";
}

function getGaugeGradient(ratio: number): string {
  if (ratio > 1)
    return "linear-gradient(90deg, rgba(255,115,81,0.35), rgba(255,115,81,0.55))";
  if (ratio >= 0.9)
    return "linear-gradient(90deg, rgba(120,160,30,0.3), rgba(120,160,30,0.5))";
  return "linear-gradient(90deg, rgba(120,160,30,0.15), rgba(120,160,30,0.35))";
}

export default function WizardStep2({
  typeLabel,
  totalUniversities,
  simResult,
  isRunning,
  onRun,
  onBack,
  onNext,
}: WizardStep2Props) {
  return (
    <div className="pb-20">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-sm font-black text-[var(--color-text)]">
          시뮬레이션 — <span className="text-primary">{typeLabel}</span>
        </h2>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          설정된 용량 기준으로 자동배정 시뮬레이션을 실행합니다.
        </p>
      </div>

      {/* Empty state: clickable play card */}
      {!simResult && (
        <button
          type="button"
          onClick={onRun}
          disabled={isRunning}
          className={cn(
            "w-full rounded-[20px] border p-12",
            "flex flex-col items-center justify-center",
            "cursor-pointer transition-all group",
            "bg-[var(--color-surface)] border-black/[0.04]/10",
            "hover:border-primary/20 hover:bg-[var(--color-surface)]",
            isRunning && "opacity-60 pointer-events-none",
          )}
        >
          <div
            className={cn(
              "w-16 h-16 rounded-[20px] flex items-center justify-center mb-4 transition-all",
              isRunning
                ? "bg-primary/20 animate-pulse"
                : "bg-[var(--color-surface)] group-hover:bg-primary/10 group-hover:shadow-glow",
            )}
          >
            <IconPlayerPlay
              size={28}
              className={cn(
                "transition-colors",
                isRunning
                  ? "text-primary"
                  : "text-[var(--color-text-muted)] group-hover:text-primary",
              )}
            />
          </div>
          <p className="text-sm font-bold text-[var(--color-text)] mb-1">
            {isRunning ? "시뮬레이션 실행 중..." : "클릭하여 시뮬레이션 실행"}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            설정된 용량으로 자동배정 결과를 미리 확인합니다.
          </p>
        </button>
      )}

      {/* Results: stats + operator lanes */}
      {simResult && (
        <>
          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] mb-4">
            <span>
              대상 <b className="text-[var(--color-text)]">{totalUniversities}</b>
            </span>
            <span className="text-[var(--color-text-faint)]">|</span>
            <span>
              배정 <b className="text-primary">{simResult.assignedCount}</b>
            </span>
            <span className="text-[var(--color-text-faint)]">|</span>
            <span>
              신규 <b className="text-tertiary">{simResult.newCount}</b>
            </span>
            {simResult.failedCount > 0 && (
              <>
                <span className="text-[var(--color-text-faint)]">|</span>
                <span>
                  불가 <b className="text-error">{simResult.failedCount}</b>
                </span>
              </>
            )}
          </div>

          {/* Operator Lanes */}
          <div className="space-y-1">
            {OPERATOR_GROUPS.map((group) => (
              <div key={group.group}>
                <div className="py-1 px-3.5">
                  <span className="text-[8px] font-extrabold text-primary uppercase tracking-[0.15em]">
                    {group.label}
                  </span>
                </div>

                {group.operators.map((op) => {
                  const load = simResult.operatorLoads[op] ?? 0;
                  const max = simResult.maxes[op] ?? 15;
                  const ratio = max > 0 ? load / max : 0;
                  const fillPct = Math.min(ratio * 100, 100);

                  return (
                    <div
                      key={op}
                      className="mb-2 rounded-[10px] bg-[var(--color-surface)] border border-black/[0.04]/5 hover:border-black/[0.04]/10 transition-all"
                    >
                      <div className="flex items-center gap-0">
                        {/* Left: Badge + Name */}
                        <div className="w-[140px] shrink-0 px-3.5 py-2.5 flex items-center gap-2 border-r border-black/[0.04]/5">
                          <div
                            className={cn(
                              "w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-black shrink-0",
                              getHeatColor(load, max),
                            )}
                          >
                            {load}
                          </div>
                          <div className="text-left min-w-0">
                            <div className="text-[11px] font-bold text-[var(--color-text)] truncate">
                              {op}
                            </div>
                            <div className="text-[8px] text-[var(--color-text-muted)]">
                              {group.label} · {load}/{max}
                            </div>
                          </div>
                        </div>

                        {/* Center: Gauge */}
                        <div className="flex-1 px-3.5 py-2 flex items-center gap-2 min-h-[44px]">
                          <div className="flex-1 h-7 bg-surface-dim rounded-md overflow-hidden relative">
                            <div
                              className="h-full rounded-md transition-[width] duration-400 ease-out"
                              style={{
                                width: `${fillPct}%`,
                                background: getGaugeGradient(ratio),
                              }}
                            />
                            {load > 0 && (
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-primary bg-surface/80 px-1.5 rounded">
                                {load}개
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right: MAX */}
                        <div className="w-[50px] shrink-0 text-center py-2 border-l border-black/[0.04]/5">
                          <div className="text-sm font-black text-[var(--color-text)]">
                            {max}
                          </div>
                          <div className="text-[7px] text-[var(--color-text-muted)] uppercase">
                            MAX
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Bottom Fixed Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-black/[0.04]/10 px-5 py-2.5 flex items-center justify-between z-50">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-[14px] bg-[var(--color-surface)] text-[var(--color-text-muted)] text-[11px] font-bold hover:bg-surface-bright transition-colors"
        >
          ← 용량 설정
        </button>

        <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-muted)]">
          {simResult ? (
            <>
              <span>
                배정{" "}
                <span className="font-extrabold text-primary">
                  {simResult.assignedCount}/{totalUniversities}
                </span>
              </span>
              {simResult.failedCount > 0 && (
                <>
                  <span className="text-[var(--color-text-faint)]">·</span>
                  <span>
                    불가{" "}
                    <span className="font-extrabold text-error">
                      {simResult.failedCount}
                    </span>
                  </span>
                </>
              )}
              <button
                type="button"
                onClick={onRun}
                className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)] hover:text-primary transition-colors ml-2"
              >
                <IconRefresh size={10} />
                재실행
              </button>
            </>
          ) : (
            <span>시뮬레이션을 실행하세요</span>
          )}
        </div>

        {simResult ? (
          <button
            type="button"
            onClick={onNext}
            className="px-5 py-2 rounded-[14px] bg-primary text-on-primary text-[11px] font-bold hover:bg-primary-dim transition-colors"
          >
            결과 확인 & 조정 →
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
