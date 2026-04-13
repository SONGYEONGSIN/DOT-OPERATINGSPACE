"use client";

import { useMemo } from "react";
import { IconSearch } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import type { PanelMode, UniversityData } from "./AssignmentExplorer";
import type { OperatorSummary } from "@/lib/sharepoint";
import { OPERATOR_GROUPS } from "../../admin/assignments/constants";

interface LeftPanelProps {
  mode: PanelMode;
  onModeChange: (mode: PanelMode) => void;
  search: string;
  onSearchChange: (s: string) => void;
  universities: UniversityData[];
  operatorSummary: OperatorSummary[];
  selectedId: string | null;
  onSelect: (mode: PanelMode, id: string) => void;
}

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

export default function LeftPanel({
  mode,
  onModeChange,
  search,
  onSearchChange,
  universities,
  operatorSummary,
  selectedId,
  onSelect,
}: LeftPanelProps) {
  const lowerSearch = search.toLowerCase();

  const filteredGroups = useMemo(() => {
    if (mode !== "operator") return [];
    const summaryMap = new Map(operatorSummary.map((o) => [o.name, o]));

    return OPERATOR_GROUPS.map((g) => {
      const ops = g.operators.filter((name) =>
        name.toLowerCase().includes(lowerSearch),
      );
      return { ...g, operators: ops, summaryMap };
    }).filter((g) => g.operators.length > 0);
  }, [mode, operatorSummary, lowerSearch]);

  const filteredUniversities = useMemo(() => {
    if (mode !== "university") return [];
    const catOrder: Record<string, number> = {
      "4년제": 0,
      전문대학: 1,
      폴리텍: 2,
      초중고: 3,
      특수대학: 4,
      기타: 5,
    };
    const sorted = [...universities].sort((a, b) => {
      const ca = catOrder[a.category ?? ""] ?? 9;
      const cb = catOrder[b.category ?? ""] ?? 9;
      if (ca !== cb) return ca - cb;
      return a.universityName.localeCompare(b.universityName, "ko");
    });
    if (!lowerSearch) return sorted;
    return sorted.filter((u) =>
      u.universityName.toLowerCase().includes(lowerSearch),
    );
  }, [mode, universities, lowerSearch]);

  const summaryMap = useMemo(
    () => new Map(operatorSummary.map((o) => [o.name, o])),
    [operatorSummary],
  );

  return (
    <>
      {/* Top section: toggle + search */}
      <div className="p-3 space-y-2 border-b border-outline-variant/10">
        {/* Toggle button bar */}
        <div className="flex bg-surface-container-highest rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => onModeChange("operator")}
            className={cn(
              "flex-1 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all",
              mode === "operator"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface",
            )}
          >
            운영자
          </button>
          <button
            type="button"
            onClick={() => onModeChange("university")}
            className={cn(
              "flex-1 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all",
              mode === "university"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface",
            )}
          >
            대학
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <IconSearch
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              mode === "operator" ? "운영자 검색..." : "대학명 검색..."
            }
            className="search-input w-full pl-9 pr-4 py-2 rounded-lg text-xs text-on-surface focus:outline-none"
          />
        </div>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto">
        {mode === "operator" &&
          filteredGroups.map((g) => (
            <div key={g.group}>
              {/* Group label */}
              <div className="px-3 pt-3 pb-1">
                <span className="text-[8px] font-extrabold text-primary uppercase tracking-[0.15em]">
                  {g.label}
                </span>
              </div>

              {/* Operator rows */}
              {g.operators.map((name) => {
                const summary = summaryMap.get(name);
                const total = summary ? calcTotal(summary) : 0;
                const isSelected = selectedId === name && mode === "operator";

                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => onSelect("operator", name)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-left transition-colors",
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "text-on-surface hover:bg-surface-container-highest/50",
                    )}
                  >
                    <span className="text-xs font-bold">{name}</span>
                    <span className="text-[11px] tabular-nums text-on-surface-variant">
                      {total}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}

        {mode === "university" &&
          filteredUniversities.map((u) => {
            const isSelected =
              selectedId === u.universityName && mode === "university";
            const hasChanged = u.changed?.includes("변경");

            return (
              <button
                key={u.universityName}
                type="button"
                onClick={() => onSelect("university", u.universityName)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-left transition-colors",
                  isSelected
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface hover:bg-surface-container-highest/50",
                )}
              >
                {hasChanged && (
                  <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0" />
                )}
                <span className="text-xs font-medium truncate flex-1">
                  {u.universityName}
                </span>
                {u.category && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant shrink-0">
                    {u.category}
                  </span>
                )}
              </button>
            );
          })}

        {/* Empty state */}
        {mode === "operator" && filteredGroups.length === 0 && (
          <div className="p-4 text-center text-xs text-on-surface-variant">
            검색 결과가 없습니다
          </div>
        )}
        {mode === "university" && filteredUniversities.length === 0 && (
          <div className="p-4 text-center text-xs text-on-surface-variant">
            검색 결과가 없습니다
          </div>
        )}
      </div>
    </>
  );
}
