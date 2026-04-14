"use client";

import { useMemo } from "react";
import { cn } from "@/lib/cn";
import type { UniversityData } from "./AssignmentExplorer";
import type { OperatorSummary } from "@/lib/sharepoint";

interface OperatorDetailProps {
  operatorName: string;
  universities: UniversityData[];
  summary: OperatorSummary | null;
  onSelectUniversity: (name: string) => void;
}

interface Section {
  label: string;
  key: string;
  items: UniversityData[];
  color: "primary" | "tertiary" | "secondary" | "neutral";
}

const MAIN_CATS = new Set(["4년제", "전문대학", "폴리텍"]);

const COLOR_STYLES = {
  primary: "border-l-primary/60 bg-primary/[0.03]",
  tertiary: "border-l-tertiary/60 bg-tertiary/[0.03]",
  secondary: "border-l-secondary/60 bg-secondary-container/[0.03]",
  neutral: "border-l-outline-variant/40 bg-surface-container-high/30",
} as const;

const TAG_STYLES = {
  primary: "text-primary",
  tertiary: "text-tertiary",
  secondary: "text-on-secondary-container",
  neutral: "text-on-surface-variant",
} as const;

function getDeveloper(u: UniversityData, sectionKey: string): string {
  switch (sectionKey) {
    case "susi":
    case "k12":
    case "special":
    case "etc":
    case "school":
      return u.main?.devSusi ?? "";
    case "jungsi":
      return u.main?.devJungsi ?? "";
    case "jaewoe":
      return u.main?.devJaewoe ?? "";
    case "foreigner":
      return u.main?.devForeigner ?? "";
    case "pyeonip":
      return u.main?.devPyeonip ?? "";
    case "grad":
      return u.grad?.developer ?? "";
    case "score":
      return u.score?.developer ?? "";
    case "app":
      return u.app?.developer ?? "";
    default:
      return "";
  }
}

