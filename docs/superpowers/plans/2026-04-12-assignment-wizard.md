# 대학배정 위자드 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 대학배정 메뉴를 스텝 위자드 + 대시보드 구조로 전면 재설계하여 관리자가 자동배정 워크플로우를 직관적으로 수행할 수 있게 한다.

**Architecture:** 서버 컴포넌트(page.tsx)가 대시보드를 렌더링하고, 클라이언트 컴포넌트(AssignmentWizard)가 4단계 위자드를 관리한다. 기존 서버 액션(actions.ts)과 운영자 그룹(constants.ts)은 그대로 활용한다.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS 4, Supabase, SharePoint Graph API (xlsx)

---

## File Structure

| File | Responsibility | Create/Modify |
|------|---------------|---------------|
| `src/lib/sharepoint.ts` | 기초자료 시트 파싱 함수 추가 | Modify (함수 추가만) |
| `src/app/(dashboard)/admin/assignments/page.tsx` | 대시보드: 진행률 카드 + 워크로드 테이블 | Rewrite |
| `src/app/(dashboard)/admin/assignments/ProgressCards.tsx` | 9개 배정 유형별 진행률 카드 그리드 | Create |
| `src/app/(dashboard)/admin/assignments/WorkloadTable.tsx` | 운영자 15명 전체 워크로드 테이블 | Create |
| `src/app/(dashboard)/admin/assignments/AssignmentWizard.tsx` | 위자드 컨테이너 (step 상태, 데이터 흐름) | Create |
| `src/app/(dashboard)/admin/assignments/WizardStep1.tsx` | Step 1: 배정 유형 선택 + 용량 설정 | Create |
| `src/app/(dashboard)/admin/assignments/WizardStep2.tsx` | Step 2: 시뮬레이션 실행 + 결과 미리보기 | Create |
| `src/app/(dashboard)/admin/assignments/WizardStep3.tsx` | Step 3: 결과 확인 & 조정 | Create |
| `src/app/(dashboard)/admin/assignments/WizardStep4.tsx` | Step 4: 최종 확인 & 적용 | Create |

**삭제 대상 (Task 1에서 삭제):**
- `AssignmentBoard.tsx` — WizardStep3로 대체
- `AutoAssignPanel.tsx` — WizardStep2로 대체
- `CapacitySettings.tsx` — WizardStep1로 대체
- `AssignmentTypeSelector.tsx` — ProgressCards로 대체
- `SummaryCollapsible.tsx` — WorkloadTable로 대체

**수정하지 않는 파일:**
- `actions.ts` — 기존 서버 액션 그대로 사용
- `constants.ts` — 운영자 그룹 정의 (이미 업데이트 완료)

---

### Task 1: 기초자료 파싱 함수 추가

**Files:**
- Modify: `src/lib/sharepoint.ts` (함수 추가)

- [ ] **Step 1: sharepoint.ts에 BaseDataItem 인터페이스와 fetchBaseData 함수 추가**

`fetchAssignments` 함수 바로 아래에 추가한다. 같은 엑셀 파일의 기초자료 시트를 파싱한다.

```typescript
// src/lib/sharepoint.ts 맨 아래에 추가

export interface BaseDataItem {
  receptionType: string;  // 접수구분
  serviceId: number | null;  // 서비스ID
  universityName: string;  // 대학명
  region: string;  // 지역
  serviceName: string;  // 서비스명
  developer: string;  // 개발자
  operator: string;  // 운영자
  universityType: string;  // 대학구분
}

export interface OperatorBaseStats {
  name: string;
  totalServices: number;
  byType: Record<string, number>;  // receptionType별 건수
  byUnivType: Record<string, number>;  // 대학구분별 건수
}

export async function fetchBaseData(): Promise<{ items: BaseDataItem[]; operatorStats: OperatorBaseStats[] } | null> {
  const token = await getGraphToken();
  if (!token) return null;
  const driveId = process.env.SHAREPOINT_DRIVE_ID;
  const itemId = process.env.SHAREPOINT_ASSIGNMENTS_ITEM_ID;
  if (!driveId || !itemId) return null;

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/content`,
    { headers: { Authorization: `Bearer ${token}` }, redirect: "follow", cache: "no-store" },
  );
  if (!res.ok) return null;

  const buffer = Buffer.from(await res.arrayBuffer());
  const wb = XLSX.read(buffer);
  const st = (v: any) => (v != null ? String(v).trim() : "");

  // 기초자료 시트 찾기 (이름에 "기초자료" 포함)
  const baseSheetName = wb.SheetNames.find((n) => n.includes("기초자료"));
  if (!baseSheetName || !wb.Sheets[baseSheetName]) return { items: [], operatorStats: [] };

  const rows = XLSX.utils.sheet_to_json<any[]>(wb.Sheets[baseSheetName], { header: 1 });
  const items: BaseDataItem[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r?.[2]) continue; // 대학명 필수
    items.push({
      receptionType: st(r[0]),
      serviceId: typeof r[1] === "number" ? r[1] : null,
      universityName: st(r[2]),
      region: st(r[3]),
      serviceName: st(r[4]),
      developer: st(r[5]),
      operator: st(r[6]),
      universityType: st(r[7]),
    });
  }

  // 운영자별 통계 집계
  const statsMap = new Map<string, OperatorBaseStats>();
  for (const item of items) {
    if (!item.operator) continue;
    let stat = statsMap.get(item.operator);
    if (!stat) {
      stat = { name: item.operator, totalServices: 0, byType: {}, byUnivType: {} };
      statsMap.set(item.operator, stat);
    }
    stat.totalServices++;
    stat.byType[item.receptionType] = (stat.byType[item.receptionType] ?? 0) + 1;
    stat.byUnivType[item.universityType] = (stat.byUnivType[item.universityType] ?? 0) + 1;
  }

  return { items, operatorStats: [...statsMap.values()].sort((a, b) => b.totalServices - a.totalServices) };
}
```

- [ ] **Step 2: TypeScript 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add src/lib/sharepoint.ts
git commit -m "feat: 기초자료 시트 파싱 함수 추가"
```

---

### Task 2: ProgressCards 컴포넌트

**Files:**
- Create: `src/app/(dashboard)/admin/assignments/ProgressCards.tsx`

- [ ] **Step 1: ProgressCards 컴포넌트 생성**

배정 유형별 진행률 카드 그리드. 서버 컴포넌트 (데이터는 page.tsx에서 전달).

