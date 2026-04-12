"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { IconChevronDown, IconRefresh, IconSearch } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { ALL_OPERATORS, OPERATOR_GROUPS } from "./constants";

interface University {
  universityName: string;
  category: string;
  region: string;
  currentOperator: string;
}

interface WizardStep3Props {
  universities: University[];
  assignType: string;
  typeLabel: string;
  assignmentMap: Map<string, string>;
  originalMap: Map<string, string>;
  maxes: Record<string, number>;
  onAssignChange: (univName: string, operator: string) => void;
  onMaxChange: (op: string, value: number) => void;
  onRerun: () => void;
  onBack: () => void;
  onNext: () => void;
  pimsTab?: "full" | "select";
  onPimsTabChange?: (tab: "full" | "select") => void;
}

function getHeatColor(load: number, max: number): string {
  if (load > max) return "bg-error text-white";
  const ratio = max > 0 ? load / max : 0;
  if (ratio >= 0.95) return "bg-primary text-on-primary";
  if (ratio >= 0.8) return "bg-primary/50 text-on-primary";
  if (ratio >= 0.6) return "bg-primary/30 text-primary";
  if (ratio >= 0.3) return "bg-primary/15 text-primary";
  if (ratio > 0) return "bg-primary/8 text-primary";
  return "bg-surface-container-highest text-on-surface-variant/40";
}

function getGaugeGradient(ratio: number): string {
  if (ratio > 1)
    return "linear-gradient(90deg, rgba(255,115,81,0.35), rgba(255,115,81,0.55))";
  if (ratio >= 0.9)
    return "linear-gradient(90deg, rgba(120,160,30,0.3), rgba(120,160,30,0.5))";
  return "linear-gradient(90deg, rgba(120,160,30,0.15), rgba(120,160,30,0.35))";
}