export default function OperatorDetail({
  operatorName,
  universities,
  summary,
  onSelectUniversity,
}: OperatorDetailProps) {
  const sections = useMemo(() => {
    const defs: {
      label: string;
      key: string;
      color: Section["color"];
      match: (u: UniversityData) => boolean;
    }[] = [
      {
        label: "재외국민",
        key: "jaewoe",
        color: "primary",
        match: (u) => u.main?.jaewoe === operatorName,
      },
      {
        label: "수시",
        key: "susi",
        color: "primary",
        match: (u) =>
          u.main?.opSusi === operatorName && MAIN_CATS.has(u.category ?? ""),
      },
      {
        label: "정시",
        key: "jungsi",
        color: "primary",
        match: (u) =>
          u.main?.opJungsi === operatorName && MAIN_CATS.has(u.category ?? ""),
      },
      {
        label: "외국인",
        key: "foreigner",
        color: "primary",
        match: (u) => u.main?.foreigner === operatorName,
      },
      {
        label: "편입",
        key: "pyeonip",
        color: "primary",
        match: (u) => u.main?.pyeonip === operatorName,
      },
      {
        label: "초중고",
        key: "k12",
        color: "neutral",
        match: (u) =>
          u.main?.opSusi === operatorName && u.category === "초중고",
      },
      {
        label: "특수대학",
        key: "special",
        color: "neutral",
        match: (u) =>
          u.main?.opSusi === operatorName && u.category === "특수대학",
      },
      {
        label: "기타",
        key: "etc",
        color: "neutral",
        match: (u) => u.main?.opSusi === operatorName && u.category === "기타",
      },
      {
        label: "전문학교",
        key: "school",
        color: "neutral",
        match: (u) =>
          u.main?.opSusi === operatorName &&
          (u.category ?? "").includes("전문학교"),
      },
      {
        label: "대학원",
        key: "grad",
        color: "tertiary",
        match: (u) => u.grad?.operator === operatorName,
      },
      {
        label: "PIMS 전체",
        key: "pims-full",
        color: "secondary",
        match: (u) => u.pims?.operatorFull === operatorName,
      },
      {
        label: "PIMS 선택",
        key: "pims-select",
        color: "secondary",
        match: (u) => u.pims?.operatorReception === operatorName,
      },
      {
        label: "성적산출",
        key: "score",
        color: "neutral",
        match: (u) => u.score?.operator === operatorName,
      },
      {
        label: "상담앱",
        key: "app",
        color: "neutral",
        match: (u) => u.app?.operator === operatorName,
      },
    ];

    return defs.reduce<Section[]>((acc, def) => {
      const items = universities.filter(def.match);
      if (items.length > 0) {
        acc.push({ label: def.label, key: def.key, items, color: def.color });
      }
      return acc;
    }, []);
  }, [universities, operatorName]);

  const totalCount = useMemo(
    () => sections.reduce((sum, s) => sum + s.items.length, 0),
    [sections],
  );

  const kpis = summary
    ? [
        { label: "재외", value: summary.etcJaewoe },
        { label: "수시", value: summary.susiTotal },
        { label: "정시", value: summary.jungsiTotal },
        { label: "외국인", value: summary.etcForeign },
        { label: "초중고", value: summary.etcK12 },
        { label: "대학원", value: summary.etcGrad },
        { label: "PIMS", value: summary.etcPimsFull + summary.etcPimsSelect },
        { label: "성적", value: summary.etcScore },
        { label: "상담앱", value: summary.etcApp },
      ].filter((k) => k.value > 0)
    : [];

  return (
    <div className="p-6 space-y-5">
      {/* Profile Header */}
      <div className="flex items-baseline gap-3">
        <h2 className="text-lg font-black text-on-surface">{operatorName}</h2>
        <span className="text-xs text-on-surface-variant">
          총 <b className="text-primary">{totalCount}</b>건
        </span>
      </div>

      {/* KPI Tiles — full width grid */}
      {kpis.length > 0 && (
        <div className="grid grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-1.5">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="py-2 rounded-lg bg-surface-container-high border border-outline-variant/10 text-center"
            >
              <div className="text-base font-black tabular-nums text-on-surface">
                {kpi.value}
              </div>
              <div className="text-[7px] font-bold uppercase tracking-widest text-on-surface-variant">
                {kpi.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sections */}
      <div className="space-y-2">
        {sections.map((section) => (
          <div
            key={section.key}
            className={cn(
              "rounded-lg border-l-[3px] p-3",
              COLOR_STYLES[section.color],
            )}
          >
            {/* Section header */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className={cn(
                  "text-[10px] font-extrabold uppercase tracking-[0.15em]",
                  TAG_STYLES[section.color],
                )}
              >
                {section.label}
              </span>
              <span className="text-[10px] tabular-nums text-on-surface-variant">
                {section.items.length}
              </span>
            </div>

            {/* University chips — compact grid */}
            <div className="flex flex-wrap gap-1">
              {section.items
                .sort((a, b) =>
                  a.universityName.localeCompare(b.universityName, "ko"),
                )
                .map((u) => {
                  const dev = getDeveloper(u, section.key);
                  return (
                    <button
                      key={u.universityName}
                      type="button"
                      onClick={() => onSelectUniversity(u.universityName)}
                      title={dev ? `개발: ${dev}` : undefined}
                      className="group/chip relative px-2 py-1 rounded text-[11px] font-medium text-on-surface bg-surface-container border border-outline-variant/10 hover:border-primary/40 hover:text-primary transition-all"
                    >
                      {u.universityName}
                      {dev && (
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded bg-surface-bright border border-outline-variant/20 shadow-elevated text-[9px] font-bold text-on-surface whitespace-nowrap opacity-0 invisible group-hover/chip:opacity-100 group-hover/chip:visible transition-all pointer-events-none z-20">
                          개발 · {dev}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {sections.length === 0 && (
        <div className="text-xs text-on-surface-variant py-8 text-center">
          배정된 대학이 없습니다.
        </div>
      )}
    </div>
  );
}
