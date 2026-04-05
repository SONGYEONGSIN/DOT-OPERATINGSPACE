import {
  PageHeader,
  KpiGrid,
  KpiCard,
  StatusBadge,
  Card,
  DataTable,
  TableSection,
} from "@/components/common";
import { IconPackage, IconHeadset, IconUserCheck, IconUserOff, IconArrowRight, IconUser, IconHistory } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import {
  type Service,
  type Profile,
  getStatusConfig,
  formatRelativeTime,
  groupBy,
} from "./types";
import OperatorCard from "./OperatorCard";
import HandoverPageTabs from "./HandoverPageTabs";

export default async function HandoverPage() {
  const supabase = createClient();

  const { count } = await supabase
    .from("services")
    .select("id", { count: "exact", head: true });

  const totalRows = count ?? 0;
  const allServices: Service[] = [];

  for (let offset = 0; offset < totalRows; offset += 1000) {
    const { data } = await supabase
      .from("services")
      .select("*")
      .order("updated_at", { ascending: false })
      .range(offset, offset + 999);
    if (data) allServices.push(...(data as Service[]));
  }

  const { data: profileRows } = await supabase
    .from("profiles")
    .select("id, name, role, team, status")
    .eq("status", "active")
    .order("name");

  const profiles: Profile[] = (profileRows ?? []) as Profile[];

  const operatorCounts: Record<string, number> = {};
  for (const s of allServices) {
    if (s.operator) {
      operatorCounts[s.operator] = (operatorCounts[s.operator] || 0) + 1;
    }
  }

  // KPI
  const totalCount = allServices.length;
  const uniqueOperators = new Set(
    allServices.map((s) => s.operator).filter(Boolean),
  );
  const unassignedCount = allServices.filter((s) => !s.operator).length;
  const assignedServices = allServices.filter((s) => s.operator);

  // 그룹핑
  const operatorGroups = groupBy(
    assignedServices,
    (s) => s.operator ?? "미배정",
  );
  const sortedOperators = Object.entries(operatorGroups).sort(
    ([, a], [, b]) => b.length - a.length,
  );

  // 인수인계 이력
  const { data: handoverLogs } = await supabase
    .from("handover_logs")
    .select("*")
    .order("executed_at", { ascending: false })
    .limit(20);

  // 서비스 정보 매핑 (join 대신 allServices에서 찾기)
  const serviceMap = new Map(allServices.map((s) => [s.id, s]));

  const historyColumns = [
    { key: "date", label: "일시", className: "w-[130px]" },
    { key: "university", label: "대학명" },
    { key: "service", label: "서비스명" },
    { key: "change", label: "변경 내용", className: "w-[200px]" },
    { key: "memo", label: "메모" },
  ];

  const historyData = (handoverLogs ?? []).map((log: any) => {
    const svc = serviceMap.get(log.service_id);
    return {
      date: (
        <span className="text-xs text-on-surface-variant tabular-nums">
          {new Date(log.executed_at).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
        </span>
      ),
      university: (
        <span className="text-sm text-on-surface">{svc?.university_name ?? "-"}</span>
      ),
      service: (
        <span className="text-sm text-on-surface-variant">
          {(svc?.service_name ?? "-").replace(/\d{4}학년도\s*|\d{4}-(?=\d학기)/g, "")}
        </span>
      ),
      change: (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-on-surface-variant">{log.from_person ?? "미배정"}</span>
          <IconArrowRight size={14} className="text-primary" />
          <span className="font-bold text-primary">{log.to_person}</span>
        </div>
      ),
      memo: (
        <span className="text-xs text-on-surface-variant truncate max-w-[150px] block">
          {log.memo ?? "-"}
        </span>
      ),
    };
  });

  // 최근 변경
  const recentChanges = allServices.slice(0, 10);

  const recentTableColumns = [
    { key: "service", label: "서비스명" },
    { key: "university", label: "대학명" },
    { key: "operator", label: "운영자" },
    { key: "status", label: "상태" },
    { key: "updatedAt", label: "최근 업데이트" },
  ];

  const recentTableData = recentChanges.map((s) => {
    const sc = getStatusConfig(s.status);
    return {
      service: (
        <span className="font-semibold text-on-surface">
          {(s.service_name ?? "-").replace(/\d{4}학년도\s*|\d{4}-(?=\d학기)/g, "")}
        </span>
      ),
      university: (
        <span className="text-on-surface-variant">{s.university_name ?? "-"}</span>
      ),
      operator: (
        <div className="flex items-center gap-1.5">
          <IconUser size={14} className="text-on-surface-variant" />
          <span>{s.operator ?? "미배정"}</span>
        </div>
      ),
      status: (
        <StatusBadge variant={sc.variant} dot={s.status === "active"}>
          {sc.label}
        </StatusBadge>
      ),
      updatedAt: (
        <span className="text-xs text-on-surface-variant tabular-nums">
          {formatRelativeTime(s.updated_at)}
        </span>
      ),
    };
  });

  const avgOperatorLoad =
    uniqueOperators.size > 0
      ? Math.round(assignedServices.length / uniqueOperators.size)
      : 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="인수인계"
        description="서비스 담당자 배정 현황을 한눈에 파악하고 인수인계를 관리합니다."
        breadcrumb={["운영", "인수인계"]}
      />

      <HandoverPageTabs
        services={allServices}
        profiles={profiles}
        operatorCounts={operatorCounts}
        historyContent={
          <>
            {historyData.length > 0 ? (
              <TableSection totalCount={historyData.length}>
                <DataTable columns={historyColumns} data={historyData} />
              </TableSection>
            ) : (
              <Card className="p-12">
                <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                  <IconHistory size={40} className="opacity-30" />
                  <p className="text-sm font-medium">인수인계 이력이 없습니다.</p>
                  <p className="text-xs">인수인계를 실행하면 이력이 여기에 표시됩니다.</p>
                </div>
              </Card>
            )}
          </>
        }
      >
        {/* 담당자 현황 콘텐츠 */}
        <KpiGrid>
          <KpiCard icon={<IconPackage size={18} className="text-on-surface-variant" />} label="전체 서비스" value={totalCount.toString()} suffix="건" />
          <KpiCard icon={<IconHeadset size={18} className="text-on-surface-variant" />} label="운영자 수" value={uniqueOperators.size.toString()} suffix="명" change={`평균 ${avgOperatorLoad}건 담당`} trend="neutral" />
          <KpiCard icon={<IconUserCheck size={18} className="text-on-surface-variant" />} label="배정 완료" value={assignedServices.length.toString()} suffix="건" change={`${totalCount > 0 ? Math.round((assignedServices.length / totalCount) * 100) : 0}%`} trend="up" />
          <KpiCard icon={<IconUserOff size={18} className="text-on-surface-variant" />} label="미배정" value={unassignedCount.toString()} suffix="건" change={unassignedCount > 0 ? "배정 필요" : undefined} trend={unassignedCount > 0 ? "neutral" : undefined} />
        </KpiGrid>

        <section className="space-y-4">
          <h2 className="text-sm font-bold text-primary">운영자별 담당 현황</h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {sortedOperators.map(([operator, opServices]) => (
              <OperatorCard key={operator} operator={operator} services={opServices} />
            ))}
          </div>
          {sortedOperators.length === 0 && (
            <Card className="p-8">
              <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                <IconUserOff size={30} />
                <p className="text-sm">배정된 운영자가 없습니다.</p>
              </div>
            </Card>
          )}
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-primary">최근 서비스 변경 로그</h2>
          <TableSection totalCount={recentChanges.length}>
            <DataTable
              columns={recentTableColumns}
              data={recentTableData}
              footer={
                <p className="text-xs text-on-surface-variant text-center">
                  최근 업데이트 기준 상위 10건
                </p>
              }
            />
          </TableSection>
        </section>
      </HandoverPageTabs>
    </div>
  );
}