```typescript
// src/app/(dashboard)/admin/assignments/ProgressCards.tsx
import { cn } from "@/lib/cn";
import { ProgressBar } from "@/components/common";
import {
  IconSchool, IconCalendar, IconWorld, IconArrowsExchange,
  IconUsers, IconBuildingArch, IconTopologyComplex,
  IconChartBar, IconMessageChatbot,
} from "@tabler/icons-react";

interface TypeProgress {
  type: string;
  label: string;
  assigned: number;
  total: number;
}

interface ProgressCardsProps {
  types: TypeProgress[];
  activeType?: string;
}

const TYPE_ICONS: Record<string, typeof IconSchool> = {
  susi: IconSchool,
  jungsi: IconCalendar,
  jaewoe: IconWorld,
  pyeonip: IconArrowsExchange,
  foreigner: IconUsers,
  grad: IconBuildingArch,
  pims: IconTopologyComplex,
  score: IconChartBar,
  app: IconMessageChatbot,
};

export default function ProgressCards({ types, activeType }: ProgressCardsProps) {
  return (
    <div className="grid grid-cols-3 lg:grid-cols-5 gap-3">
      {types.map((t) => {
        const pct = t.total > 0 ? Math.round((t.assigned / t.total) * 100) : 0;
        const isComplete = pct === 100;
        const Icon = TYPE_ICONS[t.type] ?? IconSchool;
        const isActive = activeType === t.type;

        return (
          <a
            key={t.type}
            href={`?type=${t.type}&step=1`}
            className={cn(
              "block p-4 rounded-xl border transition-all hover:border-primary/30 hover:shadow-glow cursor-pointer",
              isActive
                ? "border-primary/40 bg-primary/5"
                : "border-outline-variant/10 bg-surface-container",
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className={cn(isComplete ? "text-primary" : "text-on-surface-variant")} />
              <span className="text-xs font-bold text-on-surface">{t.label}</span>
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className={cn("text-xl font-black tabular-nums", isComplete ? "text-primary" : "text-on-surface")}>
                {t.assigned}
              </span>
              <span className="text-xs text-on-surface-variant">/ {t.total}</span>
            </div>
            <ProgressBar
              value={t.assigned}
              max={t.total || 1}
              size="sm"
              color={isComplete ? "primary" : pct < 50 ? "error" : "warning"}
            />
            {t.total - t.assigned > 0 && (
              <p className="text-[10px] text-error mt-1.5 font-medium">
                미배정 {t.total - t.assigned}개
              </p>
            )}
          </a>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: TypeScript 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add src/app/\(dashboard\)/admin/assignments/ProgressCards.tsx
git commit -m "feat: 배정 유형별 진행률 카드 컴포넌트"
```

---

### Task 3: WorkloadTable 컴포넌트

**Files:**
- Create: `src/app/(dashboard)/admin/assignments/WorkloadTable.tsx`

- [ ] **Step 1: WorkloadTable 컴포넌트 생성**

운영자 15명의 전체 워크로드 테이블. 1그룹→6그룹 순서.

```typescript
// src/app/(dashboard)/admin/assignments/WorkloadTable.tsx
import { cn } from "@/lib/cn";
import { Card, ProgressBar } from "@/components/common";
import type { OperatorSummary } from "@/lib/sharepoint";
import { OPERATOR_GROUPS } from "./constants";

interface WorkloadTableProps {
  operatorSummary: OperatorSummary[];
}

const COLS = ["수시", "정시", "재외", "외국인", "초중고", "대학원", "PIMS", "성적", "합계"];

function calcTotal(op: OperatorSummary): number {
  return op.susiTotal + op.jungsiTotal + op.etcJaewoe + op.etcForeign +
    op.etcK12 + op.etcGrad + op.etcPimsFull + op.etcScore;
}

export default function WorkloadTable({ operatorSummary }: WorkloadTableProps) {
  const opMap = new Map(operatorSummary.map((o) => [o.name, o]));
  const totals = operatorSummary.map(calcTotal);
  const maxTotal = Math.max(...totals, 1);
  const avgTotal = totals.reduce((s, v) => s + v, 0) / (totals.length || 1);

  function getBarColor(total: number): "primary" | "warning" | "error" {
    if (total > avgTotal * 1.6) return "error";
    if (total > avgTotal * 1.3) return "warning";
    return "primary";
  }

  return (
    <Card className="p-5">
      <h3 className="text-sm font-bold text-on-surface mb-4">운영자별 전체 워크로드</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-outline-variant/15">
              <th className="text-left py-2 px-2 font-bold text-on-surface-variant w-12">그룹</th>
              <th className="text-left py-2 px-2 font-bold text-on-surface-variant w-16">운영자</th>
              {COLS.map((c) => (
                <th key={c} className={cn("text-center py-2 px-1 font-bold text-on-surface-variant", c === "합계" ? "w-20" : "w-12")}>{c}</th>
              ))}
              <th className="w-24"></th>
            </tr>
          </thead>
          <tbody>
            {OPERATOR_GROUPS.map((group) =>
              group.operators.map((name, idx) => {
                const op = opMap.get(name);
                if (!op) return null;
                const total = calcTotal(op);
                return (
                  <tr key={name} className="border-b border-outline-variant/5 hover:bg-surface-container-high/30">
                    {idx === 0 && (
                      <td rowSpan={group.operators.length} className="py-2 px-2 text-[10px] font-bold text-primary align-top border-r border-outline-variant/10">
                        {group.label}
                      </td>
                    )}
                    <td className="py-2 px-2 font-bold text-on-surface">{name}</td>
                    <td className="text-center py-2 px-1 tabular-nums font-bold text-primary">{op.susiTotal}</td>
                    <td className="text-center py-2 px-1 tabular-nums font-bold text-primary">{op.jungsiTotal}</td>
                    <td className="text-center py-2 px-1 tabular-nums">{op.etcJaewoe || "-"}</td>
                    <td className="text-center py-2 px-1 tabular-nums">{op.etcForeign || "-"}</td>
                    <td className="text-center py-2 px-1 tabular-nums">{op.etcK12 || "-"}</td>
                    <td className="text-center py-2 px-1 tabular-nums">{op.etcGrad || "-"}</td>
                    <td className="text-center py-2 px-1 tabular-nums">{op.etcPimsFull || "-"}</td>
                    <td className="text-center py-2 px-1 tabular-nums">{op.etcScore || "-"}</td>
                    <td className="text-center py-2 px-1 tabular-nums font-black text-on-surface">{total}</td>
                    <td className="py-2 px-2">
                      <ProgressBar value={total} max={maxTotal} size="sm" color={getBarColor(total)} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: TypeScript 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add src/app/\(dashboard\)/admin/assignments/WorkloadTable.tsx
git commit -m "feat: 운영자 전체 워크로드 테이블 컴포넌트"
```

---

### Task 4: WizardStep1 — 용량 설정

**Files:**
- Create: `src/app/(dashboard)/admin/assignments/WizardStep1.tsx`

