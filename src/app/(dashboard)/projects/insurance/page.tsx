import PageHeader from "@/components/common/PageHeader";
import KpiGrid from "@/components/common/KpiGrid";
import KpiCard from "@/components/common/KpiCard";
import Card from "@/components/common/Card";
import StatusBadge from "@/components/common/StatusBadge";
import DataTable from "@/components/common/DataTable";

const policies = [
  {
    policyNo: "SGI-2026-001482",
    insurer: "서울보증보험",
    amount: "5억 2,000만",
    startDate: "2025-06-01",
    endDate: "2026-05-31",
    status: "유효" as const,
    daysLeft: 66,
  },
  {
    policyNo: "SGI-2026-001355",
    insurer: "서울보증보험",
    amount: "3억 8,000만",
    startDate: "2025-09-15",
    endDate: "2026-09-14",
    status: "유효" as const,
    daysLeft: 172,
  },
  {
    policyNo: "HNI-2025-008714",
    insurer: "한화손해보험",
    amount: "2억 5,000만",
    startDate: "2025-04-01",
    endDate: "2026-03-31",
    status: "만료임박" as const,
    daysLeft: 5,
  },
  {
    policyNo: "SGI-2025-012390",
    insurer: "서울보증보험",
    amount: "7억 1,000만",
    startDate: "2025-07-20",
    endDate: "2026-07-19",
    status: "유효" as const,
    daysLeft: 115,
  },
  {
    policyNo: "MER-2025-004521",
    insurer: "메리츠화재",
    amount: "1억 8,000만",
    startDate: "2025-01-10",
    endDate: "2026-01-09",
    status: "만료" as const,
    daysLeft: 0,
  },
  {
    policyNo: "HNI-2026-002178",
    insurer: "한화손해보험",
    amount: "4억 3,000만",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    status: "유효" as const,
    daysLeft: 280,
  },
  {
    policyNo: "DB-2025-009845",
    insurer: "DB손해보험",
    amount: "2억 9,000만",
    startDate: "2025-11-01",
    endDate: "2026-04-30",
    status: "만료임박" as const,
    daysLeft: 35,
  },
  {
    policyNo: "SGI-2024-018722",
    insurer: "서울보증보험",
    amount: "6억 5,000만",
    startDate: "2024-12-01",
    endDate: "2025-11-30",
    status: "만료" as const,
    daysLeft: 0,
  },
];

const statusVariant = {
  유효: "success",
  만료임박: "warning",
  만료: "error",
  갱신중: "info",
} as const;

function DaysLeftCell({ daysLeft }: { daysLeft: number }) {
  const colorClass =
    daysLeft === 0
      ? "text-error"
      : daysLeft <= 30
        ? "text-tertiary"
        : "text-on-surface";

  return (
    <span className={`text-xs font-bold ${colorClass}`}>
      {daysLeft === 0 ? "만료" : `${daysLeft}일`}
    </span>
  );
}

const columns = [
  { key: "policyNo", label: "증권번호" },
  { key: "insurer", label: "보험사" },
  { key: "amount", label: "보증금액", className: "text-right" },
  { key: "startDate", label: "시작일", className: "text-center" },
  { key: "endDate", label: "종료일", className: "text-center" },
  { key: "daysLeft", label: "잔여일", className: "text-center" },
  { key: "status", label: "상태", className: "text-center" },
];

export default function InsurancePage() {
  const tableData = policies.map((policy) => ({
    policyNo: (
      <span className="font-mono text-xs text-primary font-semibold">
        {policy.policyNo}
      </span>
    ),
    insurer: (
      <span className="font-medium">{policy.insurer}</span>
    ),
    amount: (
      <span className="font-bold tabular-nums">{policy.amount}</span>
    ),
    startDate: (
      <span className="text-on-surface-variant text-xs">{policy.startDate}</span>
    ),
    endDate: (
      <span className="text-on-surface-variant text-xs">{policy.endDate}</span>
    ),
    daysLeft: <DaysLeftCell daysLeft={policy.daysLeft} />,
    status: (
      <StatusBadge variant={statusVariant[policy.status]}>
        {policy.status}
      </StatusBadge>
    ),
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="보증보험"
        description="보증보험 증권을 관리하고 갱신 일정을 추적합니다."
        breadcrumb={["프로젝트", "보증보험"]}
      />

      <KpiGrid>
        <KpiCard
          icon="shield"
          label="유효보험"
          value="156"
          change="+4 이번 달"
          trend="up"
        />
        <KpiCard
          icon="event_upcoming"
          label="만료예정"
          value="12"
          change="30일 이내"
          trend="down"
          alert
        />
        <KpiCard
          icon="payments"
          label="총보증금액"
          value="48.2"
          suffix="억"
          change="+2.1억 전월 대비"
          trend="up"
        />
        <KpiCard
          icon="autorenew"
          label="갱신필요"
          value="7"
          change="긴급"
          trend="down"
          alert
        />
      </KpiGrid>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-primary tracking-[0.2em] uppercase">
            보험 증권 목록
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
              증권 등록
            </button>
          </div>
        </div>

        <Card className="overflow-hidden">
          <DataTable columns={columns} data={tableData} />
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">
              info
            </span>
            <span className="text-xs text-on-surface-variant">총 보증금액</span>
            <span className="text-sm font-bold text-on-surface">
              34억 1,000만원
            </span>
          </div>
          <div className="h-4 w-px bg-outline-variant/30" />
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-lg">
              warning
            </span>
            <span className="text-xs text-on-surface-variant">
              30일 이내 만료
            </span>
            <span className="text-sm font-bold text-tertiary">2건</span>
          </div>
          <div className="h-4 w-px bg-outline-variant/30" />
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-error text-lg">
              error
            </span>
            <span className="text-xs text-on-surface-variant">이미 만료</span>
            <span className="text-sm font-bold text-error">2건</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