export default function WizardStep3({
  universities,
  assignType,
  typeLabel,
  assignmentMap,
  originalMap,
  maxes,
  onAssignChange,
  onMaxChange,
  onRerun,
  onBack,
  onNext,
  pimsTab,
  onPimsTabChange,
}: WizardStep3Props) {
  const [expandedOps, setExpandedOps] = useState<Set<string>>(new Set());
  const [editingUniv, setEditingUniv] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");

  const uniqueCategories = useMemo(
    () =>
      [...new Set(universities.map((u) => u.category).filter(Boolean))].sort(),
    [universities],
  );
  const uniqueRegions = useMemo(
    () =>
      [...new Set(universities.map((u) => u.region).filter(Boolean))].sort(),
    [universities],
  );
  const popoverRef = useRef<HTMLDivElement>(null);

  const operatorLoads = useMemo(() => {
    const loads: Record<string, number> = {};
    ALL_OPERATORS.forEach((op) => {
      loads[op] = 0;
    });
    for (const [key, op] of assignmentMap.entries()) {
      if (key.endsWith(`__${assignType}`)) {
        loads[op] = (loads[op] ?? 0) + 1;
      }
    }
    return loads;
  }, [assignmentMap, assignType]);

  const matchFilter = (u: University) => {
    if (
      search &&
      !u.universityName.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (categoryFilter && u.category !== categoryFilter) return false;
    if (regionFilter && u.region !== regionFilter) return false;
    return true;
  };

  const operatorUnivs = useMemo(() => {
    const map: Record<string, University[]> = {};
    ALL_OPERATORS.forEach((op) => {
      map[op] = [];
    });
    for (const u of universities) {
      const assigned =
        assignmentMap.get(`${u.universityName}__${assignType}`) ?? "";
      if (assigned && map[assigned] && matchFilter(u)) {
        map[assigned].push(u);
      }
    }
    return map;
  }, [
    universities,
    assignmentMap,
    assignType,
    search,
    categoryFilter,
    regionFilter,
  ]);

  const unassigned = useMemo(
    () =>
      universities.filter((u) => {
        const hasAssign = assignmentMap.has(
          `${u.universityName}__${assignType}`,
        );
        if (hasAssign) return false;
        return matchFilter(u);
      }),
    [
      universities,
      assignmentMap,
      assignType,
      search,
      categoryFilter,
      regionFilter,
    ],
  );

  const totalCount = universities.length;
  const assignedCount = universities.filter((u) =>
    assignmentMap.has(`${u.universityName}__${assignType}`),
  ).length;
  const unassignedCount = totalCount - assignedCount;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setEditingUniv(null);
      }
    }
    if (editingUniv) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [editingUniv]);

  function toggleLane(op: string) {
    setExpandedOps((prev) => {
      const next = new Set(prev);
      if (next.has(op)) next.delete(op);
      else next.add(op);
      return next;
    });
  }

  function renderPopover(univName: string) {
    const currentOp = assignmentMap.get(`${univName}__${assignType}`) ?? "";
    return (
      <div
        ref={popoverRef}
        className="absolute top-full left-0 z-30 mt-1 w-48 bg-surface-container-high border border-outline-variant/20 rounded-xl shadow-elevated overflow-hidden"
      >
        <div className="px-3 py-2 border-b border-outline-variant/10">
          <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">
            운영자 선택
          </span>
        </div>
        <div className="max-h-[240px] overflow-y-auto py-1">
          {OPERATOR_GROUPS.map((g) => (
            <div key={g.group}>
              <div className="px-3 pt-1.5 pb-0.5">
                <span className="text-[8px] font-bold text-primary uppercase tracking-widest">
                  {g.label}
                </span>
              </div>
              {g.operators.map((op) => {
                const ld = operatorLoads[op] ?? 0;
                const mx = maxes[op] ?? 15;
                return (
                  <button
                    key={op}
                    type="button"
                    onClick={() => {
                      onAssignChange(univName, op);
                      setEditingUniv(null);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors",
                      currentOp === op
                        ? "bg-primary/10 text-primary"
                        : "text-on-surface hover:bg-surface-container-highest",
                    )}
                  >
                    <span className="font-medium">{op}</span>
                    <span
                      className={cn(
                        "text-[10px] tabular-nums",
                        ld > mx
                          ? "text-error font-bold"
                          : "text-on-surface-variant",
                      )}
                    >
                      {ld}/{mx}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  function isChanged(univName: string) {
    const key = `${univName}__${assignType}`;
    return (assignmentMap.get(key) ?? "") !== (originalMap.get(key) ?? "");
  }

  function toggleEditing(univName: string) {
    setEditingUniv(editingUniv === univName ? null : univName);
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-on-surface">
              배정 — <span className="text-primary">{typeLabel}</span>
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">
              운영자 레인을 클릭하면 배정된 대학 목록이 펼쳐집니다.
            </p>
          </div>

          {/* PIMS tab toggle */}
          {pimsTab && onPimsTabChange && (
            <div className="flex bg-surface-container-highest rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => onPimsTabChange("full")}
                className={cn(
                  "px-3 py-1.5 rounded-md text-[11px] font-bold transition-all",
                  pimsTab === "full"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface",
                )}
              >
                전체사용
              </button>
              <button
                type="button"
                onClick={() => onPimsTabChange("select")}
                className={cn(
                  "px-3 py-1.5 rounded-md text-[11px] font-bold transition-all",
                  pimsTab === "select"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface",
                )}
              >
                선택사용
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter bar (서비스관리 스타일) */}
      <div className="flex items-center gap-3 flex-wrap mb-3">
        <div className="relative flex-1 min-w-[200px]">
          <IconSearch
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="대학명 검색..."
            className="search-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-on-surface focus:outline-none transition-colors"
          />
        </div>
        {uniqueCategories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="search-input px-4 py-2.5 rounded-xl text-sm font-medium text-on-surface focus:outline-none transition-colors appearance-none cursor-pointer min-w-[140px]"
          >
            <option value="">전체 분류</option>
            {uniqueCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-on-surface-variant mb-4">
        <span>
          전체 <b className="text-on-surface">{totalCount}</b>
        </span>
        <span className="text-outline-variant">|</span>
        <span>
          배정 <b className="text-primary">{assignedCount}</b>
        </span>
        <span className="text-outline-variant">|</span>
        <span>
          미배정 <b className="text-error">{unassignedCount}</b>
        </span>
      </div>

      {/* Unassigned Pool */}
      {unassigned.length > 0 && (
        <div className="border border-dashed border-error/20 bg-error/[0.03] rounded-xl p-3 mb-4">
          <span className="text-[11px] font-extrabold text-error block mb-2">
            미배정 대학 {unassigned.length}개
          </span>
          <div className="flex gap-1 flex-wrap">
            {unassigned.map((u) => (
              <div key={u.universityName} className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setEditingUniv(
                      editingUniv === u.universityName
                        ? null
                        : u.universityName,
                    )
                  }
                  className="px-[10px] py-1 bg-error/8 border border-error/20 rounded-md text-xs font-semibold text-on-surface hover:bg-error/15 hover:border-error/40 transition-all cursor-pointer"
                >
                  {u.universityName}
                  <span className="text-[8px] text-error ml-1">{u.region}</span>
                </button>
                {editingUniv === u.universityName &&
                  renderPopover(u.universityName)}
              </div>
            ))}
          </div>
        </div>
      )}

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
              const univs = operatorUnivs[op] ?? [];
              const load = operatorLoads[op] ?? 0;
              const max = maxes[op] ?? 15;
              const ratio = max > 0 ? load / max : 0;
              const fillPct = Math.min(ratio * 100, 100);
              const isExpanded = expandedOps.has(op);
              const groupLabel = group.label;

              return (
                <div
                  key={op}
                  className={cn(
                    "mb-2 rounded-[10px] bg-surface-container border transition-all",
                    isExpanded
                      ? "border-outline-variant/15 overflow-visible"
                      : "border-outline-variant/5 hover:border-outline-variant/10 overflow-hidden",
                  )}
                >
                  {/* Lane Header */}
                  <button
                    type="button"
                    onClick={() => toggleLane(op)}
                    className="w-full flex items-center gap-0 cursor-pointer select-none"
                  >
                    {/* Left: Avatar + Name */}
                    <div className="w-[140px] shrink-0 px-3.5 py-2.5 flex items-center gap-2 border-r border-outline-variant/5">
                      <div
                        className={cn(
                          "w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-black shrink-0",
                          getHeatColor(load, max),
                        )}
                      >
                        {load}
                      </div>
                      <div className="text-left min-w-0">
                        <div className="text-[11px] font-bold text-on-surface truncate">
                          {op}
                        </div>
                        <div className="text-[8px] text-on-surface-variant">
                          {groupLabel} · {load}/{max}
                        </div>
                      </div>
                    </div>

                    {/* Center: Gauge */}
                    <div className="flex-1 px-3.5 py-2 flex items-center gap-2 min-h-[44px]">
                      <div className="flex-1 h-7 bg-surface-dim rounded-md relative">
                        {/* Gauge fill */}
                        <div
                          className="absolute inset-y-0 left-0 rounded-md transition-[width] duration-400 ease-out"
                          style={{
                            width: `${fillPct}%`,
                            background: getGaugeGradient(ratio),
                          }}
                        />
                        {/* Chips overlay (full width) */}
                        <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex gap-0.5 overflow-hidden">
                          {univs.slice(0, 8).map((u) => {
                            const key = `${u.universityName}__${assignType}`;
                            const isChanged =
                              (assignmentMap.get(key) ?? "") !==
                              (originalMap.get(key) ?? "");
                            return (
                              <span
                                key={u.universityName}
                                className={cn(
                                  "px-1.5 py-0.5 rounded-sm text-[8px] font-semibold whitespace-nowrap shrink-0",
                                  isChanged
                                    ? "bg-tertiary/30 text-on-surface dark:bg-tertiary/20 dark:text-tertiary"
                                    : "bg-primary/20 text-on-surface dark:bg-on-surface/10 dark:text-on-surface",
                                )}
                              >
                                {u.universityName.replace("대학교", "대")}
                              </span>
                            );
                          })}
                        </div>
                        {/* Count badge */}
                        {load > 0 && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-primary bg-surface/80 px-1.5 rounded z-10">
                            {load}개
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: MAX */}
                    <div className="w-[50px] shrink-0 text-center py-2 border-l border-outline-variant/5">
                      <div className="text-sm font-black text-on-surface">
                        {max}
                      </div>
                      <div className="text-[7px] text-on-surface-variant uppercase">
                        MAX
                      </div>
                    </div>

                    {/* Expand indicator */}
                    <div className="pr-2">
                      <IconChevronDown
                        size={14}
                        className={cn(
                          "text-on-surface-variant transition-transform",
                          isExpanded && "rotate-180",
                        )}
                      />
                    </div>
                  </button>

                  {/* Lane Detail (expanded) */}
                  {isExpanded && (
                    <div className="px-3.5 pb-3">
                      <div className="flex gap-1 flex-wrap pt-2 border-t border-outline-variant/5">
                        {univs.map((u) => {
                          const key = `${u.universityName}__${assignType}`;
                          const isChanged =
                            (assignmentMap.get(key) ?? "") !==
                            (originalMap.get(key) ?? "");
                          const isEditing = editingUniv === u.universityName;

                          return (
                            <div key={u.universityName} className="relative">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingUniv(
                                    isEditing ? null : u.universityName,
                                  );
                                }}
                                className={cn(
                                  "flex items-center gap-1.5 px-2.5 py-[5px] rounded-md text-[10px] border transition-all",
                                  "hover:border-primary/30",
                                  "group",
                                  isChanged
                                    ? "border-tertiary/30 bg-tertiary/10"
                                    : "border-outline-variant/15 bg-surface-container-high",
                                )}
                              >
                                <span className="font-semibold text-on-surface">
                                  {u.universityName}
                                </span>
                                <span className="text-[8px] text-on-surface-variant">
                                  {u.region}
                                </span>
                                <span className="text-[8px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                  변경
                                </span>
                              </button>
                              {isEditing && renderPopover(u.universityName)}
                            </div>
                          );
                        })}
                        {univs.length === 0 && (
                          <span className="text-[10px] text-on-surface-variant/50 italic py-2">
                            배정된 대학이 없습니다
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Fixed Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface-container border-t border-outline-variant/10 px-5 py-2.5 flex items-center justify-between z-50">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface-variant text-[11px] font-bold hover:bg-surface-bright transition-colors"
        >
          ← 시뮬레이션
        </button>

        <div className="flex items-center gap-3 text-[11px] text-on-surface-variant">
          <span>
            배정{" "}
            <span className="font-extrabold text-primary">
              {assignedCount}/{totalCount}
            </span>
          </span>
          <span className="text-outline-variant">·</span>
          <span>
            미배정{" "}
            <span className="font-extrabold text-error">{unassignedCount}</span>
          </span>
          <button
            type="button"
            onClick={onRerun}
            className="flex items-center gap-1 text-[10px] text-on-surface-variant hover:text-primary transition-colors ml-2"
          >
            <IconRefresh size={10} />
            재실행
          </button>
        </div>

        <button
          type="button"
          onClick={onNext}
          className="px-5 py-2 rounded-lg bg-primary text-on-primary text-[11px] font-bold hover:bg-primary-dim transition-colors"
        >
          최종 확인 →
        </button>
      </div>
    </div>
  );
}
