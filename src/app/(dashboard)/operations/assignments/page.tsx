import Link from "next/link";
import { Suspense } from "react";
import { PageHeader, KpiGrid, KpiCard, Card } from "@/components/common";
import {
  IconUsers,
  IconSchool,
  IconNetwork,
  IconBuildingArch,
  IconSearch,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { fetchAssignments } from "@/lib/sharepoint";
import AssignmentSearch from "./AssignmentFilters";

interface SearchParams {
  search?: string;
}

interface UniversityData {
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
  };
  grad?: { operator: string; developer: string };
  pims?: { operatorFull: string; operatorReception: string };
  score?: { operator: string; developer: string };
  app?: { operator: string; developer: string };
}

/** HUD 라벨 스타일 — `[10px] uppercase tracking-[0.15em]` */
const HUD_LABEL =
  "text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant";

/** 터미널 뱃지 — 섹션 분류 라벨 */
const SECTION_TAG_BASE =
  "inline-flex items-center shrink-0 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-[0.15em] border";

const SECTION_TAGS = {
  primary: `${SECTION_TAG_BASE} bg-primary/10 text-primary border-primary/30`,
  tertiary: `${SECTION_TAG_BASE} bg-tertiary/10 text-tertiary border-tertiary/30`,
  secondary: `${SECTION_TAG_BASE} bg-secondary-container/40 text-on-secondary-container border-outline-variant/40`,
  error: `${SECTION_TAG_BASE} bg-error/10 text-error border-error/30`,
  neutral: `${SECTION_TAG_BASE} bg-surface-container-high text-on-surface-variant border-outline-variant/40`,
} as const;

