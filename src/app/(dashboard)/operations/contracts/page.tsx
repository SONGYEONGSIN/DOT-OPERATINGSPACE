import {
  PageHeader,
  KpiGrid,
  KpiCard,
  StatusBadge,
  Card,
  DataTable,
  ProgressBar,
} from "@/components/common";

const contracts = [
  {
    id: "CT-2026-001",
    company: "한국교육정보원",
    period: "2026.01.01 ~ 2026.12.31",
    budgetUsed: 72,
    amount: "1,250,000,000",
    status: "진행중" as const,
  },
  {
    id: "CT-2026-002",
    company: "서울대학교",
    period: "2025.09.01 ~ 2026.08.31",
    budgetUsed: 58,
    amount: "480,000,000",
    status: "진행중" as const,
  },
  {
    id: "CT-2025-018",
    company: "연세대학교",
    period: "2025.03.01 ~ 2026.02.28",
    budgetUsed: 94,
    amount: "320,000,000",
    status: "만료예정" as const,
  },
  {
    id: "CT-2025-012",
    company: "고려대학교",
    period: "2025.01.01 ~ 2025.12.31",
    budgetUsed: 100,
    amount: "560,000,000",
    status: "완료" as const,
  },
  {
    id: "CT-2026-003",
    company: "성균관대학교",
    period: "2026.02.01 ~ 2027.01.31",
    budgetUsed: 15,
    amount: "290,000,000",
    status: "진행중" as const,
  },
  {
    id: "CT-2025-015",
    company: "한양대학교",
    period: "2025.06.01 ~ 2026.05.31",
    budgetUsed: 88,
    amount: "410,000,000",
    status: "만료예정" as const,
  },
  {
    id: "CT-2026-004",
    company: "중앙대학교",
    period: "2026.03.01 ~ 2027.02.28",
    budgetUsed: 8,
    amount: "185,000,000",
    status: "진행중" as const,
  },
  {
    id: "CT-2025-009",
    company: "경희대학교",
    period: "2025.01.01 ~ 2025.12.31",
    budgetUsed: 100,
    amount: "340,000,000",
    status: "완료" as const,
  },
];

const statusVariantMap = {
  진행중: "success",
  만료예정: "warning",
  완료: "neutral",
} as const;

const borderColorMap = {
  진행중: "border-l-primary",
  만료예정: "border-l-tertiary",
  완료: "border-l-outline-variant/30",
} as const;

function getBudgetColor(used: number): "primary" | "warning" | "error" {
  if (used >= 90) return "error";
  if (used >= 70) return "warning";
  return "primary";
}

export default function ContractsPage() {
  const totalContracts = contracts.length;
  const activeContracts = contracts.filter((c) => c.status === "진행중").length;
  const expiringContracts = contracts.filter(
    (c) => c.status === "만료예정",
  ).length;

  const columns = [
    { key: "id", label: "계약 ID" },
    { key: "company", label: "업체명" },
    { key: "period", label: "계약기간" },
    { key: "budget", label: "예산 소진" },
    { key: "amount", label: "금액", className: "text-right" },
    { key: "status", label: "상태", className: "text-center" },
  ];

  const tableData = contracts.map((contract) => ({
    id: (
      <span className="font-mono font-bold text-primary">{contract.id}</span>
    ),
    company: (
      <span className="font-semibold text-on-surface">{contract.company}</span>
    ),
    period: (
      <span className="text-on-surface-variant">{contract.period}</span>
    ),
    budget: (
      <div className="w-40">
        <div className="flex justify-between text-[9px] font-bold uppercase mb-1">
          <span>{contract.budgetUsed}% 사용</span>
        </div>
        <ProgressBar
          value={contract.budgetUsed}
          color={getBudgetColor(contract.budgetUsed)}
        />
      </div>
    ),
    amount: (
      <div className="text-right">
        <span className="font-semibold tabular-nums">{contract.amount}</span>
        <span className="text-xs text-on-surface-variant ml-1">원</span>
      </div>
    ),
    status: (
      <div className="text-center">
        <StatusBadge variant={statusVariantMap[contract.status]}>
          {contract.status}
        </StatusBadge>
      </div>
    ),
    _borderClass: borderColorMap[contract.status],
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="계약서 관리"
        description="전체 계약 현황을 관리하고 만료 예정 계약을 추적합니다."
        breadcrumb={["운영", "계약서"]}
        actions={
          <>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-high text-on-surface-variant text-sm font-semibold hover:bg-surface-bright transition-colors">
              <span className="material-symbols-outlined text-lg">
                download
              </span>
              내보내기
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-black hover:brightness-110 transition-all active:scale-95">
              <span className="material-symbols-outlined text-lg">add</span>
              새 계약 등록
            </button>
          </>
        }
      />

      <KpiGrid>
        <KpiCard
          icon="description"
          label="총 계약수"
          value={totalContracts.toString()}
          suffix="건"
          change="+2건 전월 대비"
          trend="up"
        />
        <KpiCard
          icon="play_circle"
          label="진행중"
          value={activeContracts.toString()}
          suffix="건"
          trend="neutral"
          change="유지"
        />
        <KpiCard
          icon="schedule"
          label="만료예정"
          value={expiringContracts.toString()}
          suffix="건"
          alert
        />
        <KpiCard
          icon="payments"
          label="총 계약금액"
          value="38.3"
          suffix="억원"
          change="+12% YoY"
          trend="up"
        />
      </KpiGrid>

      <Card>
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
          <h2 className="text-sm font-bold text-primary tracking-[0.2em] uppercase">
            계약 목록
          </h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-base">
                search
              </span>
              <input
                type="text"
                placeholder="계약 검색..."
                className="bg-surface-container-high border-none rounded-lg pl-9 pr-4 py-2 text-xs text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none w-56"
              />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-high text-on-surface-variant text-xs font-semibold hover:bg-surface-bright transition-colors">
              <span className="material-symbols-outlined text-sm">
                filter_list
              </span>
              필터
            </button>
          </div>
        </div>

        {/* Custom table with border-l status coding */}
        <div className="w-full overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/10">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`text-left text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-4 py-3 ${col.className ?? ""}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr
                  key={index}
                  className={`border-b border-outline-variant/10 border-l-2 hover:bg-surface-container-high transition-colors ${
                    contracts[index].status === "진행중"
                      ? "border-l-primary"
                      : contracts[index].status === "만료예정"
                        ? "border-l-tertiary"
                        : "border-l-outline-variant/30"
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-sm text-on-surface ${col.className ?? ""}`}
                    >
                      {row[col.key as keyof typeof row] as React.ReactNode}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-3 border-t border-outline-variant/10">
          <p className="text-xs text-on-surface-variant">
            총 <span className="font-bold text-on-surface">{totalContracts}</span>건
          </p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 rounded-lg text-xs text-on-surface-variant hover:bg-surface-container-high transition-colors">
              이전
            </button>
            <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary">
              1
            </button>
            <button className="px-3 py-1.5 rounded-lg text-xs text-on-surface-variant hover:bg-surface-container-high transition-colors">
              다음
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
