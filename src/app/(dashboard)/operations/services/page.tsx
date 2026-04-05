import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  PageHeader,
  KpiGrid,
  KpiCard,
  StatusBadge,
  Card,
  DataTable,
  TableSection,
} from "@/components/common";
import { IconNetwork, IconPlayerPlay, IconCircleCheck, IconClock, IconSearchOff, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import ServiceFilters from "./ServiceFilters";

const PAGE_SIZE = 50;
const TOTAL_CATEGORIES = 14;

const STATUS_CONFIG = {
  active: { variant: "success" as const, label: "등록중" },
  completed: { variant: "neutral" as const, label: "등록완료" },
  upcoming: { variant: "info" as const, label: "등록예정" },
} as const;

type ComputedStatus = keyof typeof STATUS_CONFIG;

function computeStatus(logCount: number): ComputedStatus {
  if (logCount === 0) return "upcoming";
  if (logCount >= TOTAL_CATEGORIES) return "completed";
  return "active";
}

interface SearchParams {
  page?: string;
  type?: string;
  search?: string;
  region?: string;
  category?: string;
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createClient();
  const params = await searchParams;

  const currentPage = Math.max(1, Number(params.page) || 1);
  const typeFilter = params.type ?? "";
  const searchFilter = params.search ?? "";
  const regionFilter = params.region ?? "";
  const categoryFilter = params.category ?? "";

  // 전체 서비스 수
  const { count: totalCountRaw } = await supabase
    .from("services")
    .select("id", { count: "exact", head: true });
  const totalCount = totalCountRaw ?? 0;

  // 작업이력 기반 상태 계산을 위해 전체 work_logs의 service_id 조회
  const logCountMap = new Map<number, number>();
  let logFrom = 0;
  const BATCH = 1000;
  while (true) {
    const { data } = await supabase
      .from("service_work_logs")
      .select("service_id")
      .range(logFrom, logFrom + BATCH - 1);
    if (!data || data.length === 0) break;
    for (const row of data) {
      logCountMap.set(row.service_id, (logCountMap.get(row.service_id) || 0) + 1);
    }
    if (data.length < BATCH) break;
    logFrom += BATCH;
  }

  // KPI 계산
  let activeCount = 0;
  let completedCount = 0;
  for (const count of logCountMap.values()) {
    if (count >= TOTAL_CATEGORIES) completedCount++;
    else activeCount++;
  }
  const upcomingCount = totalCount - activeCount - completedCount;

  // 필터용 고유값
  const { data: regionRows } = await supabase
    .from("services")
    .select("region")
    .not("region", "is", null)
    .order("region");

  const { data: categoryRows } = await supabase
    .from("services")
    .select("category")
    .not("category", "is", null)
    .order("category");

  const regions = [...new Set(regionRows?.map((r) => r.region).filter(Boolean) ?? [])];
  const categories = [...new Set(categoryRows?.map((c) => c.category).filter(Boolean) ?? [])];

  // 필터링 쿼리
  let query = supabase.from("services").select("*", { count: "exact" });

  if (typeFilter) {
    query = query.eq("reception_type", typeFilter);
  }
  if (searchFilter) {
    query = query.or(
      `university_name.ilike.%${searchFilter}%,service_name.ilike.%${searchFilter}%,operator.ilike.%${searchFilter}%`,
    );
  }
  if (regionFilter) {
    query = query.eq("region", regionFilter);
  }
  if (categoryFilter) {
    query = query.eq("category", categoryFilter);
  }

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: services, count: filteredCount } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalFiltered = filteredCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));

  // DataTable 컬럼 정의
  const columns = [
    { key: "university_name", label: "대학명", className: "w-[20%]" },
    { key: "service_name", label: "서비스명", className: "w-[30%]" },
    { key: "reception_type", label: "접수구분", className: "w-[10%]" },
    { key: "category", label: "카테고리", className: "w-[10%]" },
    { key: "operator", label: "운영자", className: "w-[10%]" },
    { key: "status", label: "상태", className: "w-[10%]" },
  ];

  // DataTable 데이터 매핑
  const tableData = (services ?? []).map((s) => {
    const logCount = logCountMap.get(s.id) ?? 0;
    const status = computeStatus(logCount);
    const statusCfg = STATUS_CONFIG[status];

    return {
      university_name: (
        <Link
          href={`/operations/services/${s.id}`}
          className="font-medium text-primary hover:text-primary/70 underline underline-offset-2 decoration-primary/30 hover:decoration-primary transition-colors"
        >
          {s.university_name ?? "-"}
        </Link>
      ),
      service_name: (s.service_name ?? "-").replace(/\d{4}학년도\s*|\d{4}-(?=\d학기)/g, ""),
      reception_type: s.reception_type ? (
        <StatusBadge variant="neutral">{s.reception_type}</StatusBadge>
      ) : (
        "-"
      ),
      category: s.category ?? "-",
      operator: s.operator ?? "-",
      status: (
        <StatusBadge variant={statusCfg.variant} dot={status === "active"}>
          {statusCfg.label}
        </StatusBadge>
      ),
    };
  });

  // 페이지네이션 URL 생성
  function buildPageUrl(page: number): string {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (typeFilter) params.set("type", typeFilter);
    if (searchFilter) params.set("search", searchFilter);
    if (regionFilter) params.set("region", regionFilter);
    if (categoryFilter) params.set("category", categoryFilter);
    const qs = params.toString();
    return qs ? `?${qs}` : "?";
  }

  const btnBase = "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold";
  const btnActive = `${btnBase} bg-surface-container-high text-on-surface-variant hover:bg-surface-bright transition-colors`;
  const btnDisabled = `${btnBase} bg-surface-container-high text-on-surface-variant/40 cursor-not-allowed`;

  return (
    <div className="space-y-8">
      <PageHeader
        title="서비스 관리"
        description="등록된 서비스의 현황을 조회하고 관리합니다."
        breadcrumb={["운영", "서비스"]}
      />

      <KpiGrid>
        <KpiCard
          icon={<IconNetwork size={18} className="text-on-surface-variant" />}
          label="전체 서비스"
          value={totalCount.toString()}
          suffix="건"
        />
        <KpiCard
          icon={<IconPlayerPlay size={18} className="text-on-surface-variant" />}
          label="등록중"
          value={activeCount.toString()}
          suffix="건"
          change={`${totalCount > 0 ? ((activeCount / totalCount) * 100).toFixed(0) : 0}%`}
          trend="up"
        />
        <KpiCard
          icon={<IconCircleCheck size={18} className="text-on-surface-variant" />}
          label="등록완료"
          value={completedCount.toString()}
          suffix="건"
        />
        <KpiCard
          icon={<IconClock size={18} className="text-on-surface-variant" />}
          label="등록예정"
          value={upcomingCount.toString()}
          suffix="건"
          change={upcomingCount > 0 ? `${upcomingCount}건 대기` : undefined}
          trend={upcomingCount > 0 ? "neutral" : undefined}
        />
      </KpiGrid>

      <Card className="p-6">
        <ServiceFilters regions={regions} categories={categories} />
      </Card>

      <TableSection totalCount={totalFiltered}>
        <DataTable columns={columns} data={tableData} />
        {totalFiltered === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
            <IconSearchOff size={40} className="mb-2 opacity-30" />
            <p className="text-sm font-medium">
              조건에 맞는 서비스가 없습니다.
            </p>
          </div>
        )}
      </TableSection>

      {/* 페이지네이션 */}
      {totalFiltered > 0 && (
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">
            {currentPage > 1 ? (
              <a href={buildPageUrl(currentPage - 1)} className={btnActive}>
                <IconChevronLeft size={16} />이전
              </a>
            ) : (
              <span className={btnDisabled}>
                <IconChevronLeft size={16} />이전
              </span>
            )}
            <span className="text-xs text-on-surface-variant tabular-nums">
              <span className="font-bold text-on-surface">{currentPage}</span> / {totalPages}
            </span>
            {currentPage < totalPages ? (
              <a href={buildPageUrl(currentPage + 1)} className={btnActive}>
                다음<IconChevronRight size={16} />
              </a>
            ) : (
              <span className={btnDisabled}>
                다음<IconChevronRight size={16} />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
