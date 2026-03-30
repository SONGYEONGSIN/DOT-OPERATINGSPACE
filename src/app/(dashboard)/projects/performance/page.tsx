import PageHeader from "@/components/common/PageHeader";
import KpiGrid from "@/components/common/KpiGrid";
import KpiCard from "@/components/common/KpiCard";
import Card from "@/components/common/Card";
import StatusBadge from "@/components/common/StatusBadge";
import DataTable from "@/components/common/DataTable";

const certificates = [
  {
    certNo: "CERT-2026-03-0312",
    project: "서울시 교육플랫폼 구축",
    issueDate: "2026-03-26",
    amount: "2억 4,500만",
    status: "발급완료" as const,
  },
  {
    certNo: "CERT-2026-03-0311",
    project: "부산광역시 스마트시티 연동",
    issueDate: "2026-03-25",
    amount: "1억 8,200만",
    status: "발급완료" as const,
  },
  {
    certNo: "CERT-2026-03-0310",
    project: "경기도 공공데이터 분석",
    issueDate: "2026-03-25",
    amount: "3억 1,000만",
    status: "대기중" as const,
  },
  {
    certNo: "CERT-2026-03-0309",
    project: "한국대학교육협의회 시스템 유지보수",
    issueDate: "2026-03-24",
    amount: "8,500만",
    status: "발급완료" as const,
  },
  {
    certNo: "CERT-2026-03-0308",
    project: "인천시 교육행정 고도화",
    issueDate: "2026-03-24",
    amount: "1억 2,700만",
    status: "검토중" as const,
  },
  {
    certNo: "CERT-2026-03-0307",
    project: "대전시 학생관리 시스템",
    issueDate: "2026-03-23",
    amount: "9,800만",
    status: "발급완료" as const,
  },
  {
    certNo: "CERT-2026-03-0306",
    project: "제주특별자치도 관광교육 플랫폼",
    issueDate: "2026-03-23",
    amount: "1억 5,400만",
    status: "대기중" as const,
  },
  {
    certNo: "CERT-2026-03-0305",
    project: "강원도 디지털교육 인프라",
    issueDate: "2026-03-22",
    amount: "2억 800만",
    status: "반려" as const,
  },
  {
    certNo: "CERT-2026-03-0304",
    project: "광주시 학교안전 모니터링",
    issueDate: "2026-03-22",
    amount: "6,300만",
    status: "발급완료" as const,
  },
  {
    certNo: "CERT-2026-03-0303",
    project: "전라남도 원격교육 시스템",
    issueDate: "2026-03-21",
    amount: "1억 1,200만",
    status: "발급완료" as const,
  },
];

const statusVariant = {
  발급완료: "success",
  대기중: "warning",
  검토중: "info",
  반려: "error",
} as const;

const summaryCards = [
  {
    icon: "receipt_long",
    label: "이번 달 발급 금액",
    value: "14억 7,200만원",
    change: "+1억 8,000만 전월 대비",
  },
  {
    icon: "speed",
    label: "평균 처리 시간",
    value: "1.8일",
    change: "-0.3일 전월 대비",
  },
  {
    icon: "thumb_up",
    label: "승인율",
    value: "96.8%",
    change: "+1.2% 전월 대비",
  },
];

const columns = [
  { key: "certNo", label: "증명번호" },
  { key: "project", label: "프로젝트명" },
  { key: "issueDate", label: "발급일", className: "text-center" },
  { key: "amount", label: "금액", className: "text-right" },
  { key: "status", label: "상태", className: "text-center" },
  { key: "action", label: "작업", className: "text-center" },
];

export default function PerformancePage() {
  const tableData = certificates.map((cert) => ({
    certNo: (
      <span className="font-mono text-xs text-primary font-semibold">
        {cert.certNo}
      </span>
    ),
    project: (
      <span className="font-medium max-w-xs truncate block">
        {cert.project}
      </span>
    ),
    issueDate: (
      <span className="text-on-surface-variant text-xs">{cert.issueDate}</span>
    ),
    amount: (
      <span className="font-bold tabular-nums">{cert.amount}</span>
    ),
    status: (
      <StatusBadge variant={statusVariant[cert.status]}>
        {cert.status}
      </StatusBadge>
    ),
    action: (
      <div className="flex items-center justify-center gap-1">
        {cert.status === "발급완료" && (
          <button className="p-1 rounded-md hover:bg-primary/10 text-primary transition-colors">
            <span className="material-symbols-outlined text-base">
              download
            </span>
          </button>
        )}
        <button className="p-1 rounded-md hover:bg-surface-container-high text-on-surface-variant transition-colors">
          <span className="material-symbols-outlined text-base">
            visibility
          </span>
        </button>
      </div>
    ),
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="실적증명"
        description="프로젝트 실적증명서 발급 현황을 관리합니다."
        breadcrumb={["프로젝트", "실적증명"]}
      />

      <KpiGrid>
        <KpiCard
          icon="workspace_premium"
          label="발급건수"
          value="3,847"
          change="+124 올해 누적"
          trend="up"
        />
        <KpiCard
          icon="calendar_month"
          label="이번달"
          value="312"
          change="+28 이번 주"
          trend="up"
        />
        <KpiCard
          icon="trending_up"
          label="전월대비"
          value="+14.2"
          suffix="%"
          change="상승"
          trend="up"
        />
        <KpiCard
          icon="pending_actions"
          label="대기중"
          value="23"
          change="처리 필요"
          trend="neutral"
        />
      </KpiGrid>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryCards.map((item) => (
          <Card key={item.label} className="p-5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">
                {item.icon}
              </span>
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {item.label}
              </span>
            </div>
            <p className="text-2xl font-black text-on-surface">{item.value}</p>
            <p className="text-xs text-primary font-semibold">{item.change}</p>
          </Card>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-primary tracking-[0.2em] uppercase">
            증명서 목록
          </h2>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface-variant text-xs font-bold hover:bg-surface-container-highest transition-colors">
              <span className="material-symbols-outlined text-sm">
                filter_list
              </span>
              필터
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors">
              <span className="material-symbols-outlined text-sm">add</span>
              발급 신청
            </button>
          </div>
        </div>

        <Card className="overflow-hidden">
          <DataTable columns={columns} data={tableData} />
        </Card>
      </div>
    </div>
  );
}
