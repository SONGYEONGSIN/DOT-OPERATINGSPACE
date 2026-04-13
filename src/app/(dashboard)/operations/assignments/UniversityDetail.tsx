"use client";

import { cn } from "@/lib/cn";
import { IconAlertTriangle } from "@tabler/icons-react";
import type { UniversityData } from "./AssignmentExplorer";

interface UniversityDetailProps {
  university: UniversityData;
  onSelectOperator: (name: string) => void;
}

type Color = "primary" | "tertiary" | "secondary" | "neutral";

const COLOR_STYLES: Record<Color, string> = {
  primary: "border-l-primary/60 bg-primary/[0.03]",
  tertiary: "border-l-tertiary/60 bg-tertiary/[0.03]",
  secondary: "border-l-secondary/60 bg-secondary-container/[0.03]",
  neutral: "border-l-outline-variant/40 bg-surface-container-high/30",
};

const TAG_STYLES: Record<Color, string> = {
  primary: "text-primary",
  tertiary: "text-tertiary",
  secondary: "text-on-secondary-container",
  neutral: "text-on-surface-variant",
};

function NameBtn({
  name,
  onClick,
}: {
  name?: string;
  onClick: (n: string) => void;
}) {
  const empty = !name || name === "-";
  if (empty)
    return <span className="text-[11px] text-on-surface-variant/30">—</span>;
  return (
    <button
      type="button"
      onClick={() => onClick(name!)}
      className="text-[11px] font-bold text-on-surface hover:text-primary transition-colors"
    >
      {name}
    </button>
  );
}

interface FieldDef {
  label: string;
  name?: string;
}

interface SectionDef {
  label: string;
  color: Color;
  leftLabel: string;
  rightLabel: string;
  left: FieldDef[];
  right: FieldDef[];
}

export default function UniversityDetail({
  university: u,
  onSelectOperator,
}: UniversityDetailProps) {
  const sections: SectionDef[] = [];

  if (u.main) {
    sections.push({
      label: "수시 / 정시",
      color: "primary",
      leftLabel: "운영",
      rightLabel: "개발",
      left: [
        { label: "수시", name: u.main.opSusi },
        { label: "정시", name: u.main.opJungsi },
        ...(u.main.jaewoe ? [{ label: "재외국민", name: u.main.jaewoe }] : []),
        ...(u.main.foreigner
          ? [{ label: "외국인", name: u.main.foreigner }]
          : []),
        ...(u.main.pyeonip ? [{ label: "편입", name: u.main.pyeonip }] : []),
      ],
      right: [
        { label: "수시", name: u.main.devSusi },
        { label: "정시", name: u.main.devJungsi },
      ],
    });
  }

  if (u.grad) {
    sections.push({
      label: "대학원",
      color: "tertiary",
      leftLabel: "운영",
      rightLabel: "개발",
      left: [{ label: "담당", name: u.grad.operator }],
      right: [{ label: "담당", name: u.grad.developer }],
    });
  }

  if (u.pims) {
    sections.push({
      label: "PIMS",
      color: "secondary",
      leftLabel: "전체사용",
      rightLabel: "선택사용",
      left: [{ label: "담당", name: u.pims.operatorFull }],
      right: [{ label: "담당", name: u.pims.operatorReception }],
    });
  }

  if (u.score) {
    sections.push({
      label: "성적산출",
      color: "neutral",
      leftLabel: "운영",
      rightLabel: "개발",
      left: [{ label: "담당", name: u.score.operator }],
      right: [{ label: "담당", name: u.score.developer }],
    });
  }

  if (u.app) {
    sections.push({
      label: "상담앱",
      color: "neutral",
      leftLabel: "운영",
      rightLabel: "개발",
      left: [{ label: "담당", name: u.app.operator }],
      right: [{ label: "담당", name: u.app.developer }],
    });
  }

  const hasChanged = u.changed?.includes("변경");

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap border-b border-outline-variant/10 pb-4">
        <h2 className="text-lg font-black text-on-surface">
          {u.universityName}
        </h2>
        <div className="flex items-center gap-2 text-[10px]">
          {u.category && (
            <span className="font-bold px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant">
              {u.category}
            </span>
          )}
          {u.region && (
            <span className="text-on-surface-variant">{u.region}</span>
          )}
          {hasChanged && (
            <span className="flex items-center gap-0.5 font-bold text-error">
              <IconAlertTriangle size={10} />
              {u.changed}
            </span>
          )}
          {u.salesperson && (
            <>
              <span className="text-outline-variant">·</span>
              <span className="text-on-surface-variant">
                영업{" "}
                <span className="font-bold text-on-surface">
                  {u.salesperson}
                </span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-2">
        {sections.map((sec) => {
          const hasData =
            sec.left.some((f) => f.name && f.name !== "-") ||
            sec.right.some((f) => f.name && f.name !== "-");
          if (!hasData) return null;

          return (
            <div
              key={sec.label}
              className={cn(
                "rounded-lg border-l-[3px] overflow-hidden",
                COLOR_STYLES[sec.color],
              )}
            >
              {/* Section title */}
              <div className="px-3 pt-3 pb-2">
                <span
                  className={cn(
                    "text-[10px] font-extrabold uppercase tracking-[0.15em]",
                    TAG_STYLES[sec.color],
                  )}
                >
                  {sec.label}
                </span>
              </div>

              {/* Rows */}
              <div className="grid grid-cols-2 px-3">
                {/* Left column */}
                <div className="pb-3">
                  <div className="py-1.5 mb-0.5">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 dark:bg-primary/15 px-2 py-1 rounded">
                      {sec.leftLabel}
                    </span>
                  </div>
                  {sec.left.map((f) => (
                    <div
                      key={f.label}
                      className="flex items-center justify-between py-1.5 border-b border-outline-variant/5 last:border-b-0"
                    >
                      <span className="text-[10px] text-on-surface-variant/50">
                        {f.label}
                      </span>
                      <NameBtn name={f.name} onClick={onSelectOperator} />
                    </div>
                  ))}
                </div>
                {/* Right column */}
                <div className="pb-3 pl-4 border-l border-outline-variant/5">
                  <div className="py-1.5 mb-0.5">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 dark:bg-primary/15 px-2 py-1 rounded">
                      {sec.rightLabel}
                    </span>
                  </div>
                  {sec.right.map((f) => (
                    <div
                      key={f.label}
                      className="flex items-center justify-between py-1.5 border-b border-outline-variant/5 last:border-b-0"
                    >
                      <span className="text-[10px] text-on-surface-variant/50">
                        {f.label}
                      </span>
                      <NameBtn name={f.name} onClick={onSelectOperator} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Remark */}
      {u.remark && (
        <div className="rounded-lg border-l-[3px] border-l-outline-variant/40 bg-surface-container-high/30 p-3">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-on-surface-variant">
            비고
          </span>
          <p className="text-xs text-on-surface-variant mt-1">{u.remark}</p>
        </div>
      )}
    </div>
  );
}
