# 담당자 배정 (운영) 리디자인 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 운영 > 담당자배정 페이지를 분할 패널(Master-Detail) 구조로 재설계하여 운영자↔대학 양방향 탐색을 지원한다.

**Architecture:** Server Component(page.tsx)에서 데이터를 fetch하고 통합한 뒤, Client Component(AssignmentExplorer)에 전달. Explorer 내부에서 mode/selectedId 상태로 왼쪽 패널(LeftPanel)과 오른쪽 상세(OperatorDetail/UniversityDetail)를 전환한다.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS 4, SharePoint Graph API (fetchAssignments)

---

## File Structure

```
src/app/(dashboard)/operations/assignments/
├── page.tsx                  # Server: fetch + KPI + AssignmentExplorer 렌더 (rewrite)
├── AssignmentExplorer.tsx    # Client: 분할 패널 레이아웃 + 상태 관리 (new)
├── LeftPanel.tsx             # Client: 토글 + 검색 + 리스트 (new)
├── OperatorDetail.tsx        # Client: 운영자 상세 (new)
├── UniversityDetail.tsx      # Client: 대학 상세 (new)
├── AssignmentFilters.tsx     # DELETE (LeftPanel로 대체)
└── AssignmentViewTabs.tsx    # DELETE (사용 안 함)
```

---

### Task 1: 공유 타입 및 상수 정의 + AssignmentExplorer 스켈레톤

**Files:**
- Create: `src/app/(dashboard)/operations/assignments/AssignmentExplorer.tsx`

- [ ] **Step 1: AssignmentExplorer 클라이언트 컴포넌트 생성**

```tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { OperatorSummary } from "@/lib/sharepoint";
import LeftPanel from "./LeftPanel";
import OperatorDetail from "./OperatorDetail";
import UniversityDetail from "./UniversityDetail";

export interface UniversityData {
  universityName: string;
  category?: string;
  region?: string;
  salesperson?: string;
  changed?: string;
  remark?: string;
  main?: {
    opSusi: string;
    opJungsi: string;
    devSusi: string;
    devJungsi: string;
    jaewoe?: string;
    foreigner?: string;
    pyeonip?: string;
  };
  grad?: { operator: string; developer: string };
  pims?: { operatorFull: string; operatorReception: string };
  score?: { operator: string; developer: string };
  app?: { operator: string; developer: string };
}

export type PanelMode = "operator" | "university";

interface AssignmentExplorerProps {
  universities: UniversityData[];
  operatorSummary: OperatorSummary[];
}

export default function AssignmentExplorer({
  universities,
  operatorSummary,
}: AssignmentExplorerProps) {
  const [mode, setMode] = useState<PanelMode>("operator");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  function handleSelect(newMode: PanelMode, id: string) {
    setMode(newMode);
    setSelectedId(id);
  }

  const selectedUniv = selectedId && mode === "university"
    ? universities.find((u) => u.universityName === selectedId) ?? null
    : null;

  return (
    <div className="flex gap-0 border border-outline-variant/15 rounded-xl overflow-hidden bg-surface-container" style={{ height: "calc(100vh - 220px)" }}>
      {/* Left Panel */}
      <div className="w-[300px] shrink-0 border-r border-outline-variant/10 overflow-hidden flex flex-col">
        <LeftPanel
          mode={mode}
          onModeChange={setMode}
          search={search}
          onSearchChange={setSearch}
          universities={universities}
          operatorSummary={operatorSummary}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
      </div>

      {/* Right Detail */}
      <div className="flex-1 overflow-y-auto">
        {!selectedId && (
          <div className="flex items-center justify-center h-full text-on-surface-variant">
            <div className="text-center">
              <p className="text-sm font-bold">운영자 또는 대학을 선택하세요</p>
              <p className="text-xs mt-1">왼쪽 패널에서 항목을 클릭하면 상세 정보가 표시됩니다.</p>
            </div>
          </div>
        )}

        {selectedId && mode === "operator" && (
          <OperatorDetail
            operatorName={selectedId}
            universities={universities}
            summary={operatorSummary.find((o) => o.name === selectedId) ?? null}
            onSelectUniversity={(name) => handleSelect("university", name)}
          />
        )}

        {selectedId && mode === "university" && selectedUniv && (
          <UniversityDetail
            university={selectedUniv}
            onSelectOperator={(name) => handleSelect("operator", name)}
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 빌드 확인 (LeftPanel, OperatorDetail, UniversityDetail는 아직 없으므로 스텁 생성)**

임시 스텁 파일 3개 생성 (다음 태스크에서 구현):

`LeftPanel.tsx`:
```tsx
"use client";
import type { PanelMode, UniversityData } from "./AssignmentExplorer";
import type { OperatorSummary } from "@/lib/sharepoint";

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

