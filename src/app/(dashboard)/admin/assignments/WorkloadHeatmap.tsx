"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/cn";
import { Card } from "@/components/common";
import type { OperatorSummary } from "@/lib/sharepoint";
import { OPERATOR_GROUPS } from "./constants";

export interface CellUniv {
  universityName: string;
  category: string;
  region: string;
}

export type HeatmapDetails = Record<string, Record<string, CellUniv[]>>;

interface WorkloadHeatmapProps {
  operatorSummary: OperatorSummary[];
  cellDetails?: HeatmapDetails;
}

const METRIC_KEYS = [
  { key: "susiTotal" as const, label: "수시" },
  { key: "jungsiTotal" as const, label: "정시" },
  { key: "etcJaewoe" as const, label: "재외" },
  { key: "etcForeign" as const, label: "외국인" },
  { key: "etcK12" as const, label: "초중고" },
  { key: "etcGrad" as const, label: "대학원" },
  { key: "etcPimsFull" as const, label: "PIMS" },
  { key: "etcScore" as const, label: "성적" },
  { key: "etcApp" as const, label: "상담앱" },
];

function calcTotal(op: OperatorSummary): number {
  return (
    op.susiTotal +
    op.jungsiTotal +
    op.etcJaewoe +
    op.etcForeign +
    op.etcK12 +
    op.etcGrad +
    op.etcPimsFull +
    op.etcScore +
    op.etcApp
  );
}

function getCellStyle(value: number): string {
  if (value === 0)
    return "bg-surface-container-highest text-on-surface-variant/30";
  if (value <= 2) return "bg-primary/10 text-primary";
  if (value <= 5) return "bg-primary/25 text-primary";
  if (value <= 8) return "bg-primary/40 text-on-primary";
  if (value <= 12) return "bg-primary/60 text-on-primary";
  return "bg-primary text-on-primary";
}

function getTotalStyle(value: number, maxTotal: number): string {
  if (value === 0)
    return "bg-surface-container-highest text-on-surface-variant/30";
  const ratio = maxTotal > 0 ? value / maxTotal : 0;
  if (ratio >= 0.85) return "bg-tertiary text-on-tertiary";
  if (ratio >= 0.65) return "bg-tertiary/50 text-on-tertiary";
  if (ratio >= 0.45) return "bg-tertiary/30 text-tertiary";
  return "bg-tertiary/15 text-tertiary";
}

