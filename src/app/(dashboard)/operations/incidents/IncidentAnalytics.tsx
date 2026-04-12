"use client";

import { useMemo } from "react";
import { Card } from "@/components/common";
import {
  IconCategory,
  IconCalendarStats,
  IconUser,
  IconBuilding,
  IconBriefcase,
  IconCircleCheck,
  IconMessageReport,
} from "@tabler/icons-react";

interface Incident {
  id: number;
  title: string;
  incident_date: string;
  university: string | null;
  category: string | null;
  department: string | null;
  reporter: string;
  assignee: string | null;
  severity: string;
  status: string;
  background: string | null;
  cause: string | null;
  resolution: string | null;
  prevention: string | null;
  created_at: string;
}

interface IncidentAnalyticsProps {
  incidents: Incident[];
}

/* ------------------------------------------------------------------ */
/*  Utility: count occurrences, sort descending                       */
/* ------------------------------------------------------------------ */
function countBy<T>(items: T[], keyFn: (item: T) => string | null): { key: string; count: number }[] {
  const map = new Map<string, number>();
  for (const item of items) {
    const k = keyFn(item);
    if (!k) continue;
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

/* ------------------------------------------------------------------ */
/*  Sub-component: Section header                                     */
/* ------------------------------------------------------------------ */
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-on-surface-variant">{icon}</span>
      <h3 className="text-sm font-bold text-on-surface tracking-wide">{title}</h3>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-component: Horizontal bar row                                 */
/* ------------------------------------------------------------------ */
function HBar({ label, count, max, rank }: { label: string; count: number; max: number; rank?: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3 group">
      {rank !== undefined && (
        <span className="text-[11px] font-bold text-on-surface-variant w-4 text-right tabular-nums shrink-0">
          {rank}
        </span>
      )}
      <span className="text-xs text-on-surface w-28 shrink-0 truncate" title={label}>
        {label}
      </span>
      <div className="flex-1 h-5 bg-surface-container-high rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
      <span className="text-xs font-bold text-on-surface tabular-nums w-10 text-right shrink-0">
        {count}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-component: Donut segment (CSS-only ring)                      */
/* ------------------------------------------------------------------ */
function DonutChart({ segments }: { segments: { label: string; count: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.count, 0);
  if (total === 0) return null;

  // Build conic-gradient stops
  let cumulative = 0;
  const stops: string[] = [];
  for (const seg of segments) {
    const pct = (seg.count / total) * 100;
    stops.push(`${seg.color} ${cumulative}% ${cumulative + pct}%`);
    cumulative += pct;
  }

  return (
    <div className="flex items-center gap-8">
      <div
        className="w-36 h-36 rounded-full shrink-0"
        style={{
          background: `conic-gradient(${stops.join(", ")})`,
          mask: "radial-gradient(farthest-side, transparent 60%, #000 61%)",
          WebkitMask: "radial-gradient(farthest-side, transparent 60%, #000 61%)",
        }}
      />
      <div className="flex flex-col gap-2">
        {segments.map((seg) => {
          const pct = total > 0 ? ((seg.count / total) * 100).toFixed(1) : "0";
          return (
            <div key={seg.label} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-xs text-on-surface">{seg.label}</span>
              <span className="text-xs font-bold text-on-surface tabular-nums ml-auto">{seg.count}</span>
              <span className="text-[11px] text-on-surface-variant tabular-nums w-12 text-right">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  MAIN COMPONENT                                                    */
/* ================================================================== */
export default function IncidentAnalytics({ incidents }: IncidentAnalyticsProps) {
  /* ---------- a. 분류별 통계 ---------- */
  const categoryStats = useMemo(() => countBy(incidents, (i) => i.category), [incidents]);
  const categoryMax = categoryStats[0]?.count ?? 0;

  /* ---------- b. 월별 추이 ---------- */
  const monthlyStats = useMemo(() => {
    const map = new Map<string, number>();
    for (const inc of incidents) {
      const d = inc.incident_date ?? inc.created_at;
      if (!d) continue;
      const month = d.slice(0, 7); // "YYYY-MM"
      map.set(month, (map.get(month) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [incidents]);
  const monthlyMax = useMemo(
    () => Math.max(...monthlyStats.map((m) => m.count), 1),
    [monthlyStats],
  );

  /* ---------- c. 운영자별 통계 ---------- */
  const assigneeStats = useMemo(() => countBy(incidents, (i) => i.assignee).slice(0, 15), [incidents]);
  const assigneeMax = assigneeStats[0]?.count ?? 0;

  /* ---------- d. 대학별 통계 ---------- */
  const uniStats = useMemo(() => countBy(incidents, (i) => i.university).slice(0, 15), [incidents]);
  const uniMax = uniStats[0]?.count ?? 0;

  /* ---------- e. 부서별 통계 ---------- */
  const deptStats = useMemo(() => {
    const targets = ["운영부", "대학영업", "영업기획", "개발부"];
    const map = new Map<string, number>();
    for (const t of targets) map.set(t, 0);
    for (const inc of incidents) {
      const d = inc.department;
      if (d && map.has(d)) {
        map.set(d, (map.get(d) ?? 0) + 1);
      }
    }
    return targets.map((t) => ({ key: t, count: map.get(t) ?? 0 }));
  }, [incidents]);

  /* ---------- f. 상태별 현황 ---------- */
  const statusSegments = useMemo(() => {
    const order = [
      { label: "처리완료", color: "var(--color-primary, #4f8cff)" },
      { label: "할 일", color: "#f59e0b" },
      { label: "진행 중", color: "#3b82f6" },
      { label: "보류", color: "#ef4444" },
      { label: "처리예정", color: "#8b5cf6" },
    ];
    const map = new Map<string, number>();
    for (const inc of incidents) {
      map.set(inc.status, (map.get(inc.status) ?? 0) + 1);
    }
    const segments = order
      .map((o) => ({ ...o, count: map.get(o.label) ?? 0 }))
      .filter((s) => s.count > 0);

    // Remaining statuses not in the predefined list
    for (const [label, count] of map.entries()) {
      if (!order.some((o) => o.label === label)) {
        segments.push({ label, count, color: "#94a3b8" });
      }
    }
    return segments;
  }, [incidents]);

  /* ---------- g. 원인 키워드 분석 ---------- */
  const keywords = useMemo(() => {
    const stopWords = new Set([
      "및", "또는", "등", "의", "에", "를", "을", "이", "가", "은", "는",
      "로", "으로", "에서", "와", "과", "도", "인", "한", "된", "할",
      "수", "것", "대한", "하는", "있는", "없는", "있음", "없음",
      "해당", "관련", "통해", "위해", "때문", "위한", "하여",
      "그", "이후", "후", "중", "내", "대해", "않은", "안", "못",
      "했음", "함", "됨", "임", "있어", "있을", "하고", "되어",
      "처리", "발생", "확인", "진행", "완료", "요청", "해결", "내용", "결과",
      "대학", "대학교", "사항", "이상", "부분", "경우", "현재", "상태", "문제",
      "오류", "수정", "변경", "안내", "담당", "담당자", "운영자", "매니저",
      "페이지", "시스템", "서비스", "접수", "모집", "전형", "학년도",
    ]);
    const map = new Map<string, number>();
    for (const inc of incidents) {
      // 경위 + 원인 + 처리 모두에서 키워드 추출
      const text = [inc.background, inc.cause, inc.resolution].filter(Boolean).join(" ");
      if (!text) continue;
      const tokens = text
        .replace(/[.,;:!?()[\]{}"'`~@#$%^&*+=<>/\\|_\-\d]/g, " ")
        .split(/\s+/)
        .filter((t) => t.length >= 2 && !stopWords.has(t));
      const seen = new Set<string>();
      for (const token of tokens) {
        if (seen.has(token)) continue;
        seen.add(token);
        map.set(token, (map.get(token) ?? 0) + 1);
      }
    }
    return Array.from(map.entries())
      .map(([word, count]) => ({ word, count }))
      .filter((w) => w.count >= 2)
      .sort((a, b) => b.count - a.count)
      .slice(0, 50);
  }, [incidents]);
  const kwMax = keywords[0]?.count ?? 1;
  const kwMin = keywords.length > 0 ? keywords[keywords.length - 1].count : 1;

  return (
    <div className="space-y-6">
      {/* Row 1: 분류별 + 상태별 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* a. 분류별 통계 */}
        <Card className="p-5">
          <SectionHeader icon={<IconCategory size={16} />} title="분류별 통계" />
          <div className="space-y-2">
            {categoryStats.map((s) => (
              <HBar key={s.key} label={s.key} count={s.count} max={categoryMax} />
            ))}
          </div>
        </Card>

        {/* f. 상태별 현황 */}
        <Card className="p-5">
          <SectionHeader icon={<IconCircleCheck size={16} />} title="상태별 현황" />
          <div className="flex items-center justify-center py-4">
            <DonutChart segments={statusSegments} />
          </div>
        </Card>
      </div>

      {/* Row 2: 월별 추이 */}
      <Card className="p-5">
        <SectionHeader icon={<IconCalendarStats size={16} />} title="월별 추이" />
        <div className="overflow-x-auto">
          <div className="flex items-end gap-1.5 min-w-max" style={{ height: 180 }}>
            {monthlyStats.map((m) => {
              const h = (m.count / monthlyMax) * 150;
              return (
                <div key={m.month} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-on-surface tabular-nums">{m.count}</span>
                  <div
                    className="w-8 bg-primary rounded-t-md transition-all duration-500"
                    style={{ height: Math.max(h, 4) }}
                  />
                  <span className="text-[10px] text-on-surface-variant tabular-nums whitespace-nowrap -rotate-45 origin-top-left translate-y-1">
                    {m.month.slice(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Row 3: 운영자별 + 대학별 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* c. 운영자별 통계 */}
        <Card className="p-5">
          <SectionHeader icon={<IconUser size={16} />} title="운영자별 통계" />
          <div className="space-y-2">
            {assigneeStats.map((s, idx) => (
              <HBar key={s.key} label={s.key} count={s.count} max={assigneeMax} rank={idx + 1} />
            ))}
            {assigneeStats.length === 0 && (
              <p className="text-xs text-on-surface-variant py-4 text-center">데이터 없음</p>
            )}
          </div>
        </Card>

        {/* d. 대학별 통계 */}
        <Card className="p-5">
          <SectionHeader icon={<IconBuilding size={16} />} title="대학별 통계 (상위 15)" />
          <div className="space-y-2">
            {uniStats.map((s, idx) => (
              <HBar key={s.key} label={s.key} count={s.count} max={uniMax} rank={idx + 1} />
            ))}
            {uniStats.length === 0 && (
              <p className="text-xs text-on-surface-variant py-4 text-center">데이터 없음</p>
            )}
          </div>
        </Card>
      </div>

      {/* Row 4: 부서별 + 키워드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* e. 부서별 통계 */}
        <Card className="p-5">
          <SectionHeader icon={<IconBriefcase size={16} />} title="부서별 통계" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {deptStats.map((d) => (
              <div
                key={d.key}
                className="flex flex-col items-center gap-1 bg-surface-container-high rounded-xl py-5 px-3"
              >
                <span className="text-2xl font-black text-on-surface tabular-nums">{d.count}</span>
                <span className="text-xs font-medium text-on-surface-variant">{d.key}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* g. 원인 키워드 분석 */}
        <Card className="p-5">
          <SectionHeader icon={<IconMessageReport size={16} />} title="주요 키워드 분석" />
          {keywords.length > 0 ? (
            <div className="flex flex-wrap gap-2 items-center">
              {keywords.map((kw) => {
                // Map count to font size between 11px and 24px
                const ratio = kwMax === kwMin ? 0.5 : (kw.count - kwMin) / (kwMax - kwMin);
                const fontSize = 11 + ratio * 13;
                const opacity = 0.5 + ratio * 0.5;
                return (
                  <span
                    key={kw.word}
                    className="text-primary font-bold cursor-default transition-opacity hover:opacity-100"
                    style={{ fontSize, opacity }}
                    title={`${kw.word}: ${kw.count}회`}
                  >
                    {kw.word}
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-on-surface-variant py-4 text-center">키워드 데이터 없음</p>
          )}
        </Card>
      </div>
    </div>
  );
}