function hl(text: string, q: string): React.ReactNode {
  if (!q || !text) return text;
  const lower = text.toLowerCase();
  if (!lower.includes(q)) return text;
  const idx = lower.indexOf(q);
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/25 text-primary rounded-sm px-1 not-italic font-bold">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}

function MiniField({
  label,
  value,
  q,
}: {
  label: string;
  value?: string;
  q: string;
}) {
  const empty = !value || value === "-";
  return (
    <div className="flex items-baseline gap-1.5 min-w-0">
      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/70 shrink-0">
        {label}
      </span>
      {empty ? (
        <span className="text-on-surface-variant/40 font-mono">—</span>
      ) : (
        <span className="text-on-surface font-medium truncate">
          {hl(value!, q)}
        </span>
      )}
    </div>
  );
}

function UniversityRow({ u, q }: { u: UniversityData; q: string }) {
  const hasChanged = u.changed?.includes("변경");

  return (
    <div
      className={`relative bg-surface-container rounded-md p-4 border transition-all ${
        hasChanged
          ? "border-error/40 hover:border-error/70"
          : "border-outline-variant/30 hover:border-primary/50 hover:shadow-glow"
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-outline-variant/20">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <h3 className="text-base font-black text-on-surface tracking-tight">
            {hl(u.universityName, q)}
          </h3>
          {u.category && (
            <span className={SECTION_TAGS.neutral}>{u.category}</span>
          )}
          {u.region && (
            <span className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant">
              {u.region}
            </span>
          )}
          {hasChanged && (
            <span className={`${SECTION_TAGS.error} gap-1`}>
              <IconAlertTriangle size={10} />
              {u.changed}
            </span>
          )}
        </div>
        {u.salesperson && (
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant shrink-0">
            SALES ·{" "}
            <span className="font-black text-on-surface normal-case tracking-normal">
              {hl(u.salesperson, q)}
            </span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-xs items-center">
        {u.main &&
          (u.main.opSusi ||
            u.main.opJungsi ||
            u.main.devSusi ||
            u.main.devJungsi ||
            u.main.jaewoe ||
            u.main.foreigner) && (
            <>
              <span className={SECTION_TAGS.primary}>수시/정시</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-1">
                <MiniField label="운영·수시" value={u.main.opSusi} q={q} />
                <MiniField label="운영·정시" value={u.main.opJungsi} q={q} />
                <MiniField label="개발·수시" value={u.main.devSusi} q={q} />
                <MiniField label="개발·정시" value={u.main.devJungsi} q={q} />
                {u.main.jaewoe && (
                  <MiniField label="재외국민" value={u.main.jaewoe} q={q} />
                )}
                {u.main.foreigner && (
                  <MiniField label="외국인" value={u.main.foreigner} q={q} />
                )}
              </div>
            </>
          )}

        {u.grad && (u.grad.operator || u.grad.developer) && (
          <>
            <span className={SECTION_TAGS.tertiary}>대학원</span>
            <div className="grid grid-cols-2 gap-x-3">
              <MiniField label="운영" value={u.grad.operator} q={q} />
              <MiniField label="개발" value={u.grad.developer} q={q} />
            </div>
          </>
        )}

        {u.pims && (u.pims.operatorFull || u.pims.operatorReception) && (
          <>
            <span className={SECTION_TAGS.secondary}>PIMS</span>
            <div className="grid grid-cols-2 gap-x-3">
              <MiniField label="Full" value={u.pims.operatorFull} q={q} />
              <MiniField label="접수" value={u.pims.operatorReception} q={q} />
            </div>
          </>
        )}

        {u.score && (u.score.operator || u.score.developer) && (
          <>
            <span className={SECTION_TAGS.neutral}>성적산출</span>
            <div className="grid grid-cols-2 gap-x-3">
              <MiniField label="운영" value={u.score.operator} q={q} />
              <MiniField label="개발" value={u.score.developer} q={q} />
            </div>
          </>
        )}

        {u.app && (u.app.operator || u.app.developer) && (
          <>
            <span className={SECTION_TAGS.neutral}>상담앱</span>
            <div className="grid grid-cols-2 gap-x-3">
              <MiniField label="운영" value={u.app.operator} q={q} />
              <MiniField label="개발" value={u.app.developer} q={q} />
            </div>
          </>
        )}
      </div>

      {u.remark && (
        <p className="mt-3 pt-3 border-t border-outline-variant/20 text-xs text-on-surface-variant">
          <span className={HUD_LABEL}>REMARK</span>
          <span className="ml-2">{u.remark}</span>
        </p>
      )}
    </div>
  );
}

export default async function OperatorAssignmentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const originalSearch = params.search ?? "";
  const search = originalSearch.toLowerCase().trim();

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
      },
    });
  }

  for (const g of gradAssignments) {
    const existing = uniMap.get(g.universityName) ?? {
      universityName: g.universityName,
    };
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
      pims: {
        operatorFull: p.operatorFull,
        operatorReception: p.operatorReception,
      },
    });
  }

  for (const s of scoreAssignments) {
    const existing = uniMap.get(s.universityName) ?? {
      universityName: s.universityName,
    };
    uniMap.set(s.universityName, {
      ...existing,
      score: { operator: s.operator, developer: s.developer },
    });
  }

  for (const a of appAssignments) {
    const existing = uniMap.get(a.universityName) ?? {
      universityName: a.universityName,
    };
    uniMap.set(a.universityName, {
      ...existing,
      app: { operator: a.operator, developer: a.developer },
    });
  }

  const allUniversities = Array.from(uniMap.values()).sort((a, b) =>
    a.universityName.localeCompare(b.universityName, "ko"),
  );

  const filtered = !search
    ? []
    : allUniversities.filter((u) => {
        const text = [
          u.universityName,
          u.main?.opSusi,
          u.main?.opJungsi,
          u.main?.devSusi,
          u.main?.devJungsi,
          u.main?.jaewoe,
          u.main?.foreigner,
          u.grad?.operator,
          u.grad?.developer,
          u.pims?.operatorFull,
          u.pims?.operatorReception,
          u.score?.operator,
          u.score?.developer,
          u.app?.operator,
          u.app?.developer,
          u.salesperson,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return text.includes(search);
      });

  const totalUniv = assignments.length;
  const changedCount = allUniversities.filter((u) =>
    u.changed?.includes("변경"),
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="담당자배정"
        description={`2027학년도 운영자/개발자 배정 현황 · 총 ${totalUniv}개 대학`}
        breadcrumb={["운영", "담당자배정"]}
      />

      {/* HUD 검색 콘솔 — scan-line 시그니처 적용 */}
      <div className="relative overflow-hidden rounded-md border border-outline-variant/40 bg-surface-container-low">
        <div className="kinetic-grid absolute inset-0 pointer-events-none" />
        <div className="scan-line" />
        <div className="relative p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className={HUD_LABEL}>
              QUERY · 대학 / 운영자 / 개발자 검색
            </span>
          </div>
          <Suspense>
            <AssignmentSearch />
          </Suspense>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono uppercase tracking-wider text-on-surface-variant/70">
            <span>&gt; 대학명 또는 운영자명을 입력하면</span>
            <span>
              수시·정시·대학원·PIMS·성적·상담앱 배정이 한 번에 표시됩니다
            </span>
          </div>
        </div>
      </div>

      <KpiGrid>
        <KpiCard
          icon={<IconSchool size={18} className="text-on-surface-variant" />}
          label="배정 대학"
          value={totalUniv.toString()}
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
          icon={
            <IconBuildingArch size={18} className="text-on-surface-variant" />
          }
          label="대학원"
          value={gradAssignments.length.toString()}
          suffix="개"
          alert={changedCount > 0}
          change={changedCount > 0 ? `변경 ${changedCount}건` : undefined}
        />
      </KpiGrid>

      {search ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className={HUD_LABEL}>RESULT</span>
              <span className="text-sm text-on-surface-variant truncate">
                <span className="font-mono text-primary">
                  &quot;{originalSearch}&quot;
                </span>
              </span>
            </div>
            <span className="shrink-0 inline-flex items-baseline gap-1 font-mono tabular-nums">
              <span className="text-2xl font-black text-primary leading-none">
                {filtered.length}
              </span>
              <span className="text-[10px] uppercase tracking-[0.15em] text-on-surface-variant">
                matches
              </span>
            </span>
          </div>

          {filtered.length === 0 ? (
            <Card className="p-16 flex flex-col items-center text-on-surface-variant">
              <IconSearch size={40} className="mb-3 opacity-20" />
              <p className="text-sm font-bold uppercase tracking-[0.15em]">
                NO MATCH FOUND
              </p>
              <p className="text-xs mt-2 opacity-60 font-mono">
                &gt; 대학명의 일부 또는 운영자명 전체를 입력해 보세요
              </p>
            </Card>
          ) : (
            <div className="grid gap-3">
              {filtered.map((u) => (
                <UniversityRow key={u.universityName} u={u} q={search} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* 운영자별 배정현황 — 터미널 테이블 */}
          <div className="bg-surface-container rounded-md border border-outline-variant/30 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-outline-variant/30 bg-surface-container-low">
              <div className="flex items-center gap-2">
                <span className="inline-block w-1 h-4 bg-primary rounded-sm" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-on-surface">
                  OPERATOR ROSTER
                </h3>
                <span className="font-mono tabular-nums text-[10px] text-on-surface-variant">
                  [{operatorSummary.length}]
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant/70">
                &gt; click name to filter
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-surface-container-low">
                  <tr className="border-b border-outline-variant/30">
                    <th className="text-left py-2.5 px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                      운영자
                    </th>
                    <th className="text-center py-2.5 px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                      수시
                    </th>
                    <th className="text-center py-2.5 px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                      정시
                    </th>
                    <th className="text-center py-2.5 px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                      재외
                    </th>
                    <th className="text-center py-2.5 px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                      외국인
                    </th>
                    <th className="text-center py-2.5 px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                      초중고
                    </th>
                    <th className="text-center py-2.5 px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                      대학원
                    </th>
                    <th className="text-center py-2.5 px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                      PIMS
                    </th>
                    <th className="text-center py-2.5 px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                      성적
                    </th>
                    <th className="text-center py-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
                      Σ 합계
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {operatorSummary.map((op) => {
                    const total =
                      op.susiTotal +
                      op.jungsiTotal +
                      op.etcJaewoe +
                      op.etcForeign +
                      op.etcK12 +
                      op.etcGrad +
                      op.etcPimsFull +
                      op.etcScore;
                    return (
                      <tr
                        key={op.name}
                        className="border-b border-outline-variant/15 last:border-0 hover:bg-surface-container-high/60 hover:outline hover:outline-1 hover:-outline-offset-1 hover:outline-primary/30 transition-colors"
                      >
                        <td className="py-2.5 px-4">
                          <Link
                            href={`/operations/assignments?search=${encodeURIComponent(op.name)}`}
                            className="inline-flex items-center gap-2 font-bold text-on-surface hover:text-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary rounded-sm"
                            aria-label={`${op.name} 배정 검색`}
                          >
                            <span className="w-1 h-1 rounded-full bg-primary/60" />
                            {op.name}
                          </Link>
                        </td>
                        <td className="text-center py-2.5 px-2 font-mono tabular-nums font-bold text-on-surface">
                          {op.susiTotal || (
                            <span className="text-on-surface-variant/30">
                              ·
                            </span>
                          )}
                        </td>
                        <td className="text-center py-2.5 px-2 font-mono tabular-nums font-bold text-on-surface">
                          {op.jungsiTotal || (
                            <span className="text-on-surface-variant/30">
                              ·
                            </span>
                          )}
                        </td>
                        <td className="text-center py-2.5 px-2 font-mono tabular-nums text-on-surface-variant">
                          {op.etcJaewoe || (
                            <span className="text-on-surface-variant/30">
                              ·
                            </span>
                          )}
                        </td>
                        <td className="text-center py-2.5 px-2 font-mono tabular-nums text-on-surface-variant">
                          {op.etcForeign || (
                            <span className="text-on-surface-variant/30">
                              ·
                            </span>
                          )}
                        </td>
                        <td className="text-center py-2.5 px-2 font-mono tabular-nums text-on-surface-variant">
                          {op.etcK12 || (
                            <span className="text-on-surface-variant/30">
                              ·
                            </span>
                          )}
                        </td>
                        <td className="text-center py-2.5 px-2 font-mono tabular-nums text-on-surface-variant">
                          {op.etcGrad || (
                            <span className="text-on-surface-variant/30">
                              ·
                            </span>
                          )}
                        </td>
                        <td className="text-center py-2.5 px-2 font-mono tabular-nums text-on-surface-variant">
                          {op.etcPimsFull || (
                            <span className="text-on-surface-variant/30">
                              ·
                            </span>
                          )}
                        </td>
                        <td className="text-center py-2.5 px-2 font-mono tabular-nums text-on-surface-variant">
                          {op.etcScore || (
                            <span className="text-on-surface-variant/30">
                              ·
                            </span>
                          )}
                        </td>
                        <td className="text-center py-2.5 px-3 font-mono tabular-nums font-black text-primary">
                          {total}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 전체 대학 그리드 — 터미널 칩 */}
          <div className="bg-surface-container rounded-md border border-outline-variant/30 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-outline-variant/30 bg-surface-container-low">
              <div className="flex items-center gap-2">
                <span className="inline-block w-1 h-4 bg-primary rounded-sm" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-on-surface">
                  UNIVERSITY INDEX
                </h3>
                <span className="font-mono tabular-nums text-[10px] text-on-surface-variant">
                  [{allUniversities.length}]
                </span>
                {changedCount > 0 && (
                  <span className={`${SECTION_TAGS.error} ml-1`}>
                    <span className="font-mono tabular-nums mr-1">
                      {changedCount}
                    </span>
                    변경
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant/70">
                &gt; click to expand
              </span>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                {allUniversities.map((u) => {
                  const isChanged = u.changed?.includes("변경");
                  return (
                    <Link
                      key={u.universityName}
                      href={`/operations/assignments?search=${encodeURIComponent(u.universityName)}`}
                      aria-label={`${u.universityName} 배정 검색${isChanged ? " (담당자 변경)" : ""}`}
                      className={`group flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs text-on-surface border transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
                        isChanged
                          ? "bg-error/5 border-error/30 hover:border-error/60 hover:bg-error/10"
                          : "bg-surface-container-low border-outline-variant/20 hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                      }`}
                    >
                      {isChanged && (
                        <span className="relative flex h-1.5 w-1.5 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-error" />
                        </span>
                      )}
                      <span className="truncate font-medium group-hover:font-bold">
                        {u.universityName}
                      </span>
                    </Link>
                  );
                })}
              </div>
              <p className="mt-4 pt-3 border-t border-outline-variant/20 text-[10px] font-mono uppercase tracking-wider text-on-surface-variant/70 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-error" />
                <span>= 담당자 변경이 있는 대학</span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