export default function WorkloadHeatmap({
  operatorSummary,
  cellDetails,
}: WorkloadHeatmapProps) {
  const opMap = new Map(operatorSummary.map((o) => [o.name, o]));
  const totals = operatorSummary.map(calcTotal);
  const maxTotal = Math.max(...totals, 1);

  const [activeCell, setActiveCell] = useState<{
    op: string;
    metric: string;
    label: string;
  } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setActiveCell(null);
      }
    }
    if (activeCell) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [activeCell]);

  const activeUnivs =
    activeCell && cellDetails
      ? [...(cellDetails[activeCell.op]?.[activeCell.metric] ?? [])].sort(
          (a, b) => {
            const aFull = a.category.includes("전체") ? 0 : 1;
            const bFull = b.category.includes("전체") ? 0 : 1;
            if (aFull !== bFull) return aFull - bFull;
            return a.category.localeCompare(b.category);
          },
        )
      : [];

  return (
    <Card className="p-5 relative">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-on-surface">
            운영자 워크로드 히트맵
          </h3>
          <p className="text-xs text-on-surface-variant mt-1">
            각 셀을 클릭하면 배정된 대학 목록을 확인할 수 있습니다.
          </p>
        </div>
        <HeatLegend />
      </div>

      {/* Column labels */}
      <div className="flex items-center gap-1.5 mb-2 pl-[88px]">
        {METRIC_KEYS.map((mk) => (
          <span
            key={mk.key}
            className="flex-1 text-center text-xs font-bold text-on-surface-variant tracking-wide"
          >
            {mk.label}
          </span>
        ))}
        <span className="w-16 text-center text-xs font-bold text-tertiary tracking-wide">
          합계
        </span>
      </div>

      {/* Rows by group */}
      <div className="space-y-3">
        {OPERATOR_GROUPS.map((group) => (
          <div key={group.group}>
            <p className="text-[9px] font-bold text-primary uppercase tracking-widest mb-1.5">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.operators.map((name) => {
                const op = opMap.get(name);
                if (!op) return null;
                const total = calcTotal(op);

                return (
                  <div
                    key={name}
                    className="flex items-center gap-1.5 group/row"
                  >
                    <span className="w-[80px] text-xs font-medium text-on-surface truncate shrink-0">
                      {name}
                    </span>
                    {METRIC_KEYS.map((mk) => {
                      const val = op[mk.key] as number;
                      const isActive =
                        activeCell?.op === name &&
                        activeCell?.metric === mk.key;

                      return (
                        <div key={mk.key} className="flex-1 relative">
                          <button
                            type="button"
                            onClick={() => {
                              if (isActive) {
                                setActiveCell(null);
                                return;
                              }
                              if (val === 0) return;
                              setActiveCell({
                                op: name,
                                metric: mk.key,
                                label: mk.label,
                              });
                            }}
                            className={cn(
                              "w-full h-9 rounded-lg flex items-center justify-center",
                              "text-[11px] font-bold tabular-nums",
                              "transition-all duration-150 hover:scale-105 hover:shadow-glow",
                              "select-none",
                              val > 0 ? "cursor-pointer" : "cursor-default",
                              getCellStyle(val),
                              isActive && "ring-2 ring-primary scale-105",
                            )}
                            title={`${name} - ${mk.label}: ${val}`}
                          >
                            {val || "-"}
                          </button>

                          {/* Popover */}
                          {isActive && activeUnivs.length > 0 && (
                            <div
                              ref={popoverRef}
                              className="absolute top-full left-1/2 -translate-x-1/2 z-40 mt-2 w-56 bg-surface-container-high border border-outline-variant/20 rounded-xl shadow-elevated overflow-hidden"
                            >
                              <div className="px-3 py-2 border-b border-outline-variant/10 flex items-center justify-between">
                                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">
                                  {name} · {activeCell.label}
                                </span>
                                <span className="text-[9px] font-bold text-primary tabular-nums">
                                  {activeUnivs.length}건
                                </span>
                              </div>
                              <div className="max-h-[240px] overflow-y-auto py-1">
                                {activeUnivs.map((u) => (
                                  <div
                                    key={u.universityName}
                                    className="px-3 py-1.5 flex items-center justify-between gap-2 text-xs"
                                  >
                                    <span className="font-medium text-on-surface truncate">
                                      {u.universityName}
                                    </span>
                                    <span className="text-[9px] text-primary font-bold shrink-0">
                                      {u.category}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div
                      className={cn(
                        "w-16 h-9 rounded-lg flex items-center justify-center",
                        "text-[11px] font-black tabular-nums",
                        "transition-all duration-150 hover:scale-105",
                        "cursor-default select-none",
                        getTotalStyle(total, maxTotal),
                      )}
                      title={`${name} 합계: ${total}`}
                    >
                      {total}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function HeatLegend() {
  const items = [
    {
      label: "0",
      cls: "bg-surface-container-highest text-on-surface-variant/30",
    },
    { label: "1-2", cls: "bg-primary/10 text-primary" },
    { label: "3-5", cls: "bg-primary/25 text-primary" },
    { label: "6-8", cls: "bg-primary/40 text-on-primary" },
    { label: "9-12", cls: "bg-primary/60 text-on-primary" },
    { label: "13+", cls: "bg-primary text-on-primary" },
  ];

  return (
    <div className="flex items-center gap-1">
      <span className="text-[9px] text-on-surface-variant uppercase tracking-widest mr-1">
        밀도
      </span>
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "h-5 px-2 rounded flex items-center justify-center",
            "text-[9px] font-bold",
            item.cls,
          )}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}
