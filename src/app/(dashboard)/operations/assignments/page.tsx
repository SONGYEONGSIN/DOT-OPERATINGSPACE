import { Suspense } from "react";
import {
  PageHeader,
  KpiGrid,
  KpiCard,
  Card,
  DataTable,
  TableSection,
} from "@/components/common";
import {
  IconUsers,
  IconSchool,
  IconNetwork,
  IconBuildingArch,
  IconSearchOff,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { fetchAssignments } from "@/lib/sharepoint";
import AssignmentFilters from "./AssignmentFilters";

const PAGE_SIZE = 50;

interface SearchParams {
  tab?: string;
  search?: string;
  region?: string;
  category?: string;
  page?: string;
}

export default async function OperatorAssignmentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const activeTab = params.tab ?? "";
  const search = (params.search ?? "").toLowerCase();
  const regionFilter = params.region ?? "";
  const categoryFilter = params.category ?? "";
  const currentPage = Math.max(1, Number(params.page) || 1);

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

  // ── 지역/카테고리 고유값 추출 ──
  const regions = [
    ...new Set(
      [
        ...assignments.map((a) => a.region),
        ...pimsAssignments.map((p) => p.region),
      ].filter(Boolean),
    ),
  ].sort();

  const categories = [
    ...new Set(
      [
        ...assignments.map((a) => a.category),
        ...pimsAssignments.map((p) => p.category),
      ].filter(Boolean),
    ),
  ].sort();

  // ── 검색/필터 헬퍼 ──
  const q = search;

  const matchAssignment = (a: (typeof assignments)[0]) =>
    (!q ||
      a.universityName.toLowerCase().includes(q) ||
      a.op2027.susi.toLowerCase().includes(q) ||
      a.op2027.jungsi.toLowerCase().includes(q) ||
      a.salesperson.toLowerCase().includes(q)) &&
    (!regionFilter || a.region === regionFilter) &&
    (!categoryFilter || a.category === categoryFilter);

  const matchGrad = (g: (typeof gradAssignments)[0]) =>
    !q ||
    g.universityName.toLowerCase().includes(q) ||
    g.operator.toLowerCase().includes(q) ||
    g.developer.toLowerCase().includes(q);

  const matchPims = (p: (typeof pimsAssignments)[0]) =>
    (!q ||
      p.universityName.toLowerCase().includes(q) ||
      p.operatorFull.toLowerCase().includes(q) ||
      p.operatorReception.toLowerCase().includes(q)) &&
    (!regionFilter || p.region === regionFilter) &&
    (!categoryFilter || p.category === categoryFilter);

  const matchScore = (s: (typeof scoreAssignments)[0]) =>
    !q ||
    s.universityName.toLowerCase().includes(q) ||
    s.operator.toLowerCase().includes(q) ||
    s.developer.toLowerCase().includes(q);

  const matchApp = (a: (typeof appAssignments)[0]) =>
    !q ||
    a.universityName.toLowerCase().includes(q) ||
    a.operator.toLowerCase().includes(q) ||
    a.developer.toLowerCase().includes(q);

  const matchSummary = (s: (typeof operatorSummary)[0]) =>
    !q || s.name.toLowerCase().includes(q);

  // ── 필터링 ──
  const filteredAssignments = assignments.filter(matchAssignment);
  const filteredGrad = gradAssignments.filter(matchGrad);
  const filteredPims = pimsAssignments.filter(matchPims);
  const filteredScore = scoreAssignments.filter(matchScore);
  const filteredApp = appAssignments.filter(matchApp);
  const filteredOpSummary = operatorSummary.filter(matchSummary);

  const totalUniv = assignments.length;

  // ── 페이지네이션 헬퍼 ──
  function paginate<T>(items: T[]): {
    paged: T[];
    total: number;
    totalPages: number;
  } {
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const from = (currentPage - 1) * PAGE_SIZE;
    const paged = items.slice(from, from + PAGE_SIZE);
    return { paged, total, totalPages };
  }

  function buildPageUrl(page: number): string {
    const p = new URLSearchParams();
    if (activeTab) p.set("tab", activeTab);
    if (search) p.set("search", search);
    if (regionFilter) p.set("region", regionFilter);
    if (categoryFilter) p.set("category", categoryFilter);
    if (page > 1) p.set("page", String(page));
    const qs = p.toString();
    return qs ? `?${qs}` : "?";
  }

  // ── 배정현황 (summary) ──
  const summaryContent = (
    <div className="space-y-6">
      <Card className="p-5">
        <h3 className="text-sm font-bold text-on-surface mb-4">
          운영자 배정현황
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-outline-variant/15">
                <th className="text-left py-2 px-3 font-bold text-on-surface-variant">
                  운영자
                </th>
                <th className="text-center py-2 px-1 font-bold text-on-surface-variant">
                  수시
                </th>
                <th className="text-center py-2 px-1 font-bold text-on-surface-variant">
                  정시
                </th>
                <th className="text-center py-2 px-1 font-bold text-on-surface-variant">
                  재외
                </th>
                <th className="text-center py-2 px-1 font-bold text-on-surface-variant">
                  외국인
                </th>
                <th className="text-center py-2 px-1 font-bold text-on-surface-variant">
                  초중고
                </th>
                <th className="text-center py-2 px-1 font-bold text-on-surface-variant">
                  대학원
                </th>
                <th className="text-center py-2 px-1 font-bold text-on-surface-variant">
                  PIMS
                </th>
                <th className="text-center py-2 px-1 font-bold text-on-surface-variant">
                  성적
                </th>
                <th className="text-center py-2 px-1 font-bold text-on-surface-variant">
                  합계
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOpSummary.map((op) => {
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
                    className="border-b border-outline-variant/5 hover:bg-surface-container-high/30"
                  >
                    <td className="py-2 px-3 font-bold text-on-surface">
                      {op.name}
                    </td>
                    <td className="text-center py-2 px-1 tabular-nums font-bold text-primary">
                      {op.susiTotal}
                    </td>
                    <td className="text-center py-2 px-1 tabular-nums font-bold text-primary">
                      {op.jungsiTotal}
                    </td>
                    <td className="text-center py-2 px-1 tabular-nums">
                      {op.etcJaewoe || "-"}
                    </td>
                    <td className="text-center py-2 px-1 tabular-nums">
                      {op.etcForeign || "-"}
                    </td>
                    <td className="text-center py-2 px-1 tabular-nums">
                      {op.etcK12 || "-"}
                    </td>
                    <td className="text-center py-2 px-1 tabular-nums">
                      {op.etcGrad || "-"}
                    </td>
                    <td className="text-center py-2 px-1 tabular-nums">
                      {op.etcPimsFull || "-"}
                    </td>
                    <td className="text-center py-2 px-1 tabular-nums">
                      {op.etcScore || "-"}
                    </td>
                    <td className="text-center py-2 px-1 tabular-nums font-black text-on-surface">
                      {total}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  // ── 배정리스트 ──
  const listCols = [
    { key: "category", label: "대분류", className: "w-[7%]" },
    { key: "region", label: "지역", className: "w-[5%]" },
    { key: "university", label: "대학명", className: "w-[16%]" },
    { key: "salesperson", label: "영업자", className: "w-[7%]" },
    { key: "changed", label: "변경", className: "w-[7%]" },
    { key: "opSusi", label: "운영(수시)", className: "w-[8%]" },
    { key: "opJungsi", label: "운영(정시)", className: "w-[8%]" },
    { key: "devSusi", label: "개발(수시)", className: "w-[8%]" },
    { key: "devJungsi", label: "개발(정시)", className: "w-[8%]" },
    { key: "opJaewoe", label: "운영(재외)", className: "w-[7%]" },
    { key: "opForeigner", label: "운영(외국인)", className: "w-[7%]" },
    { key: "remark", label: "특이사항", className: "w-[8%]" },
  ];

  const listPaginated = paginate(filteredAssignments);
  const listData = listPaginated.paged.map((a) => ({
    category: (
      <span
        className={`text-xs font-bold ${a.category === "4년제" ? "text-primary" : a.category.includes("전문") ? "text-tertiary" : "text-on-surface-variant"}`}
      >
        {a.category}
      </span>
    ),
    region: (
      <span className="text-xs text-on-surface-variant">{a.region || "-"}</span>
    ),
    university: (
      <span className="text-sm font-medium text-on-surface">
        {a.universityName}
      </span>
    ),
    salesperson: (
      <span className="text-xs text-on-surface-variant">
        {a.salesperson || "-"}
      </span>
    ),
    changed: a.changed.includes("변경") ? (
      <span className="text-xs font-bold text-error">{a.changed}</span>
    ) : (
      <span className="text-xs text-on-surface-variant">
        {a.changed || "-"}
      </span>
    ),
    opSusi: (
      <span className="text-xs text-on-surface">{a.op2027.susi || "-"}</span>
    ),
    opJungsi: (
      <span className="text-xs text-on-surface">{a.op2027.jungsi || "-"}</span>
    ),
    devSusi: (
      <span className="text-xs text-on-surface-variant">
        {a.dev2027.susi || "-"}
      </span>
    ),
    devJungsi: (
      <span className="text-xs text-on-surface-variant">
        {a.dev2027.jungsi || "-"}
      </span>
    ),
    opJaewoe: (
      <span className="text-xs text-on-surface">{a.op2027.jaewoe || "-"}</span>
    ),
    opForeigner: (
      <span className="text-xs text-on-surface">
        {a.op2027.foreigner || "-"}
      </span>
    ),
    remark: a.remark ? (
      <span
        className="text-xs text-on-surface-variant truncate block max-w-[100px]"
        title={a.remark}
      >
        {a.remark}
      </span>
    ) : (
      <span className="text-xs text-on-surface-variant">-</span>
    ),
  }));

  // ── 대학원 ──
  const gradCols = [
    { key: "university", label: "대학명", className: "w-[18%]" },
    { key: "serviceYn", label: "서비스", className: "w-[6%] text-center" },
    { key: "count", label: "개수", className: "w-[6%] text-center" },
    { key: "changed", label: "변경", className: "w-[8%]" },
    { key: "operator", label: "운영자", className: "w-[10%]" },
    { key: "developer", label: "개발자", className: "w-[10%]" },
    { key: "prevOp", label: "前 운영자", className: "w-[10%]" },
    { key: "prevDev", label: "前 개발자", className: "w-[10%]" },
    { key: "remark", label: "비고", className: "w-[12%]" },
  ];

  const gradPaginated = paginate(filteredGrad);
  const gradData = gradPaginated.paged.map((g) => ({
    university: (
      <span className="text-sm font-medium text-on-surface">
        {g.universityName}
      </span>
    ),
    serviceYn:
      g.serviceYn === "Y" ? (
        <span className="text-xs font-bold text-primary">Y</span>
      ) : (
        <span className="text-xs text-on-surface-variant">
          {g.serviceYn || "-"}
        </span>
      ),
    count: (
      <span className="text-xs tabular-nums">{g.serviceCount || "-"}</span>
    ),
    changed: g.changed.includes("변경") ? (
      <span className="text-xs font-bold text-error">{g.changed}</span>
    ) : (
      <span className="text-xs text-on-surface-variant">
        {g.changed || "-"}
      </span>
    ),
    operator: (
      <span className="text-xs font-medium text-on-surface">
        {g.operator || "-"}
      </span>
    ),
    developer: (
      <span className="text-xs text-on-surface-variant">
        {g.developer || "-"}
      </span>
    ),
    prevOp: (
      <span className="text-xs text-on-surface-variant">
        {g.prevOperator || "-"}
      </span>
    ),
    prevDev: (
      <span className="text-xs text-on-surface-variant">
        {g.prevDeveloper || "-"}
      </span>
    ),
    remark: g.remark ? (
      <span
        className="text-xs text-on-surface-variant truncate block max-w-[140px]"
        title={g.remark}
      >
        {g.remark}
      </span>
    ) : (
      <span className="text-xs text-on-surface-variant">-</span>
    ),
  }));

  // ── PIMS ──
  const pimsCols = [
    { key: "category", label: "대분류", className: "w-[8%]" },
    { key: "region", label: "지역", className: "w-[6%]" },
    { key: "university", label: "대학명", className: "w-[16%]" },
    { key: "type", label: "구분", className: "w-[8%]" },
    { key: "changed", label: "변경", className: "w-[8%]" },
    { key: "opFull", label: "운영(Full)", className: "w-[10%]" },
    { key: "opReception", label: "접수운영", className: "w-[10%]" },
    { key: "prevOp", label: "前 운영자", className: "w-[10%]" },
    { key: "remark", label: "비고", className: "w-[10%]" },
  ];

  const pimsPaginated = paginate(filteredPims);
  const pimsData = pimsPaginated.paged.map((p) => ({
    category: (
      <span className="text-xs font-bold text-on-surface-variant">
        {p.category || "-"}
      </span>
    ),
    region: (
      <span className="text-xs text-on-surface-variant">{p.region || "-"}</span>
    ),
    university: (
      <span className="text-sm font-medium text-on-surface">
        {p.universityName}
      </span>
    ),
    type: (
      <span className="text-xs text-on-surface">{p.serviceType || "-"}</span>
    ),
    changed: p.changed.includes("변경") ? (
      <span className="text-xs font-bold text-error">{p.changed}</span>
    ) : (
      <span className="text-xs text-on-surface-variant">
        {p.changed || "-"}
      </span>
    ),
    opFull: (
      <span className="text-xs font-medium text-on-surface">
        {p.operatorFull || "-"}
      </span>
    ),
    opReception: (
      <span className="text-xs text-on-surface">
        {p.operatorReception || "-"}
      </span>
    ),
    prevOp: (
      <span className="text-xs text-on-surface-variant">
        {p.prevOperator || "-"}
      </span>
    ),
    remark: p.remark ? (
      <span
        className="text-xs text-on-surface-variant truncate block max-w-[120px]"
        title={p.remark}
      >
        {p.remark}
      </span>
    ) : (
      <span className="text-xs text-on-surface-variant">-</span>
    ),
  }));

  // ── 성적산출 ──
  const scoreCols = [
    { key: "university", label: "대학명", className: "w-[18%]" },
    { key: "serviceYn", label: "서비스", className: "w-[6%] text-center" },
    { key: "operator", label: "운영자", className: "w-[10%]" },
    { key: "developer", label: "개발자", className: "w-[10%]" },
    { key: "susiN", label: "수시내신", className: "w-[7%] text-center" },
    { key: "jungsiN", label: "정시내신", className: "w-[7%] text-center" },
    { key: "jungsiS", label: "정시수능", className: "w-[7%] text-center" },
    { key: "prevOp", label: "前 운영자", className: "w-[10%]" },
    { key: "prevDev", label: "前 개발자", className: "w-[10%]" },
  ];

  const scorePaginated = paginate(filteredScore);
  const scoreData = scorePaginated.paged.map((sc) => ({
    university: (
      <span className="text-sm font-medium text-on-surface">
        {sc.universityName}
      </span>
    ),
    serviceYn:
      sc.serviceYn === "Y" ? (
        <span className="text-xs font-bold text-primary">Y</span>
      ) : (
        <span className="text-xs text-on-surface-variant">
          {sc.serviceYn || "-"}
        </span>
      ),
    operator: (
      <span className="text-xs font-medium text-on-surface">
        {sc.operator || "-"}
      </span>
    ),
    developer: (
      <span className="text-xs text-on-surface-variant">
        {sc.developer || "-"}
      </span>
    ),
    susiN: sc.susiNaesin ? (
      <span className="text-xs font-bold text-primary">O</span>
    ) : (
      <span className="text-xs text-on-surface-variant">-</span>
    ),
    jungsiN: sc.jungsiNaesin ? (
      <span className="text-xs font-bold text-primary">O</span>
    ) : (
      <span className="text-xs text-on-surface-variant">-</span>
    ),
    jungsiS: sc.jungsiSuneung ? (
      <span className="text-xs font-bold text-primary">O</span>
    ) : (
      <span className="text-xs text-on-surface-variant">-</span>
    ),
    prevOp: (
      <span className="text-xs text-on-surface-variant">
        {sc.prevOperator || "-"}
      </span>
    ),
    prevDev: (
      <span className="text-xs text-on-surface-variant">
        {sc.prevDeveloper || "-"}
      </span>
    ),
  }));

  // ── 상담앱 ──
  const appCols = [
    { key: "university", label: "대학명", className: "w-[16%]" },
    { key: "operator", label: "운영자", className: "w-[9%]" },
    { key: "developer", label: "개발자", className: "w-[9%]" },
    { key: "status", label: "현황", className: "w-[14%]" },
    { key: "device", label: "디바이스", className: "w-[9%]" },
    { key: "usage", label: "사용", className: "w-[6%] text-center" },
    { key: "prevOp", label: "前 운영자", className: "w-[9%]" },
    { key: "prevDev", label: "前 개발자", className: "w-[9%]" },
    { key: "remark", label: "비고", className: "w-[12%]" },
  ];

  const appPaginated = paginate(filteredApp);
  const appData = appPaginated.paged.map((a) => ({
    university: (
      <span className="text-sm font-medium text-on-surface">
        {a.universityName}
      </span>
    ),
    operator: (
      <span className="text-xs font-medium text-on-surface">
        {a.operator || "-"}
      </span>
    ),
    developer: (
      <span className="text-xs text-on-surface-variant">
        {a.developer || "-"}
      </span>
    ),
    status: a.status ? (
      <span
        className="text-xs text-on-surface-variant truncate block max-w-[140px]"
        title={a.status}
      >
        {a.status}
      </span>
    ) : (
      <span className="text-xs text-on-surface-variant">-</span>
    ),
    device: (
      <span className="text-xs text-on-surface-variant">{a.device || "-"}</span>
    ),
    usage:
      a.usage === "사용" ? (
        <span className="text-xs font-bold text-primary">사용</span>
      ) : (
        <span className="text-xs text-on-surface-variant">
          {a.usage || "-"}
        </span>
      ),
    prevOp: (
      <span className="text-xs text-on-surface-variant">
        {a.prevOperator || "-"}
      </span>
    ),
    prevDev: (
      <span className="text-xs text-on-surface-variant">
        {a.prevDeveloper || "-"}
      </span>
    ),
    remark: a.remark ? (
      <span
        className="text-xs text-on-surface-variant truncate block max-w-[120px]"
        title={a.remark}
      >
        {a.remark}
      </span>
    ) : (
      <span className="text-xs text-on-surface-variant">-</span>
    ),
  }));

  // ── 활성 탭별 콘텐츠/페이지네이션 결정 ──
  type TabConfig = {
    columns: { key: string; label: string; className?: string }[];
    data: Record<string, React.ReactNode>[];
    total: number;
    totalPages: number;
  };

  const tabConfigs: Record<string, TabConfig> = {
    list: {
      columns: listCols,
      data: listData,
      total: listPaginated.total,
      totalPages: listPaginated.totalPages,
    },
    grad: {
      columns: gradCols,
      data: gradData,
      total: gradPaginated.total,
      totalPages: gradPaginated.totalPages,
    },
    pims: {
      columns: pimsCols,
      data: pimsData,
      total: pimsPaginated.total,
      totalPages: pimsPaginated.totalPages,
    },
    score: {
      columns: scoreCols,
      data: scoreData,
      total: scorePaginated.total,
      totalPages: scorePaginated.totalPages,
    },
    app: {
      columns: appCols,
      data: appData,
      total: appPaginated.total,
      totalPages: appPaginated.totalPages,
    },
  };

  // "전체" tab shows summary + all tables stacked
  const isSummaryTab = activeTab === "";
  const currentTabConfig = !isSummaryTab ? tabConfigs[activeTab] : undefined;

  const btnBase =
    "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold";
  const btnActive = `${btnBase} bg-surface-container-high text-on-surface-variant hover:bg-surface-bright transition-colors`;
  const btnDisabled = `${btnBase} bg-surface-container-high text-on-surface-variant/40 cursor-not-allowed`;

  return (
    <div className="space-y-8">
      <PageHeader
        title="담당자배정"
        description={`2027학년도 운영자/개발자 배정 현황 (총 ${totalUniv}개 대학)`}
        breadcrumb={["운영", "담당자배정"]}
      />

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
        />
      </KpiGrid>

      <Card className="p-5">
        <Suspense>
          <AssignmentFilters regions={regions} categories={categories} />
        </Suspense>
      </Card>

      {/* ── 전체 탭: summary + 모든 테이블 ── */}
      {isSummaryTab && (
        <div className="space-y-6">
          {summaryContent}

          <TableSection totalCount={filteredAssignments.length}>
            <DataTable columns={listCols} data={listData} />
          </TableSection>
        </div>
      )}

      {/* ── 개별 탭: 해당 테이블만 ── */}
      {currentTabConfig && (
        <>
          <TableSection totalCount={currentTabConfig.total}>
            <DataTable
              columns={currentTabConfig.columns}
              data={currentTabConfig.data}
            />
            {currentTabConfig.total === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
                <IconSearchOff size={40} className="mb-2 opacity-30" />
                <p className="text-sm font-medium">
                  조건에 맞는 데이터가 없습니다.
                </p>
              </div>
            )}
          </TableSection>

          {/* 페이지네이션 */}
          {currentTabConfig.total > PAGE_SIZE && (
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-2">
                {currentPage > 1 ? (
                  <a href={buildPageUrl(currentPage - 1)} className={btnActive}>
                    <IconChevronLeft size={16} />
                    이전
                  </a>
                ) : (
                  <span className={btnDisabled}>
                    <IconChevronLeft size={16} />
                    이전
                  </span>
                )}
                <span className="text-xs text-on-surface-variant tabular-nums">
                  <span className="font-bold text-on-surface">
                    {currentPage}
                  </span>{" "}
                  / {currentTabConfig.totalPages}
                </span>
                {currentPage < currentTabConfig.totalPages ? (
                  <a href={buildPageUrl(currentPage + 1)} className={btnActive}>
                    다음
                    <IconChevronRight size={16} />
                  </a>
                ) : (
                  <span className={btnDisabled}>
                    다음
                    <IconChevronRight size={16} />
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