- [ ] **Step 1: WizardStep1 컴포넌트 생성**

배정 유형 표시 + 운영자별 용량 설정 (자동 추천값 + 작년 실적 참고).

```typescript
// src/app/(dashboard)/admin/assignments/WizardStep1.tsx
"use client";

import { IconRefresh } from "@tabler/icons-react";
import { OPERATOR_GROUPS, ALL_OPERATORS } from "./constants";
import type { OperatorBaseStats } from "@/lib/sharepoint";

const DEFAULT_MAX: Record<number, number> = { 1: 13, 2: 14, 3: 15, 4: 16, 5: 17, 6: 18 };

function getOperatorGroup(name: string): number {
  for (const g of OPERATOR_GROUPS) {
    if ((g.operators as readonly string[]).includes(name)) return g.group;
  }
  return 6;
}

interface WizardStep1Props {
  assignType: string;
  typeLabel: string;
  maxes: Record<string, number>;
  onMaxChange: (op: string, value: number) => void;
  onResetDefaults: () => void;
  onNext: () => void;
  baseStats: OperatorBaseStats[];
}

export default function WizardStep1({
  assignType, typeLabel, maxes, onMaxChange, onResetDefaults, onNext, baseStats,
}: WizardStep1Props) {
  const statsMap = new Map(baseStats.map((s) => [s.name, s]));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-on-surface">
            Step 1: 용량 설정 — <span className="text-primary">{typeLabel}</span> 배정
          </h3>
          <p className="text-xs text-on-surface-variant mt-1">운영자별 최대 배정 수를 설정하세요. 기초자료 기반 추천값이 적용되어 있습니다.</p>
        </div>
        <button type="button" onClick={onResetDefaults} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-on-surface-variant hover:bg-surface-container-high transition-colors">
          <IconRefresh size={12} />기본값
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 좌측: 용량 설정 */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 py-2 px-3 text-[10px] font-bold text-on-surface-variant border-b border-outline-variant/15">
            <span className="w-12">그룹</span>
            <span className="w-16">운영자</span>
            <span className="w-14 text-center">최대</span>
            <span className="flex-1">현재 추천</span>
          </div>
          {OPERATOR_GROUPS.map((group) => (
            <div key={group.group}>
              {group.operators.map((op, idx) => (
                <div key={op} className="flex items-center gap-2 py-1.5 px-3">
                  {idx === 0 ? (
                    <span className="w-12 text-[9px] font-bold text-primary uppercase tracking-widest">{group.label}</span>
                  ) : (
                    <span className="w-12" />
                  )}
                  <span className="w-16 text-xs font-medium text-on-surface truncate">{op}</span>
                  <input
                    type="number"
                    value={maxes[op] ?? DEFAULT_MAX[group.group]}
                    onChange={(e) => onMaxChange(op, Number(e.target.value))}
                    min={0} max={50}
                    className="w-14 text-center bg-surface-container-highest border-none rounded px-1 py-1.5 text-xs tabular-nums text-on-surface focus:ring-1 focus:ring-primary/50 focus:outline-none"
                  />
                  <span className="text-[10px] text-on-surface-variant">
                    기본 {DEFAULT_MAX[group.group]}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* 우측: 작년 실적 참고 */}
        <div className="bg-surface-container rounded-xl p-4">
          <h4 className="text-xs font-bold text-on-surface mb-3">작년 실적 참고 (기초자료)</h4>
          {baseStats.length === 0 ? (
            <p className="text-xs text-on-surface-variant">기초자료를 불러올 수 없습니다.</p>
          ) : (
            <div className="space-y-1">
              {ALL_OPERATORS.map((op) => {
                const stat = statsMap.get(op);
                return (
                  <div key={op} className="flex items-center justify-between py-1 text-xs">
                    <span className="font-medium text-on-surface">{op}</span>
                    <span className="tabular-nums text-on-surface-variant">
                      {stat ? `${stat.totalServices}건` : "-"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button type="button" onClick={onNext} className="px-6 py-2.5 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-colors">
          다음: 시뮬레이션 →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add src/app/\(dashboard\)/admin/assignments/WizardStep1.tsx
git commit -m "feat: 위자드 Step 1 용량 설정 컴포넌트"
```

---

### Task 5: WizardStep2 — 시뮬레이션

**Files:**
- Create: `src/app/(dashboard)/admin/assignments/WizardStep2.tsx`

- [ ] **Step 1: WizardStep2 컴포넌트 생성**

시뮬레이션 실행 버튼 + 결과 요약 배너 + 운영자별 결과 바 차트.

