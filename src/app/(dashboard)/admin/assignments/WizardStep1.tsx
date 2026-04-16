"use client";

import { IconRefresh } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { OPERATOR_GROUPS, ALL_OPERATORS } from "./constants";
import type { OperatorBaseStats } from "@/lib/sharepoint";

const DEFAULT_MAX: Record<number, number> = {
  1: 13,
  2: 14,
  3: 15,
  4: 16,
  5: 17,
  6: 18,
};

interface University {
  universityName: string;
  category: string;
  region: string;
  currentOperator: string;
}

interface WizardStep1Props {
  assignType: string;
  typeLabel: string;
  maxes: Record<string, number>;
  universities: University[];
  onMaxChange: (op: string, value: number) => void;
  onResetDefaults: () => void;
  onBack: () => void;
  onNext: () => void;
  baseStats: OperatorBaseStats[];
}

function getGaugeGradient(ratio: number): string {
  if (ratio > 1)
    return "linear-gradient(90deg, rgba(255,115,81,0.35), rgba(255,115,81,0.55))";
  if (ratio >= 0.9)
    return "linear-gradient(90deg, rgba(120,160,30,0.3), rgba(120,160,30,0.5))";
  return "linear-gradient(90deg, rgba(120,160,30,0.15), rgba(120,160,30,0.35))";
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

export default function WizardStep1({
  typeLabel,
  maxes,
  universities,
  onMaxChange,
  onResetDefaults,
  onBack,
  onNext,
  baseStats,
}: WizardStep1Props) {
  const statsMap = new Map(baseStats.map((s) => [s.name, s]));
  const totalOperators = ALL_OPERATORS.length;
  const totalCapacity = Object.values(maxes).reduce((s, v) => s + v, 0);
  const capacityShort = universities.length - totalCapacity;

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-black text-[var(--color-text)]">
            용량 설정 — <span className="text-primary">{typeLabel}</span>
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            운영자별 최대 배정 수를 설정하세요. 게이지는 작년 실적 기준입니다.
          </p>
        </div>
        <button
          type="button"
          onClick={onResetDefaults}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[14px] text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] transition-colors"
        >
          <IconRefresh size={12} />
          기본값 복원
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] mb-4">
        <span>
          대상 <b className="text-[var(--color-text)]">{universities.length}</b>개
        </span>
        <span className="text-[var(--color-text-faint)]">|</span>
        <span>
          운영자 <b className="text-[var(--color-text)]">{totalOperators}</b>명
        </span>
        <span className="text-[var(--color-text-faint)]">|</span>
        <span>
          총 용량 <b className="text-primary">{totalCapacity}</b>건
        </span>
        {capacityShort > 0 && (
          <>
            <span className="text-[var(--color-text-faint)]">|</span>
            <span>
              부족 <b className="text-error">{capacityShort}</b>건
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
              <span className="text-[8px] text-[var(--color-text-muted)] ml-2">
                기본 {DEFAULT_MAX[group.group]}
              </span>
            </div>

            {group.operators.map((op) => {
              const stat = statsMap.get(op);
              const max = maxes[op] ?? DEFAULT_MAX[group.group];
              const baseLoad = stat?.totalServices ?? 0;
              const ratio = max > 0 ? baseLoad / max : 0;
              const fillPct = Math.min(ratio * 100, 100);
              const isCustom = max !== DEFAULT_MAX[group.group];

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
                          getHeatColor(baseLoad, max),
                        )}
                      >
                        {baseLoad}
                      </div>
                      <div className="text-left min-w-0">
                        <div className="text-[11px] font-bold text-[var(--color-text)] truncate">
                          {op}
                        </div>
                        <div className="text-[8px] text-[var(--color-text-muted)]">
                          {group.label} · 작년 {baseLoad}건
                        </div>
                      </div>
                    </div>

                    {/* Center: Gauge (base stats reference) */}
                    <div className="flex-1 px-3.5 py-2 flex items-center gap-2 min-h-[44px]">
                      <div className="flex-1 h-7 bg-surface-dim rounded-md overflow-hidden relative">
                        <div
                          className="h-full rounded-md transition-[width] duration-400 ease-out"
                          style={{
                            width: `${fillPct}%`,
                            background: getGaugeGradient(ratio),
                          }}
                        />
                        {baseLoad > 0 && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-primary bg-surface/80 px-1.5 rounded">
                            {baseLoad}건
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Capacity input */}
                    <div className="w-[80px] shrink-0 flex flex-col items-center py-2 border-l border-black/[0.04]/5">
                      <input
                        type="number"
                        value={max}
                        onChange={(e) =>
                          onMaxChange(op, Number(e.target.value))
                        }
                        min={0}
                        max={50}
                        className={cn(
                          "w-14 text-center rounded-[14px] px-1 py-1.5 text-sm font-black tabular-nums",
                          "bg-[var(--color-surface)] border-none",
                          "text-[var(--color-text)] focus:ring-1 focus:ring-primary/50 focus:outline-none",
                          isCustom && "ring-1 ring-tertiary/30",
                        )}
                      />
                      <div className="text-[7px] text-[var(--color-text-muted)] uppercase mt-0.5">
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

      {/* Bottom Fixed Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-black/[0.04]/10 px-5 py-2.5 flex items-center justify-between z-50">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-[14px] bg-[var(--color-surface)] text-[var(--color-text-muted)] text-[11px] font-bold hover:bg-surface-bright transition-colors"
        >
          ← 대시보드
        </button>

        <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-muted)]">
          <span>
            대상{" "}
            <span className="font-extrabold text-[var(--color-text)]">
              {universities.length}
            </span>
            개
          </span>
          <span className="text-[var(--color-text-faint)]">·</span>
          <span>
            용량{" "}
            <span className="font-extrabold text-primary">{totalCapacity}</span>
            건
          </span>
          {capacityShort > 0 && (
            <>
              <span className="text-[var(--color-text-faint)]">·</span>
              <span>
                부족{" "}
                <span className="font-extrabold text-error">
                  {capacityShort}
                </span>
                건
              </span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onNext}
          className="px-5 py-2 rounded-[14px] bg-primary text-on-primary text-[11px] font-bold hover:bg-primary-dim transition-colors"
        >
          다음: 시뮬레이션 →
        </button>
      </div>
    </div>
  );
}
