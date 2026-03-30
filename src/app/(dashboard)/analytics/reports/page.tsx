import PageHeader from "@/components/common/PageHeader";
import KpiGrid from "@/components/common/KpiGrid";
import KpiCard from "@/components/common/KpiCard";
import StatusBadge from "@/components/common/StatusBadge";
import Card from "@/components/common/Card";
import DataTable from "@/components/common/DataTable";
import FilterBar from "@/components/common/FilterBar";

const reports = [
  {
    id: "RPT-2026-0312",
    title: "3월 2주차 운영 현황 보고서",
    type: "주간" as const,
    date: "2026-03-20",
    status: "완료" as const,
  },
  {
    id: "RPT-2026-0311",
    title: "2026년 3월 일간 운영 리포트",
    type: "일간" as const,
    date: "2026-03-19",
    status: "완료" as const,
  },
  {
    id: "RPT-2026-0310",
    title: "2월 월간 성과 분석 보고서",
    type: "월간" as const,
    date: "2026-03-15",
    status: "검토중" as const,
  },
  {
    id: "RPT-2026-0309",
    title: "3월 1주차 운영 현황 보고서",
    type: "주간" as const,
    date: "2026-03-13",
    status: "완료" as const,
  },
  {
    id: "RPT-2026-0308",
    title: "2026년 3월 일간 운영 리포트",
    type: "일간" as const,
    date: "2026-03-12",
    status: "반려" as const,
  },
  {
    id: "RPT-2026-0307",
    title: "1분기 KPI 중간 점검 보고서",
    type: "월간" as const,
    date: "2026-03-10",
    status: "완료" as const,
  },
  {
    id: "RPT-2026-0306",
    title: "2월 4주차 운영 현황 보고서",
    type: "주간" as const,
    date: "2026-03-06",
    status: "완료" as const,
  },
];

const typeBadgeVariant = {
  일간: "neutral",
  주간: "success",
  월간: "warning",
} as const;

const statusBadgeVariant = {
  완료: "success",
  검토중: "warning",
  반려: "error",
} as const;

const columns = [
  { key: "report", label: "보고서명" },
  { key: "type", label: "유형", className: "w-20" },
  { key: "date", label: "생성일", className: "w-28" },
  { key: "status", label: "상태", className: "w-24" },
  { key: "download", label: "", className: "w-14" },
];

export default function ReportsPage() {
  const completedCount = reports.filter((r) => r.status === "완료").length;

  const tableData = reports.map((report) => ({
    report: (
      <div>
        <p className="text-sm font-semibold text-on-surface">{report.title}</p>
        <p className="text-xs text-on-surface-variant mt-0.5">{report.id}</p>
      </div>
    ),
    type: (
      <StatusBadge variant={typeBadgeVariant[report.type]}>
        {report.type}
      </StatusBadge>
    ),
    date: (
      <span className="text-xs text-on-surface-variant">{report.date}</span>
    ),
    status: (
      <StatusBadge variant={statusBadgeVariant[report.status]}>
        {report.status}
      </StatusBadge>
    ),
    download: (
      <button
        className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
        title="다운로드"
      >
        <span className="material-symbols-outlined text-[18px]">download</span>
      </button>
    ),
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="보고서"
        description="운영 보고서를 조회하고 다운로드하세요."
        breadcrumb={["분석 & 보고", "보고서"]}
        actions={
          <>
            <div className="flex items-center gap-1 bg-surface-container-high rounded-xl p-1">
              <button className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-primary text-on-primary">
                24시간
              </button>
              <button className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-on-surface-variant hover:text-on-surface transition-colors">
                7일
              </button>
              <button className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-on-surface-variant hover:text-on-surface transition-colors">
                커스텀
              </button>
            </div>
            <button className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-dim transition-colors">
              <span className="material-symbols-outlined text-[20px]">
                insert_chart
              </span>
              보고서 생성
            </button>
          </>
        }
      />

      <KpiGrid>
        <KpiCard
          icon="error"
          label="총 인시던트"
          value="1,284"
          change="+12%"
          trend="up"
        />
        <KpiCard
          icon="timer"
          label="평균 응답시간"
          value="42"
          suffix="ms"
          change="-5ms"
          trend="down"
        />
        <KpiCard
          icon="bolt"
          label="리소스 효율"
          value="94.2"
          suffix="%"
          change="OPTIMAL"
          trend="neutral"
        />
        <KpiCard
          icon="verified_user"
          label="보안 점수"
          value="98"
          suffix="/100"
          change="SECURE"
          trend="neutral"
        />
      </KpiGrid>

      <FilterBar
        searchPlaceholder="보고서 검색..."
        tabs={[
          { label: "전체", value: "all" },
          { label: "일간", value: "daily" },
          { label: "주간", value: "weekly" },
          { label: "월간", value: "monthly" },
        ]}
      />

      <Card>
        <div className="px-5 py-3.5 border-b border-outline-variant/10 flex items-center justify-between">
          <h2 className="text-sm font-bold text-on-surface">
            최근 생성된 보고서
          </h2>
          <span className="text-xs text-on-surface-variant">
            총 {reports.length}건 / 완료 {completedCount}건
          </span>
        </div>
        <DataTable columns={columns} data={tableData} />
      </Card>
    </div>
  );
}