```typescript
// src/app/(dashboard)/admin/assignments/WizardStep2.tsx
"use client";

import { IconPlayerPlay, IconCheck, IconAlertTriangle } from "@tabler/icons-react";
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

export default function WizardStep2({
  typeLabel, totalUniversities, simResult, isRunning, onRun, onBack, onNext,
}: WizardStep2Props) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-on-surface">
            Step 2: 시뮬레이션 — <span className="text-primary">{typeLabel}</span>
          </h3>
          <p className="text-xs text-on-surface-variant mt-1">설정된 용량 기준으로 자동배정 시뮬레이션을 실행합니다.</p>
        </div>
        <button type="button" onClick={onRun} disabled={isRunning} className={cn("flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-colors", isRunning && "opacity-60")}>
          <IconPlayerPlay size={14} />
          {isRunning ? "실행 중..." : "시뮬레이션 실행"}
        </button>
      </div>

      {simResult && (
        <>
          {/* 결과 요약 배너 */}
          <div className="bg-primary/5 border border-primary/15 rounded-xl p-5">
            <div className="flex items-center gap-8">
              <div>
                <div className="text-[10px] text-on-surface-variant uppercase tracking-widest">대상</div>
                <div className="text-2xl font-black text-on-surface tabular-nums">{totalUniversities}</div>
              </div>
              <div className="text-xl text-on-surface-variant/30">→</div>
              <div>
                <div className="text-[10px] text-on-surface-variant uppercase tracking-widest">배정 완료</div>
                <div className="text-2xl font-black text-primary tabular-nums">{simResult.assignedCount}</div>
              </div>
              <div>
                <div className="text-[10px] text-on-surface-variant uppercase tracking-widest">신규 배정</div>
                <div className="text-2xl font-black text-tertiary tabular-nums">{simResult.newCount}</div>
              </div>
              {simResult.failedCount > 0 && (
                <div>
                  <div className="text-[10px] text-on-surface-variant uppercase tracking-widest">배정 불가</div>
                  <div className="text-2xl font-black text-error tabular-nums">{simResult.failedCount}</div>
                </div>
              )}
            </div>
          </div>

          {/* 운영자별 결과 */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {OPERATOR_GROUPS.map((group) => (
              <div key={group.group} className="bg-surface-container rounded-xl p-4">
                <p className="text-[9px] font-bold text-primary uppercase tracking-widest mb-3">{group.label}</p>
                <div className="space-y-2">
                  {group.operators.map((op) => {
                    const load = simResult.operatorLoads[op] ?? 0;
                    const max = simResult.maxes[op] ?? 15;
                    const pct = max > 0 ? (load / max) * 100 : 0;
                    const isOver = load > max;
                    const isFull = load === max;
                    return (
                      <div key={op} className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-on-surface w-14 truncate">{op}</span>
                        <div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full transition-all", isOver ? "bg-error" : isFull ? "bg-tertiary" : "bg-primary")} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <span className={cn("text-[10px] font-bold tabular-nums", isOver ? "text-error" : "text-on-surface")}>{load}</span>
                        <span className="text-[9px] text-on-surface-variant tabular-nums">/{max}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="px-5 py-2.5 rounded-lg bg-surface-container-high text-on-surface-variant text-xs font-bold">
          ← 용량 설정
        </button>
        {simResult && (
          <button type="button" onClick={onNext} className="px-6 py-2.5 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-colors">
            결과 확인 & 조정 →
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript 체크 + 커밋**

Run: `npx tsc --noEmit`

```bash
git add src/app/\(dashboard\)/admin/assignments/WizardStep2.tsx
git commit -m "feat: 위자드 Step 2 시뮬레이션 컴포넌트"
```

---

### Task 6: WizardStep3 — 결과 확인 & 조정

**Files:**
- Create: `src/app/(dashboard)/admin/assignments/WizardStep3.tsx`

- [ ] **Step 1: WizardStep3 컴포넌트 생성**

대학 목록 테이블 (왼쪽 8/12) + 운영자 현황 패널 (오른쪽 4/12). 개별 변경 + 조건 재실행.

기존 `AssignmentBoard.tsx`의 수동 배정 + 시뮬레이션 결과 표시 로직을 재구성한다.
핵심 기능:
- 대학별 운영자 드롭다운 변경
- 변경된 행 하이라이트
- 미배정 행 강조
- 운영자 max값 변경 → 부분 재실행
- 검색/분류/지역 필터

```typescript
// src/app/(dashboard)/admin/assignments/WizardStep3.tsx
"use client";

import { useState, useMemo } from "react";
import { IconSearch, IconRefresh } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { Card } from "@/components/common";
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
  /** key: "univName__type", value: operator name */
  assignmentMap: Map<string, string>;
  /** 원본(시뮬 전) 배정 맵 */
  originalMap: Map<string, string>;
  maxes: Record<string, number>;
  onAssignChange: (univName: string, operator: string) => void;
  onMaxChange: (op: string, value: number) => void;
  onRerun: () => void;
  onBack: () => void;
  onNext: () => void;
}

