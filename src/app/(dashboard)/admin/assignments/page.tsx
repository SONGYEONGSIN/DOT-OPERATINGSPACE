import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import {
  PageHeader,
  KpiGrid,
  KpiCard,
  StatusBadge,
  DataTable,
  TableSection,
  FilterBar,
  UserAvatar,
  Card,
  ProgressBar,
} from "@/components/common";
import { IconBuildingBank, IconUsers, IconUserCheck, IconUserOff } from "@tabler/icons-react";

interface PageProps {
  searchParams: Promise<{ search?: string; tab?: string }>;
}

export default async function AssignmentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const searchFilter = params.search ?? "";
  const tabFilter = params.tab ?? "all";

  const supabase = createClient();

  // 전체 서비스 조회
  const { count: svcCount } = await supabase
    .from("services")
    .select("id", { count: "exact", head: true });

  const allServices: { id: number; university_name: string | null; service_name: string | null; operator: string | null; reception_type: string | null; category: string | null; region: string | null }[] = [];
  for (let offset = 0; offset < (svcCount ?? 0); offset += 1000) {
    const { data } = await supabase
      .from("services")
      .select("id, university_name, service_name, operator, reception_type, category, region")
      .range(offset, offset + 999);
    if (data) allServices.push(...data);
  }

  const { data: profileRows } = await supabase
    .from("profiles")
    .select("name, team, status")
    .eq("status", "active")
    .order("name");

  const profiles = (profileRows ?? []) as { name: string; team: string; status: string }[];

  // 운영자별 통계
  const operatorMap = new Map<string, { total: number; universities: Set<string> }>();
  for (const svc of allServices) {
    if (!svc.operator) continue;
    if (!operatorMap.has(svc.operator)) {
      operatorMap.set(svc.operator, { total: 0, universities: new Set() });
    }
    const entry = operatorMap.get(svc.operator)!;
    entry.total++;
    if (svc.university_name) entry.universities.add(svc.university_name);
  }

  const operatorStats = Array.from(operatorMap.entries())
    .map(([name, stat]) => ({
      name,
      total: stat.total,
      universities: stat.universities.size,
      team: profiles.find((p) => p.name === name)?.team ?? "-",
    }))
    .sort((a, b) => b.total - a.total);

  const maxTotal = operatorStats.length > 0 ? operatorStats[0].total : 1;

  // KPI
  const totalServices = allServices.length;
  const assignedCount = allServices.filter((s) => s.operator).length;
  const unassignedCount = totalServices - assignedCount;
  const uniqueUniversities = new Set(allServices.map((s) => s.university_name).filter(Boolean)).size;

  // 필터 적용한 서비스 목록
  let filtered = allServices;
  if (tabFilter === "assigned") filtered = filtered.filter((s) => s.operator);
  if (tabFilter === "unassigned") filtered = filtered.filter((s) => !s.operator);

  if (searchFilter) {
    const q = searchFilter.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        (s.university_name ?? "").toLowerCase().includes(q) ||
        (s.service_name ?? "").toLowerCase().includes(q) ||
        (s.operator ?? "").toLowerCase().includes(q),
    );
  }

  const columns = [
    { key: "university", label: "대학명", className: "w-[20%]" },
    { key: "service", label: "서비스명", className: "w-[25%]" },
    { key: "operator", label: "운영자", className: "w-[12%]" },
    { key: "reception", label: "접수구분", className: "w-[12%]" },
    { key: "category", label: "카테고리", className: "w-[10%]" },
    { key: "region", label: "지역", className: "w-[8%]" },
  ];

  const tableData = filtered.slice(0, 100).map((s) => ({
    university: <span className="text-sm font-medium text-on-surface">{s.university_name ?? "-"}</span>,
    service: <span className="text-xs text-on-surface-variant">{(s.service_name ?? "-").replace(/\d{4}학년도\s*|\d{4}-(?=\d학기)/g, "")}</span>,
    operator: s.operator ? (
      <div className="flex items-center gap-1.5">
        <UserAvatar name={s.operator} size="sm" className="!w-5 !h-5" />
        <span className="text-xs text-on-surface">{s.operator}</span>
      </div>
    ) : (
      <span className="text-xs text-error/70 italic">미배정</span>
    ),
    reception: <span className="text-xs text-on-surface-variant">{s.reception_type ?? "-"}</span>,
    category: <span className="text-xs text-on-surface-variant">{s.category ?? "-"}</span>,
    region: <span className="text-xs text-on-surface-variant">{s.region ?? "-"}</span>,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="대학배정"
        description="서비스별 운영자 배정 현황을 확인하고 관리합니다."
        breadcrumb={["관리자", "대학배정"]}
      />

      <KpiGrid>
        <KpiCard
          icon={<IconBuildingBank size={18} className="text-on-surface-variant" />}
          label="등록 대학"
          value={uniqueUniversities.toString()}
          suffix="개"
        />
        <KpiCard
          icon={<IconUsers size={18} className="text-on-surface-variant" />}
          label="전체 서비스"
          value={totalServices.toLocaleString()}
          suffix="건"
        />
        <KpiCard
          icon={<IconUserCheck size={18} className="text-on-surface-variant" />}
          label="배정 완료"
          value={assignedCount.toLocaleString()}
          suffix="건"
          change={`${totalServices > 0 ? Math.round((assignedCount / totalServices) * 100) : 0}%`}
          trend="up"
        />
        <KpiCard
          icon={<IconUserOff size={18} className="text-on-surface-variant" />}
          label="미배정"
          value={unassignedCount.toString()}
          suffix="건"
          alert={unassignedCount > 0}
        />
      </KpiGrid>

      {/* 운영자별 배정 현황 */}
      <Card className="p-6">
        <h3 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-5">운영자별 배정 현황</h3>
        <div className="space-y-3">
          {operatorStats.map((op) => (
            <div key={op.name} className="flex items-center gap-4">
              <div className="flex items-center gap-2 w-32 shrink-0">
                <UserAvatar name={op.name} size="sm" className="!w-6 !h-6" />
                <div>
                  <span className="text-xs font-medium text-on-surface">{op.name}</span>
                  <p className="text-[10px] text-on-surface-variant">{op.team}</p>
                </div>
              </div>
              <div className="flex-1">
                <ProgressBar value={op.total} max={maxTotal} size="sm" color="primary" />
              </div>
              <div className="text-right w-24 shrink-0">
                <span className="text-xs font-black text-on-surface tabular-nums">{op.total}건</span>
                <span className="text-[10px] text-on-surface-variant ml-1">({op.universities}개 대학)</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 서비스 목록 */}
      <Suspense>
        <FilterBar
          searchPlaceholder="대학명, 서비스명, 운영자 검색..."
          tabs={[
            { label: "전체", value: "all" },
            { label: "배정완료", value: "assigned" },
            { label: "미배정", value: "unassigned" },
          ]}
        />
      </Suspense>

      <TableSection totalCount={filtered.length}>
        <DataTable columns={columns} data={tableData} />
        {filtered.length > 100 && (
          <div className="px-4 py-2 text-xs text-on-surface-variant bg-surface-container-high/30 text-center">
            상위 100건 표시 · 검색으로 범위를 좁혀주세요 (총 {filtered.length.toLocaleString()}건)
          </div>
        )}
      </TableSection>
    </div>
  );
}