export default function LeftPanel(props: LeftPanelProps) {
  return <div className="p-4 text-xs text-on-surface-variant">LeftPanel stub</div>;
}
```

`OperatorDetail.tsx`:
```tsx
"use client";
import type { UniversityData } from "./AssignmentExplorer";
import type { OperatorSummary } from "@/lib/sharepoint";

interface OperatorDetailProps {
  operatorName: string;
  universities: UniversityData[];
  summary: OperatorSummary | null;
  onSelectUniversity: (name: string) => void;
}

export default function OperatorDetail(props: OperatorDetailProps) {
  return <div className="p-6 text-xs text-on-surface-variant">OperatorDetail stub: {props.operatorName}</div>;
}
```

`UniversityDetail.tsx`:
```tsx
"use client";
import type { UniversityData } from "./AssignmentExplorer";

interface UniversityDetailProps {
  university: UniversityData;
  onSelectOperator: (name: string) => void;
}

export default function UniversityDetail(props: UniversityDetailProps) {
  return <div className="p-6 text-xs text-on-surface-variant">UniversityDetail stub: {props.university.universityName}</div>;
}
```

- [ ] **Step 3: 타입체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 4: 커밋**

```bash
git add src/app/\(dashboard\)/operations/assignments/AssignmentExplorer.tsx src/app/\(dashboard\)/operations/assignments/LeftPanel.tsx src/app/\(dashboard\)/operations/assignments/OperatorDetail.tsx src/app/\(dashboard\)/operations/assignments/UniversityDetail.tsx
git commit -m "feat: AssignmentExplorer 스켈레톤 + 스텁 컴포넌트 생성"
```

---

### Task 2: page.tsx 리라이트 (Server Component)

**Files:**
- Rewrite: `src/app/(dashboard)/operations/assignments/page.tsx`

- [ ] **Step 1: page.tsx를 데이터 fetch + KPI + Explorer 구조로 재작성**

```tsx
import { PageHeader, KpiGrid, KpiCard, Card } from "@/components/common";
import {
  IconSchool,
  IconUsers,
  IconNetwork,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { fetchAssignments } from "@/lib/sharepoint";
import AssignmentExplorer, { type UniversityData } from "./AssignmentExplorer";

export default async function OperatorAssignmentsPage() {
  const data = await fetchAssignments();

  if (!data) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="담당자배정"
          description="운영자/개발자 배정 현황을 조회합니다."
          breadcrumb={["운영", "담당자배정"]}
        />
        <Card className="p-16 text-center">
          <p className="text-sm text-on-surface-variant">
            데이터를 불러올 수 없습니다.
          </p>
        </Card>
      </div>
    );
  }

  const {
    operatorSummary,
    developerSummary,
    assignments,
    gradAssignments,
    pimsAssignments,
    scoreAssignments,
    appAssignments,
  } = data;

  // 대학별 통합 데이터 빌드
  const uniMap = new Map<string, UniversityData>();

  for (const a of assignments) {
    uniMap.set(a.universityName, {
      universityName: a.universityName,
      category: a.category,
      region: a.region,
      salesperson: a.salesperson,
      changed: a.changed,
      remark: a.remark,
      main: {
        opSusi: a.op2027.susi,
        opJungsi: a.op2027.jungsi,
        devSusi: a.dev2027.susi,
        devJungsi: a.dev2027.jungsi,
        jaewoe: a.op2027.jaewoe,
        foreigner: a.op2027.foreigner,
        pyeonip: a.op2027.pyeonip,
      },
    });
  }

  for (const g of gradAssignments) {
    const existing = uniMap.get(g.universityName) ?? { universityName: g.universityName };
    uniMap.set(g.universityName, {
      ...existing,
      changed: g.changed?.includes("변경") ? g.changed : existing.changed,
      grad: { operator: g.operator, developer: g.developer },
    });
  }

  for (const p of pimsAssignments) {
    const existing = uniMap.get(p.universityName) ?? {
      universityName: p.universityName,
      category: p.category,
      region: p.region,
    };
    uniMap.set(p.universityName, {
      ...existing,
      changed: p.changed?.includes("변경") ? p.changed : existing.changed,
      pims: { operatorFull: p.operatorFull, operatorReception: p.operatorReception },
    });
  }

  for (const s of scoreAssignments) {
    const existing = uniMap.get(s.universityName) ?? { universityName: s.universityName };
    uniMap.set(s.universityName, {
      ...existing,
      score: { operator: s.operator, developer: s.developer },
    });
  }

  for (const a of appAssignments) {
    const existing = uniMap.get(a.universityName) ?? { universityName: a.universityName };
    uniMap.set(a.universityName, {
      ...existing,
      app: { operator: a.operator, developer: a.developer },
    });
  }

  const allUniversities = Array.from(uniMap.values()).sort((a, b) =>
    a.universityName.localeCompare(b.universityName, "ko"),
  );

  const changedCount = allUniversities.filter((u) => u.changed?.includes("변경")).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="담당자배정"
        description={`2027학년도 운영자/개발자 배정 현황 · 총 ${assignments.length}개 대학`}
        breadcrumb={["운영", "담당자배정"]}
      />

      <KpiGrid>
        <KpiCard
          icon={<IconSchool size={18} className="text-on-surface-variant" />}
          label="배정 대학"
          value={assignments.length.toString()}
          suffix="개"
        />
        <KpiCard
          icon={<IconUsers size={18} className="text-on-surface-variant" />}
          label="운영자"
          value={operatorSummary.length.toString()}
          suffix="명"
        />
        <KpiCard
          icon={<IconNetwork size={18} className="text-on-surface-variant" />}
          label="개발자"
          value={developerSummary.length.toString()}
          suffix="명"
        />
        <KpiCard
          icon={<IconAlertTriangle size={18} className="text-on-surface-variant" />}
          label="변경"
          value={changedCount.toString()}
          suffix="건"
          alert={changedCount > 0}
        />
      </KpiGrid>

      <AssignmentExplorer
        universities={allUniversities}
        operatorSummary={operatorSummary}
      />
    </div>
  );
}
```

- [ ] **Step 2: 타입체크 + 브라우저 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음. 브라우저에서 KPI + 빈 분할 패널 표시.

- [ ] **Step 3: 커밋**

```bash
git add src/app/\(dashboard\)/operations/assignments/page.tsx
git commit -m "refactor: page.tsx 리라이트 — Server data + AssignmentExplorer 연결"
```

---

### Task 3: LeftPanel 구현

**Files:**
- Rewrite: `src/app/(dashboard)/operations/assignments/LeftPanel.tsx`

- [ ] **Step 1: LeftPanel 전체 구현**

```tsx
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
    op.susiTotal + op.jungsiTotal + op.etcJaewoe + op.etcForeign +
    op.etcK12 + op.etcGrad + op.etcPimsFull + op.etcScore + op.etcApp
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
  const q = search.toLowerCase();

  const filteredOps = useMemo(() => {
    if (!q) return operatorSummary;
    return operatorSummary.filter((op) => op.name.toLowerCase().includes(q));
  }, [operatorSummary, q]);

  const filteredUnivs = useMemo(() => {
    if (!q) return universities;
    return universities.filter((u) =>
      u.universityName.toLowerCase().includes(q),
    );
  }, [universities, q]);

  const opMap = new Map(operatorSummary.map((o) => [o.name, o]));

  return (
    <>
      {/* Toggle + Search */}
      <div className="p-3 space-y-2 border-b border-outline-variant/10">
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

        <div className="relative">
          <IconSearch
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={mode === "operator" ? "운영자 검색..." : "대학명 검색..."}
            className="search-input w-full pl-8 pr-3 py-2 rounded-lg text-xs text-on-surface focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {mode === "operator" ? (
          <div className="py-1">
            {OPERATOR_GROUPS.map((group) => {
              const ops = group.operators.filter((name) =>
                filteredOps.some((o) => o.name === name),
              );
              if (ops.length === 0) return null;
              return (
                <div key={group.group}>
                  <div className="px-3 pt-2 pb-1">
                    <span className="text-[8px] font-extrabold text-primary uppercase tracking-[0.15em]">
                      {group.label}
                    </span>
                  </div>
                  {ops.map((name) => {
                    const op = opMap.get(name);
                    const total = op ? calcTotal(op) : 0;
                    const isSelected = selectedId === name && mode === "operator";
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => onSelect("operator", name)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 text-xs transition-colors",
                          isSelected
                            ? "bg-primary/10 text-primary"
                            : "text-on-surface hover:bg-surface-container-high",
                        )}
                      >
                        <span className="font-bold">{name}</span>
                        <span className={cn(
                          "tabular-nums text-[10px]",
                          isSelected ? "text-primary font-bold" : "text-on-surface-variant",
                        )}>
                          {total}건
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-1">
            {filteredUnivs.map((u) => {
              const isSelected = selectedId === u.universityName && mode === "university";
              const isChanged = u.changed?.includes("변경");
              return (
                <button
                  key={u.universityName}
                  type="button"
                  onClick={() => onSelect("university", u.universityName)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-xs transition-colors",
                    isSelected
                      ? "bg-primary/10 text-primary"
                      : "text-on-surface hover:bg-surface-container-high",
                  )}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    {isChanged && (
                      <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0" />
                    )}
                    <span className="font-medium truncate">{u.universityName}</span>
                  </span>
                  {u.category && (
                    <span className="text-[9px] text-on-surface-variant shrink-0 ml-2">
                      {u.category}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 2: 타입체크 + 브라우저 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음. 왼쪽 패널에 토글/검색/운영자 리스트 표시.

- [ ] **Step 3: 커밋**

```bash
git add src/app/\(dashboard\)/operations/assignments/LeftPanel.tsx
git commit -m "feat: LeftPanel 구현 — 운영자/대학 토글 + 검색 + 리스트"
```

---

### Task 4: OperatorDetail 구현

**Files:**
- Rewrite: `src/app/(dashboard)/operations/assignments/OperatorDetail.tsx`

- [ ] **Step 1: OperatorDetail 전체 구현**

```tsx
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

const SECTION_TAG =
  "inline-flex items-center shrink-0 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-[0.15em] border";

const TAGS = {
  수시: `${SECTION_TAG} bg-primary/10 text-primary border-primary/30`,
  정시: `${SECTION_TAG} bg-primary/10 text-primary border-primary/30`,
  재외국민: `${SECTION_TAG} bg-surface-container-high text-on-surface-variant border-outline-variant/40`,
  외국인: `${SECTION_TAG} bg-surface-container-high text-on-surface-variant border-outline-variant/40`,
  편입: `${SECTION_TAG} bg-surface-container-high text-on-surface-variant border-outline-variant/40`,
  대학원: `${SECTION_TAG} bg-tertiary/10 text-tertiary border-tertiary/30`,
  "PIMS 전체": `${SECTION_TAG} bg-secondary-container/40 text-on-secondary-container border-outline-variant/40`,
  "PIMS 선택": `${SECTION_TAG} bg-secondary-container/40 text-on-secondary-container border-outline-variant/40`,
  성적산출: `${SECTION_TAG} bg-surface-container-high text-on-surface-variant border-outline-variant/40`,
  상담앱: `${SECTION_TAG} bg-surface-container-high text-on-surface-variant border-outline-variant/40`,
} as const;

interface Section {
  label: keyof typeof TAGS;
  univs: { name: string; category?: string }[];
}

export default function OperatorDetail({
  operatorName,
  universities,
  summary,
  onSelectUniversity,
}: OperatorDetailProps) {
  const sections = useMemo(() => {
    const result: Section[] = [];

    const susi = universities.filter((u) => u.main?.opSusi === operatorName);
    if (susi.length > 0)
      result.push({ label: "수시", univs: susi.map((u) => ({ name: u.universityName, category: u.category })) });

    const jungsi = universities.filter((u) => u.main?.opJungsi === operatorName);
    if (jungsi.length > 0)
      result.push({ label: "정시", univs: jungsi.map((u) => ({ name: u.universityName, category: u.category })) });

    const jaewoe = universities.filter((u) => u.main?.jaewoe === operatorName);
    if (jaewoe.length > 0)
      result.push({ label: "재외국민", univs: jaewoe.map((u) => ({ name: u.universityName, category: u.category })) });

    const foreigner = universities.filter((u) => u.main?.foreigner === operatorName);
    if (foreigner.length > 0)
      result.push({ label: "외국인", univs: foreigner.map((u) => ({ name: u.universityName, category: u.category })) });

    const pyeonip = universities.filter((u) => u.main?.pyeonip === operatorName);
    if (pyeonip.length > 0)
      result.push({ label: "편입", univs: pyeonip.map((u) => ({ name: u.universityName, category: u.category })) });

    const grad = universities.filter((u) => u.grad?.operator === operatorName);
    if (grad.length > 0)
      result.push({ label: "대학원", univs: grad.map((u) => ({ name: u.universityName, category: u.category })) });

    const pimsFull = universities.filter((u) => u.pims?.operatorFull === operatorName);
    if (pimsFull.length > 0)
      result.push({ label: "PIMS 전체", univs: pimsFull.map((u) => ({ name: u.universityName, category: u.category })) });

    const pimsSelect = universities.filter((u) => u.pims?.operatorReception === operatorName);
    if (pimsSelect.length > 0)
      result.push({ label: "PIMS 선택", univs: pimsSelect.map((u) => ({ name: u.universityName, category: u.category })) });

    const score = universities.filter((u) => u.score?.operator === operatorName);
    if (score.length > 0)
      result.push({ label: "성적산출", univs: score.map((u) => ({ name: u.universityName, category: u.category })) });

    const app = universities.filter((u) => u.app?.operator === operatorName);
    if (app.length > 0)
      result.push({ label: "상담앱", univs: app.map((u) => ({ name: u.universityName, category: u.category })) });

    return result;
  }, [universities, operatorName]);

  const totalCount = sections.reduce((s, sec) => s + sec.univs.length, 0);

  const kpis = summary
    ? [
        { label: "수시", value: summary.susiTotal },
        { label: "정시", value: summary.jungsiTotal },
        { label: "재외", value: summary.etcJaewoe },
        { label: "외국인", value: summary.etcForeign },
        { label: "대학원", value: summary.etcGrad },
        { label: "PIMS", value: summary.etcPimsFull + summary.etcPimsSelect },
        { label: "성적", value: summary.etcScore },
        { label: "상담앱", value: summary.etcApp },
      ].filter((k) => k.value > 0)
    : [];

  return (
    <div className="p-6 space-y-5">
      {/* Profile Header */}
      <div>
        <h2 className="text-lg font-black text-on-surface">{operatorName}</h2>
        <div className="flex items-center gap-3 mt-1 text-xs text-on-surface-variant">
          <span>총 <b className="text-primary">{totalCount}</b>건</span>
        </div>
      </div>

      {/* KPI mini tiles */}
      {kpis.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {kpis.map((k) => (
            <div
              key={k.label}
              className="px-3 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant/10 text-center"
            >
              <div className="text-sm font-black tabular-nums text-on-surface">{k.value}</div>
              <div className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest">{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((sec) => (
          <div key={sec.label}>
            <div className="flex items-center gap-2 mb-2">
              <span className={TAGS[sec.label]}>{sec.label}</span>
              <span className="text-[10px] text-on-surface-variant tabular-nums">{sec.univs.length}개</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sec.univs.map((u) => (
                <button
                  key={u.name}
                  type="button"
                  onClick={() => onSelectUniversity(u.name)}
                  className="flex items-center gap-1.5 px-2.5 py-[5px] rounded-md text-[10px] border border-outline-variant/15 bg-surface-container-high hover:border-primary/30 hover:text-primary transition-all group"
                >
                  <span className="font-semibold text-on-surface group-hover:text-primary">
                    {u.name}
                  </span>
                  {u.category && (
                    <span className="text-[8px] text-on-surface-variant">{u.category}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        {sections.length === 0 && (
          <p className="text-xs text-on-surface-variant">배정된 대학이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 타입체크 + 브라우저 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음. 운영자 클릭 시 오른쪽에 유형별 대학 칩 표시.

- [ ] **Step 3: 커밋**

```bash
git add src/app/\(dashboard\)/operations/assignments/OperatorDetail.tsx
git commit -m "feat: OperatorDetail 구현 — 유형별 섹션 카드 + 대학 칩"
```

---

### Task 5: UniversityDetail 구현

**Files:**
- Rewrite: `src/app/(dashboard)/operations/assignments/UniversityDetail.tsx`

- [ ] **Step 1: UniversityDetail 전체 구현**

```tsx
"use client";

import { cn } from "@/lib/cn";
import { IconAlertTriangle } from "@tabler/icons-react";
import type { UniversityData } from "./AssignmentExplorer";

interface UniversityDetailProps {
  university: UniversityData;
  onSelectOperator: (name: string) => void;
}

const SECTION_TAG =
  "inline-flex items-center shrink-0 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-[0.15em] border";

const TAGS = {
  primary: `${SECTION_TAG} bg-primary/10 text-primary border-primary/30`,
  tertiary: `${SECTION_TAG} bg-tertiary/10 text-tertiary border-tertiary/30`,
  secondary: `${SECTION_TAG} bg-secondary-container/40 text-on-secondary-container border-outline-variant/40`,
  neutral: `${SECTION_TAG} bg-surface-container-high text-on-surface-variant border-outline-variant/40`,
  error: `${SECTION_TAG} bg-error/10 text-error border-error/30`,
};

function OperatorLink({
  label,
  name,
  onClick,
}: {
  label: string;
  name?: string;
  onClick: (name: string) => void;
}) {
  const empty = !name || name === "-";
  return (
    <div className="flex items-baseline gap-1.5 min-w-0">
      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/70 shrink-0">
        {label}
      </span>
      {empty ? (
        <span className="text-on-surface-variant/40 font-mono">—</span>
      ) : (
        <button
          type="button"
          onClick={() => onClick(name!)}
          className="text-on-surface font-medium hover:text-primary hover:underline transition-colors truncate"
        >
          {name}
        </button>
      )}
    </div>
  );
}

export default function UniversityDetail({
  university: u,
  onSelectOperator,
}: UniversityDetailProps) {
  const hasChanged = u.changed?.includes("변경");

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-black text-on-surface">{u.universityName}</h2>
          {u.category && (
            <span className={TAGS.neutral}>{u.category}</span>
          )}
          {u.region && (
            <span className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant">
              {u.region}
            </span>
          )}
          {hasChanged && (
            <span className={cn(TAGS.error, "gap-1")}>
              <IconAlertTriangle size={10} />
              {u.changed}
            </span>
          )}
        </div>
        {u.salesperson && (
          <p className="text-xs text-on-surface-variant mt-1">
            영업담당: <span className="font-bold text-on-surface">{u.salesperson}</span>
          </p>
        )}
      </div>

      {/* Assignment sections */}
      <div className="space-y-4">
        {u.main && (u.main.opSusi || u.main.opJungsi || u.main.devSusi || u.main.devJungsi) && (
          <div className="bg-surface-container-high/50 rounded-lg p-4 border border-outline-variant/10">
            <span className={cn(TAGS.primary, "mb-3 inline-flex")}>수시 / 정시</span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-xs">
              <OperatorLink label="운영·수시" name={u.main.opSusi} onClick={onSelectOperator} />
              <OperatorLink label="운영·정시" name={u.main.opJungsi} onClick={onSelectOperator} />
              <OperatorLink label="개발·수시" name={u.main.devSusi} onClick={onSelectOperator} />
              <OperatorLink label="개발·정시" name={u.main.devJungsi} onClick={onSelectOperator} />
              {u.main.jaewoe && (
                <OperatorLink label="재외국민" name={u.main.jaewoe} onClick={onSelectOperator} />
              )}
              {u.main.foreigner && (
                <OperatorLink label="외국인" name={u.main.foreigner} onClick={onSelectOperator} />
              )}
              {u.main.pyeonip && (
                <OperatorLink label="편입" name={u.main.pyeonip} onClick={onSelectOperator} />
              )}
            </div>
          </div>
        )}

        {u.grad && (u.grad.operator || u.grad.developer) && (
          <div className="bg-surface-container-high/50 rounded-lg p-4 border border-outline-variant/10">
            <span className={cn(TAGS.tertiary, "mb-3 inline-flex")}>대학원</span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-xs">
              <OperatorLink label="운영" name={u.grad.operator} onClick={onSelectOperator} />
              <OperatorLink label="개발" name={u.grad.developer} onClick={onSelectOperator} />
            </div>
          </div>
        )}

        {u.pims && (u.pims.operatorFull || u.pims.operatorReception) && (
          <div className="bg-surface-container-high/50 rounded-lg p-4 border border-outline-variant/10">
            <span className={cn(TAGS.secondary, "mb-3 inline-flex")}>PIMS</span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-xs">
              <OperatorLink label="전체사용" name={u.pims.operatorFull} onClick={onSelectOperator} />
              <OperatorLink label="선택사용" name={u.pims.operatorReception} onClick={onSelectOperator} />
            </div>
          </div>
        )}

        {u.score && (u.score.operator || u.score.developer) && (
          <div className="bg-surface-container-high/50 rounded-lg p-4 border border-outline-variant/10">
            <span className={cn(TAGS.neutral, "mb-3 inline-flex")}>성적산출</span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-xs">
              <OperatorLink label="운영" name={u.score.operator} onClick={onSelectOperator} />
              <OperatorLink label="개발" name={u.score.developer} onClick={onSelectOperator} />
            </div>
          </div>
        )}

        {u.app && (u.app.operator || u.app.developer) && (
          <div className="bg-surface-container-high/50 rounded-lg p-4 border border-outline-variant/10">
            <span className={cn(TAGS.neutral, "mb-3 inline-flex")}>상담앱</span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-xs">
              <OperatorLink label="운영" name={u.app.operator} onClick={onSelectOperator} />
              <OperatorLink label="개발" name={u.app.developer} onClick={onSelectOperator} />
            </div>
          </div>
        )}
      </div>

      {u.remark && (
        <div className="pt-3 border-t border-outline-variant/10">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">REMARK</span>
          <p className="text-xs text-on-surface-variant mt-1">{u.remark}</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 타입체크 + 브라우저 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음. 대학 클릭 시 배정 정보 표시. 운영자명 클릭 시 운영자 뷰로 전환.

- [ ] **Step 3: 커밋**

```bash
git add src/app/\(dashboard\)/operations/assignments/UniversityDetail.tsx
git commit -m "feat: UniversityDetail 구현 — 원카드 통합 + 운영자 링크"
```

---

### Task 6: 정리 (구 파일 삭제 + 최종 확인)

**Files:**
- Delete: `src/app/(dashboard)/operations/assignments/AssignmentFilters.tsx`
- Delete: `src/app/(dashboard)/operations/assignments/AssignmentViewTabs.tsx`

- [ ] **Step 1: 구 파일 삭제**

```bash
rm src/app/\(dashboard\)/operations/assignments/AssignmentFilters.tsx
rm src/app/\(dashboard\)/operations/assignments/AssignmentViewTabs.tsx
```

- [ ] **Step 2: 타입체크 + 빌드 확인**

Run: `npx tsc --noEmit && npm run build`
Expected: 에러 없음.

- [ ] **Step 3: 전체 기능 검증**

브라우저에서 확인:
1. 운영자 모드: 그룹별 리스트 → 클릭 → 오른쪽에 유형별 대학 칩
2. 대학 모드: 가나다순 리스트 → 클릭 → 오른쪽에 배정 원카드
3. 양방향 탐색: 운영자→대학 칩 클릭→대학 상세→운영자명 클릭→운영자 상세
4. 검색: 운영자/대학 모드 각각에서 필터 동작
5. 변경 대학 빨간 도트 표시

- [ ] **Step 4: 최종 커밋**

```bash
git add -A src/app/\(dashboard\)/operations/assignments/
git commit -m "refactor: 구 파일 삭제 + 담당자배정 리디자인 완료"
```