export default function WizardStep3({
  universities, assignType, typeLabel, assignmentMap, originalMap,
  maxes, onAssignChange, onMaxChange, onRerun, onBack, onNext,
}: WizardStep3Props) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [editingUniv, setEditingUniv] = useState<string | null>(null);

  const uniqueCategories = [...new Set(universities.map((u) => u.category).filter(Boolean))].sort();
  const uniqueRegions = [...new Set(universities.map((u) => u.region).filter(Boolean))].sort();

  const filtered = useMemo(() => {
    let list = universities;
    if (categoryFilter) list = list.filter((u) => u.category === categoryFilter);
    if (regionFilter) list = list.filter((u) => u.region === regionFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((u) => u.universityName.toLowerCase().includes(q));
    }
    return list;
  }, [universities, categoryFilter, regionFilter, search]);

  // 운영자별 현재 배정 수
  const operatorLoads = useMemo(() => {
    const loads: Record<string, number> = {};
    ALL_OPERATORS.forEach((op) => { loads[op] = 0; });
    for (const [key, op] of assignmentMap.entries()) {
      if (key.endsWith(`__${assignType}`)) {
        loads[op] = (loads[op] ?? 0) + 1;
      }
    }
    return loads;
  }, [assignmentMap, assignType]);

  const assignedCount = filtered.filter((u) => assignmentMap.has(`${u.universityName}__${assignType}`)).length;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-on-surface">
          Step 3: 결과 확인 & 조정 — <span className="text-primary">{typeLabel}</span>
        </h3>
        <p className="text-xs text-on-surface-variant mt-1">개별 대학의 배정을 변경하거나 조건을 수정하여 재실행할 수 있습니다.</p>
      </div>

      {/* 필터 */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="대학명 검색..." className="search-input w-full pl-9 pr-4 py-2 rounded-lg text-xs text-on-surface focus:outline-none" />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="search-input px-3 py-2 rounded-lg text-xs text-on-surface focus:outline-none appearance-none cursor-pointer">
          <option value="">전체 분류</option>
          {uniqueCategories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} className="search-input px-3 py-2 rounded-lg text-xs text-on-surface focus:outline-none appearance-none cursor-pointer">
          <option value="">전체 지역</option>
          {uniqueRegions.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="flex items-center gap-3 text-[10px] text-on-surface-variant">
        <span>검색결과 <span className="font-bold text-on-surface">{filtered.length}</span>개</span>
        <span>배정완료 <span className="font-bold text-primary">{assignedCount}</span>개</span>
        <span>미배정 <span className="font-bold text-error">{filtered.length - assignedCount}</span>개</span>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* 왼쪽: 대학 목록 */}
        <div className="col-span-8">
          <Card className="overflow-hidden max-h-[500px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-surface-container z-10">
                <tr className="border-b border-outline-variant/15">
                  <th className="text-left py-2 px-3 font-bold text-on-surface-variant w-[8%]">분류</th>
                  <th className="text-left py-2 px-3 font-bold text-on-surface-variant w-[8%]">지역</th>
                  <th className="text-left py-2 px-3 font-bold text-on-surface-variant w-[30%]">대학명</th>
                  <th className="text-left py-2 px-3 font-bold text-on-surface-variant w-[13%]">엑셀 기준</th>
                  <th className="text-left py-2 px-3 font-bold text-on-surface-variant w-[25%]">배정 운영자</th>
                  <th className="w-[14%]"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const key = `${u.universityName}__${assignType}`;
                  const assigned = assignmentMap.get(key) ?? "";
                  const prevAssigned = originalMap.get(key) ?? "";
                  const isChanged = assigned !== prevAssigned;
                  const isEditing = editingUniv === u.universityName;

                  return (
                    <tr key={u.universityName} className={cn("border-b border-outline-variant/5 hover:bg-surface-container-high/30", isChanged && "bg-tertiary/5")}>
                      <td className="py-2 px-3"><span className={cn("font-bold", u.category === "4년제" ? "text-primary" : "text-on-surface-variant")}>{u.category}</span></td>
                      <td className="py-2 px-3 text-on-surface-variant">{u.region || "-"}</td>
                      <td className="py-2 px-3 font-medium text-on-surface">{u.universityName}</td>
                      <td className="py-2 px-3 text-on-surface-variant">{u.currentOperator || "-"}</td>
                      <td className="py-2 px-3">
                        {isEditing ? (
                          <select autoFocus value={assigned} onChange={(e) => { if (e.target.value) { onAssignChange(u.universityName, e.target.value); setEditingUniv(null); } }} onBlur={() => setEditingUniv(null)}
                            className="w-full bg-surface-container-highest border-none rounded px-2 py-1 text-xs text-on-surface focus:ring-1 focus:ring-primary/50 focus:outline-none appearance-none cursor-pointer">
                            <option value="">선택</option>
                            {ALL_OPERATORS.map((op) => <option key={op} value={op}>{op} ({operatorLoads[op] ?? 0})</option>)}
                          </select>
                        ) : assigned ? (
                          <span className={cn("font-medium", isChanged ? "text-tertiary" : "text-on-surface")}>{assigned}</span>
                        ) : (
                          <span className="text-error/60 italic">미배정</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button type="button" onClick={() => setEditingUniv(isEditing ? null : u.universityName)}
                          className="px-2 py-1 rounded text-[10px] font-bold text-primary hover:bg-primary/10 transition-colors">
                          {assigned ? "변경" : "배정"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>

        {/* 오른쪽: 운영자 현황 + 조건 변경 */}
        <div className="col-span-4 space-y-3">
          <Card className="p-4">
            <h4 className="text-xs font-bold text-on-surface mb-3">운영자 현황 <span className="text-on-surface-variant font-normal">({typeLabel})</span></h4>
            {OPERATOR_GROUPS.map((group) => (
              <div key={group.group}>
                <p className="text-[9px] font-bold text-primary uppercase tracking-widest mt-2 mb-1">{group.label}</p>
                {group.operators.map((op) => {
                  const load = operatorLoads[op] ?? 0;
                  const max = maxes[op] ?? 15;
                  const maxLoad = Math.max(...Object.values(operatorLoads), 1);
                  const isOver = load > max;
                  return (
                    <div key={op} className="flex items-center gap-2 py-1">
                      <span className="text-[11px] font-medium text-on-surface w-14 truncate">{op}</span>
                      <div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", isOver ? "bg-error" : "bg-primary")} style={{ width: `${(load / maxLoad) * 100}%` }} />
                      </div>
                      <span className={cn("text-[10px] font-bold tabular-nums w-6 text-right", isOver ? "text-error" : "text-on-surface")}>{load}</span>
                      <span className="text-[9px] text-on-surface-variant tabular-nums">/{max}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </Card>

          {/* 조건 변경 */}
          <Card className="p-4">
            <h4 className="text-xs font-bold text-on-surface mb-2">조건 변경 후 재실행</h4>
            <p className="text-[10px] text-on-surface-variant mb-3">운영자별 max를 변경하고 미배정분만 재배정합니다.</p>
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {ALL_OPERATORS.map((op) => (
                <div key={op} className="flex items-center gap-2">
                  <span className="text-[10px] w-14 truncate text-on-surface">{op}</span>
                  <input type="number" value={maxes[op] ?? 15} onChange={(e) => onMaxChange(op, Number(e.target.value))} min={0} max={50}
                    className="w-12 text-center bg-surface-container-highest border-none rounded px-1 py-1 text-[10px] tabular-nums text-on-surface focus:ring-1 focus:ring-primary/50 focus:outline-none" />
                </div>
              ))}
            </div>
            <button type="button" onClick={onRerun} className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-high text-on-surface text-xs font-bold hover:bg-surface-bright transition-colors">
              <IconRefresh size={12} />조건 변경 후 재실행
            </button>
          </Card>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="px-5 py-2.5 rounded-lg bg-surface-container-high text-on-surface-variant text-xs font-bold">← 시뮬레이션</button>
        <button type="button" onClick={onNext} className="px-6 py-2.5 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-colors">최종 확인 →</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript 체크 + 커밋**

Run: `npx tsc --noEmit`

```bash
git add src/app/\(dashboard\)/admin/assignments/WizardStep3.tsx
git commit -m "feat: 위자드 Step 3 결과 확인 & 조정 컴포넌트"
```

---

### Task 7: WizardStep4 — 최종 확인 & 적용

**Files:**
- Create: `src/app/(dashboard)/admin/assignments/WizardStep4.tsx`

- [ ] **Step 1: WizardStep4 컴포넌트 생성**

변경 요약 + 운영자별 최종 배정 수 + 적용 버튼.

```typescript
// src/app/(dashboard)/admin/assignments/WizardStep4.tsx
"use client";

import { IconCheck, IconArrowRight } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { Card } from "@/components/common";
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
  typeLabel, totalUniversities, assignedCount, newCount, manualChangeCount,
  operatorLoads, maxes, isApplying, applied, onApply, onBack, onDone,
}: WizardStep4Props) {
  if (applied) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <IconCheck size={32} className="text-primary" />
        </div>
        <h3 className="text-lg font-bold text-on-surface mb-2">배정이 적용되었습니다</h3>
        <p className="text-sm text-on-surface-variant mb-6">{typeLabel} {assignedCount}건 배정 완료</p>
        <button type="button" onClick={onDone} className="px-6 py-2.5 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-colors">
          대시보드로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-on-surface">Step 4: 최종 확인 — <span className="text-primary">{typeLabel}</span></h3>
        <p className="text-xs text-on-surface-variant mt-1">배정 결과를 확인하고 적용합니다.</p>
      </div>

      {/* 변경 요약 */}
      <Card className="p-5">
        <h4 className="text-xs font-bold text-on-surface mb-4">변경 요약</h4>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-black text-on-surface tabular-nums">{totalUniversities}</div>
            <div className="text-[10px] text-on-surface-variant mt-1">대상 대학</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-primary tabular-nums">{assignedCount}</div>
            <div className="text-[10px] text-on-surface-variant mt-1">배정 완료</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-tertiary tabular-nums">{newCount}</div>
            <div className="text-[10px] text-on-surface-variant mt-1">신규 배정</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-on-surface tabular-nums">{manualChangeCount}</div>
            <div className="text-[10px] text-on-surface-variant mt-1">수동 조정</div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <span className="text-xs font-bold text-primary">배정률 {totalUniversities > 0 ? Math.round((assignedCount / totalUniversities) * 100) : 0}%</span>
        </div>
      </Card>

      {/* 운영자별 최종 배정 */}
      <Card className="p-5">
        <h4 className="text-xs font-bold text-on-surface mb-4">운영자별 최종 배정</h4>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {OPERATOR_GROUPS.map((group) => (
            <div key={group.group} className="bg-surface-container rounded-lg p-3">
              <p className="text-[9px] font-bold text-primary uppercase tracking-widest mb-2">{group.label}</p>
              {group.operators.map((op) => {
                const load = operatorLoads[op] ?? 0;
                const max = maxes[op] ?? 15;
                return (
                  <div key={op} className="flex items-center justify-between py-1 text-xs">
                    <span className="font-medium text-on-surface">{op}</span>
                    <span className={cn("font-bold tabular-nums", load > max ? "text-error" : "text-on-surface")}>{load}<span className="text-on-surface-variant font-normal">/{max}</span></span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="px-5 py-2.5 rounded-lg bg-surface-container-high text-on-surface-variant text-xs font-bold">← 수정하기</button>
        <button type="button" onClick={onApply} disabled={isApplying} className={cn("flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-colors", isApplying && "opacity-60")}>
          <IconArrowRight size={14} />
          {isApplying ? "적용 중..." : "배정 적용"}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript 체크 + 커밋**

Run: `npx tsc --noEmit`

```bash
git add src/app/\(dashboard\)/admin/assignments/WizardStep4.tsx
git commit -m "feat: 위자드 Step 4 최종 확인 & 적용 컴포넌트"
```

---

### Task 8: AssignmentWizard 컨테이너

**Files:**
- Create: `src/app/(dashboard)/admin/assignments/AssignmentWizard.tsx`

- [ ] **Step 1: AssignmentWizard 컴포넌트 생성**

위자드의 메인 컨테이너. step 상태 관리, 시뮬레이션 실행, 배정 맵 관리, 서버 액션 호출을 담당한다.

```typescript
// src/app/(dashboard)/admin/assignments/AssignmentWizard.tsx
"use client";

import { useState, useCallback, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Card } from "@/components/common";
import { applyAssignments } from "./actions";
import type { AssignmentPreview } from "./actions";
import { ALL_OPERATORS, OPERATOR_GROUPS } from "./constants";
import type { OperatorBaseStats } from "@/lib/sharepoint";
import WizardStep1 from "./WizardStep1";
import WizardStep2 from "./WizardStep2";
import WizardStep3 from "./WizardStep3";
import WizardStep4 from "./WizardStep4";

interface University {
  universityName: string;
  category: string;
  region: string;
  currentOperator: string;
}

interface AssignmentResult {
  university_name: string;
  assignment_type: string;
  assigned_to: string;
}

interface AssignmentWizardProps {
  year: number;
  assignType: string;
  typeLabel: string;
  universities: University[];
  existingResults: AssignmentResult[];
  baseStats: OperatorBaseStats[];
}

const STEP_LABELS = ["용량 설정", "시뮬레이션", "결과 조정", "적용"];
const DEFAULT_MAX: Record<number, number> = { 1: 13, 2: 14, 3: 15, 4: 16, 5: 17, 6: 18 };

function getOperatorGroup(name: string): number {
  for (const g of OPERATOR_GROUPS) {
    if ((g.operators as readonly string[]).includes(name)) return g.group;
  }
  return 6;
}

export default function AssignmentWizard({
  year, assignType, typeLabel, universities, existingResults, baseStats,
}: AssignmentWizardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [applied, setApplied] = useState(false);

  // 용량 설정
  const [maxes, setMaxes] = useState<Record<string, number>>(() => {
    const m: Record<string, number> = {};
    ALL_OPERATORS.forEach((op) => { m[op] = DEFAULT_MAX[getOperatorGroup(op)]; });
    return m;
  });

  // 기존 배정 맵
  const originalMap = useMemo(() => {
    const map = new Map<string, string>();
    existingResults.forEach((r) => {
      map.set(`${r.university_name}__${r.assignment_type}`, r.assigned_to);
    });
    return map;
  }, [existingResults]);

  // 시뮬레이션 결과 맵
  const [assignmentMap, setAssignmentMap] = useState<Map<string, string>>(new Map(originalMap));
  const [simRan, setSimRan] = useState(false);

  // 시뮬레이션 실행 (클라이언트 사이드)
  const runSimulation = useCallback(() => {
    const newMap = new Map(originalMap);
    const loads: Record<string, number> = {};
    ALL_OPERATORS.forEach((op) => { loads[op] = 0; });

    // 기존 배정 카운트
    for (const [key, op] of newMap.entries()) {
      if (key.endsWith(`__${assignType}`)) {
        loads[op] = (loads[op] ?? 0) + 1;
      }
    }

    // 미배정 대학
    const unassigned = universities.filter((u) => !newMap.has(`${u.universityName}__${assignType}`));

    for (const uni of unassigned) {
      const candidates = ALL_OPERATORS
        .map((op) => ({ name: op, remaining: (maxes[op] ?? 15) - (loads[op] ?? 0), current: loads[op] ?? 0 }))
        .filter((c) => c.remaining > 0)
        .sort((a, b) => b.remaining - a.remaining || a.current - b.current);

      if (candidates.length > 0) {
        const chosen = candidates[0];
        newMap.set(`${uni.universityName}__${assignType}`, chosen.name);
        loads[chosen.name] = (loads[chosen.name] ?? 0) + 1;
      }
    }

    setAssignmentMap(newMap);
    setSimRan(true);
  }, [universities, originalMap, assignType, maxes]);

  // 시뮬레이션 결과 통계
  const simStats = useMemo(() => {
    const loads: Record<string, number> = {};
    ALL_OPERATORS.forEach((op) => { loads[op] = 0; });
    let assignedCount = 0;
    for (const [key, op] of assignmentMap.entries()) {
      if (key.endsWith(`__${assignType}`)) {
        loads[op] = (loads[op] ?? 0) + 1;
        assignedCount++;
      }
    }
    const origCount = [...originalMap.entries()].filter(([k]) => k.endsWith(`__${assignType}`)).length;
    const newCount = assignedCount - origCount;
    // 수동 변경 건수 (원본과 다른 것 중 시뮬레이션이 아닌 것)
    let manualChangeCount = 0;
    for (const [key, op] of assignmentMap.entries()) {
      if (!key.endsWith(`__${assignType}`)) continue;
      const orig = originalMap.get(key);
      if (orig && orig !== op) manualChangeCount++;
    }
    return { assignedCount, newCount, failedCount: universities.length - assignedCount, operatorLoads: loads, manualChangeCount };
  }, [assignmentMap, assignType, universities, originalMap]);

  // 개별 배정 변경
  function handleAssignChange(univName: string, operator: string) {
    const newMap = new Map(assignmentMap);
    newMap.set(`${univName}__${assignType}`, operator);
    setAssignmentMap(newMap);
  }

  // 적용
  function handleApply() {
    const assignments: AssignmentPreview[] = [];
    for (const [key, op] of assignmentMap.entries()) {
      if (!key.endsWith(`__${assignType}`)) continue;
      if (originalMap.get(key) === op) continue;
      const univName = key.replace(`__${assignType}`, "");
      const uni = universities.find((u) => u.universityName === univName);
      assignments.push({
        universityName: univName,
        category: uni?.category ?? "",
        region: uni?.region ?? "",
        assignmentType: assignType,
        assignedTo: op,
      });
    }
    if (assignments.length === 0) { setApplied(true); return; }
    startTransition(async () => {
      await applyAssignments(year, assignments);
      setApplied(true);
      router.refresh();
    });
  }

  function resetDefaults() {
    const m: Record<string, number> = {};
    ALL_OPERATORS.forEach((op) => { m[op] = DEFAULT_MAX[getOperatorGroup(op)]; });
    setMaxes(m);
  }

  return (
    <Card className="p-6">
      {/* 스텝 인디케이터 */}
      <div className="flex items-center justify-center gap-0 mb-8 relative">
        <div className="absolute top-4 left-[15%] right-[15%] h-0.5 bg-surface-container-highest" />
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1;
          const isDone = step > stepNum;
          const isActive = step === stepNum;
          return (
            <div key={label} className="flex-1 flex flex-col items-center relative z-10">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition-all",
                isDone ? "bg-primary text-on-primary" : isActive ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant",
              )}>
                {isDone ? "✓" : stepNum}
              </div>
              <span className={cn("text-[10px] font-medium", isActive ? "text-on-surface" : "text-on-surface-variant")}>{label}</span>
            </div>
          );
        })}
      </div>

      {/* 스텝 컨텐츠 */}
      {step === 1 && (
        <WizardStep1
          assignType={assignType}
          typeLabel={typeLabel}
          maxes={maxes}
          onMaxChange={(op, v) => setMaxes((prev) => ({ ...prev, [op]: v }))}
          onResetDefaults={resetDefaults}
          onNext={() => setStep(2)}
          baseStats={baseStats}
        />
      )}
      {step === 2 && (
        <WizardStep2
          typeLabel={typeLabel}
          totalUniversities={universities.length}
          simResult={simRan ? {
            assignedCount: simStats.assignedCount,
            newCount: simStats.newCount,
            failedCount: simStats.failedCount,
            operatorLoads: simStats.operatorLoads,
            maxes,
          } : null}
          isRunning={false}
          onRun={runSimulation}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <WizardStep3
          universities={universities}
          assignType={assignType}
          typeLabel={typeLabel}
          assignmentMap={assignmentMap}
          originalMap={originalMap}
          maxes={maxes}
          onAssignChange={handleAssignChange}
          onMaxChange={(op, v) => setMaxes((prev) => ({ ...prev, [op]: v }))}
          onRerun={runSimulation}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
        />
      )}
      {step === 4 && (
        <WizardStep4
          typeLabel={typeLabel}
          totalUniversities={universities.length}
          assignedCount={simStats.assignedCount}
          newCount={simStats.newCount}
          manualChangeCount={simStats.manualChangeCount}
          operatorLoads={simStats.operatorLoads}
          maxes={maxes}
          isApplying={isPending}
          applied={applied}
          onApply={handleApply}
          onBack={() => setStep(3)}
          onDone={() => router.push("/admin/assignments")}
        />
      )}
    </Card>
  );
}
```

- [ ] **Step 2: TypeScript 체크 + 커밋**

Run: `npx tsc --noEmit`

```bash
git add src/app/\(dashboard\)/admin/assignments/AssignmentWizard.tsx
git commit -m "feat: 위자드 컨테이너 컴포넌트 (step 관리, 시뮬레이션, 배정)"
```

---

### Task 9: page.tsx 재작성 + 기존 파일 정리

**Files:**
- Rewrite: `src/app/(dashboard)/admin/assignments/page.tsx`
- Delete: `AssignmentBoard.tsx`, `AutoAssignPanel.tsx`, `CapacitySettings.tsx`, `AssignmentTypeSelector.tsx`, `SummaryCollapsible.tsx`

- [ ] **Step 1: page.tsx 재작성**

대시보드 모드(기본)와 위자드 모드(`?type=xxx&step=1`)를 분기하는 서버 컴포넌트.

```typescript
// src/app/(dashboard)/admin/assignments/page.tsx
import { PageHeader, KpiGrid, KpiCard, Card } from "@/components/common";
import { IconSchool, IconUsers, IconUserOff, IconAlertTriangle } from "@tabler/icons-react";
import { fetchAssignments, fetchBaseData } from "@/lib/sharepoint";
import { getAssignmentResults } from "./actions";
import ProgressCards from "./ProgressCards";
import WorkloadTable from "./WorkloadTable";
import AssignmentWizard from "./AssignmentWizard";

const YEAR = 2027;

const TYPE_LABELS: Record<string, string> = {
  susi: "수시", jungsi: "정시", jaewoe: "재외국민", pyeonip: "편입",
  foreigner: "외국인", grad: "대학원", pims: "PIMS", score: "성적산출", app: "상담앱",
};

interface PageProps {
  searchParams: Promise<{ type?: string; step?: string }>;
}

export default async function AssignmentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeType = params.type ?? null;

  const [data, existingResults, baseData] = await Promise.all([
    fetchAssignments(),
    getAssignmentResults(YEAR),
    fetchBaseData(),
  ]);

  if (!data) {
    return (
      <div className="space-y-8">
        <PageHeader title="대학배정" description="대학 운영자 배정을 관리합니다." breadcrumb={["관리자", "대학배정"]} />
        <Card className="p-16 text-center"><p className="text-sm text-on-surface-variant">배정 데이터를 불러올 수 없습니다.</p></Card>
      </div>
    );
  }

  const { operatorSummary, assignments, gradAssignments, pimsAssignments, scoreAssignments, appAssignments } = data;

  // 배정 유형별 진행률 계산
  const resultSet = new Set(existingResults.map((r) => `${r.university_name}__${r.assignment_type}`));

  function countAssigned(univs: { universityName: string }[], type: string): number {
    return univs.filter((u) => resultSet.has(`${u.universityName}__${type}`)).length;
  }

  const fourYear = assignments.filter((a) => a.category === "4년제");
  const typeProgress = [
    { type: "susi", label: "수시", assigned: countAssigned(assignments, "susi"), total: assignments.length },
    { type: "jungsi", label: "정시", assigned: countAssigned(assignments, "jungsi"), total: assignments.length },
    { type: "jaewoe", label: "재외국민", assigned: countAssigned(fourYear, "jaewoe"), total: fourYear.length },
    { type: "pyeonip", label: "편입", assigned: countAssigned(fourYear, "pyeonip"), total: fourYear.length },
    { type: "foreigner", label: "외국인", assigned: countAssigned(fourYear, "foreigner"), total: fourYear.length },
    { type: "grad", label: "대학원", assigned: countAssigned(gradAssignments, "grad"), total: gradAssignments.length },
    { type: "pims", label: "PIMS", assigned: countAssigned(pimsAssignments, "pims"), total: pimsAssignments.length },
    { type: "score", label: "성적산출", assigned: countAssigned(scoreAssignments, "score"), total: scoreAssignments.length },
    { type: "app", label: "상담앱", assigned: countAssigned(appAssignments, "app"), total: appAssignments.length },
  ];

  const totalAssigned = typeProgress.reduce((s, t) => s + t.assigned, 0);
  const totalAll = typeProgress.reduce((s, t) => s + t.total, 0);
  const unassignedCount = totalAll - totalAssigned;

  // 위자드 모드
  if (activeType && TYPE_LABELS[activeType]) {
    let universities: { universityName: string; category: string; region: string; currentOperator: string }[];

    switch (activeType) {
      case "jungsi": universities = assignments.map((a) => ({ universityName: a.universityName, category: a.category, region: a.region, currentOperator: a.op2027.jungsi })); break;
      case "jaewoe": universities = fourYear.map((a) => ({ universityName: a.universityName, category: a.category, region: a.region, currentOperator: a.op2027.jaewoe })); break;
      case "pyeonip": universities = fourYear.map((a) => ({ universityName: a.universityName, category: a.category, region: a.region, currentOperator: a.op2027.pyeonip })); break;
      case "foreigner": universities = fourYear.map((a) => ({ universityName: a.universityName, category: a.category, region: a.region, currentOperator: a.op2027.foreigner })); break;
      case "grad": universities = gradAssignments.map((g) => ({ universityName: g.universityName, category: "대학원", region: "", currentOperator: g.operator })); break;
      case "pims": universities = pimsAssignments.map((p) => ({ universityName: p.universityName, category: p.category, region: p.region, currentOperator: p.operatorFull })); break;
      case "score": universities = scoreAssignments.map((s) => ({ universityName: s.universityName, category: "성적산출", region: "", currentOperator: s.operator })); break;
      case "app": universities = appAssignments.map((a) => ({ universityName: a.universityName, category: "상담앱", region: "", currentOperator: a.operator })); break;
      default: universities = assignments.map((a) => ({ universityName: a.universityName, category: a.category, region: a.region, currentOperator: a.op2027.susi }));
    }

    return (
      <div className="space-y-6">
        <PageHeader title="대학배정" description={`${YEAR}학년도 ${TYPE_LABELS[activeType]} 배정`} breadcrumb={["관리자", "대학배정", TYPE_LABELS[activeType]]} />
        <AssignmentWizard
          year={YEAR}
          assignType={activeType}
          typeLabel={TYPE_LABELS[activeType]}
          universities={universities}
          existingResults={existingResults}
          baseStats={baseData?.operatorStats ?? []}
        />
      </div>
    );
  }

  // 대시보드 모드
  return (
    <div className="space-y-6">
      <PageHeader title="대학배정" description={`${YEAR}학년도 운영자 대학배정 관리`} breadcrumb={["관리자", "대학배정"]} />

      <KpiGrid>
        <KpiCard icon={<IconSchool size={18} className="text-on-surface-variant" />} label="총 대학" value={assignments.length.toString()} suffix="개" change={`4년제 ${fourYear.length} / 전문대 ${assignments.filter((a) => a.category.includes("전문")).length}`} />
        <KpiCard icon={<IconUsers size={18} className="text-on-surface-variant" />} label="운영자" value={operatorSummary.length.toString()} suffix="명" change="6개 그룹" />
        <KpiCard icon={<IconUserOff size={18} className="text-on-surface-variant" />} label="미배정" value={unassignedCount.toString()} suffix="건" alert={unassignedCount > 0} />
        <KpiCard icon={<IconAlertTriangle size={18} className="text-on-surface-variant" />} label="변경" value={assignments.filter((a) => a.changed.includes("변경")).length.toString()} suffix="건" />
      </KpiGrid>

      <div>
        <h3 className="text-sm font-bold text-on-surface mb-3">배정 유형 선택</h3>
        <p className="text-xs text-on-surface-variant mb-4">배정할 유형을 클릭하여 위자드를 시작하세요.</p>
        <ProgressCards types={typeProgress} />
      </div>

      <WorkloadTable operatorSummary={operatorSummary} />
    </div>
  );
}
```

- [ ] **Step 2: 기존 파일 삭제**

```bash
rm -f src/app/\(dashboard\)/admin/assignments/AssignmentBoard.tsx
rm -f src/app/\(dashboard\)/admin/assignments/AutoAssignPanel.tsx
rm -f src/app/\(dashboard\)/admin/assignments/CapacitySettings.tsx
rm -f src/app/\(dashboard\)/admin/assignments/AssignmentTypeSelector.tsx
rm -f src/app/\(dashboard\)/admin/assignments/SummaryCollapsible.tsx
rm -f src/app/\(dashboard\)/admin/assignments/AssignmentTabs.tsx
rm -f src/app/\(dashboard\)/admin/assignments/AdminAssignmentFilters.tsx
rm -f src/app/\(dashboard\)/admin/assignments/shared.tsx
```

- [ ] **Step 3: TypeScript 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 4: 커밋**

```bash
git add -A src/app/\(dashboard\)/admin/assignments/
git commit -m "feat: 대학배정 위자드 + 대시보드 전면 재설계"
```

---

### Task 10: 통합 테스트 + .next 캐시 정리

- [ ] **Step 1: .next 캐시 삭제 + 서버 재시작**

```bash
rm -rf .next
npm run dev
```

- [ ] **Step 2: 페이지 접근 확인**

1. `/admin/assignments` — 대시보드 (진행률 카드 + 워크로드 테이블)
2. `/admin/assignments?type=susi` — 위자드 Step 1 (용량 설정)
3. 위자드 Step 2 → 시뮬레이션 실행
4. 위자드 Step 3 → 개별 변경 + 조건 재실행
5. 위자드 Step 4 → 적용

- [ ] **Step 3: TypeScript + 빌드 체크**

```bash
npx tsc --noEmit
npm run build
```

- [ ] **Step 4: 최종 커밋**

```bash
git add -A
git commit -m "chore: 대학배정 위자드 통합 검증 완료"
```
