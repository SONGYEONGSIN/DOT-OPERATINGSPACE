const kpis = [
  {
    label: "총 매출",
    value: "18.7억",
    change: "+12.3%",
    icon: "payments",
    positive: true,
  },
  {
    label: "전월대비",
    value: "+2.1억",
    change: "성장",
    icon: "trending_up",
    positive: true,
  },
  {
    label: "목표달성률",
    value: "94.2%",
    change: "-5.8%",
    icon: "flag",
    positive: false,
  },
  {
    label: "미수금",
    value: "1.3억",
    change: "4건",
    icon: "account_balance_wallet",
    positive: false,
  },
];

const monthlyRevenue = [
  { month: "1월", amount: 12500, target: 14000 },
  { month: "2월", amount: 13200, target: 14000 },
  { month: "3월", amount: 15800, target: 15000 },
  { month: "4월", amount: 14100, target: 15000 },
  { month: "5월", amount: 16700, target: 16000 },
  { month: "6월", amount: 18200, target: 17000 },
  { month: "7월", amount: 15400, target: 17000 },
  { month: "8월", amount: 13800, target: 16000 },
  { month: "9월", amount: 17600, target: 18000 },
  { month: "10월", amount: 19200, target: 18000 },
  { month: "11월", amount: 16500, target: 18000 },
  { month: "12월", amount: 18700, target: 20000 },
];

const topClients = [
  {
    name: "서울대학교",
    revenue: "3.2억",
    share: "17.1%",
    projects: 4,
    status: "활성",
  },
  {
    name: "연세대학교",
    revenue: "2.8억",
    share: "15.0%",
    projects: 3,
    status: "활성",
  },
  {
    name: "고려대학교",
    revenue: "2.5억",
    share: "13.4%",
    projects: 3,
    status: "활성",
  },
  {
    name: "성균관대학교",
    revenue: "1.9억",
    share: "10.2%",
    projects: 2,
    status: "활성",
  },
  {
    name: "한양대학교",
    revenue: "1.7억",
    share: "9.1%",
    projects: 2,
    status: "완료",
  },
  {
    name: "중앙대학교",
    revenue: "1.4억",
    share: "7.5%",
    projects: 2,
    status: "활성",
  },
  {
    name: "경희대학교",
    revenue: "1.2억",
    share: "6.4%",
    projects: 1,
    status: "미수금",
  },
];

function getBarHeight(amount: number) {
  const maxAmount = 20000;
  return Math.round((amount / maxAmount) * 100);
}

function getClientStatusStyle(status: string) {
  switch (status) {
    case "활성":
      return "bg-primary/10 text-primary";
    case "완료":
      return "bg-secondary/20 text-secondary";
    case "미수금":
      return "bg-error/10 text-error";
    default:
      return "bg-secondary/10 text-secondary";
  }
}

export default function RevenuePage() {
  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
        <span className="material-symbols-outlined text-[18px]">folder</span>
        <span>프로젝트</span>
        <span className="material-symbols-outlined text-[14px]">
          chevron_right
        </span>
        <span className="text-primary font-medium">매출/분석</span>
      </div>

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-on-surface">
            매출/분석
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            매출 현황과 고객별 수익을 분석합니다.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button className="rounded-lg bg-primary/10 text-primary font-bold px-3 py-2">
            2026년
          </button>
          <button className="rounded-lg bg-surface-container-high text-on-surface-variant font-bold px-3 py-2 hover:text-on-surface transition-colors">
            2025년
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-outline-variant/15 bg-surface-container p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-on-surface-variant font-medium">
                {kpi.label}
              </span>
              <span className="material-symbols-outlined text-primary text-[22px]">
                {kpi.icon}
              </span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black text-on-surface">
                {kpi.value}
              </span>
              <span
                className={`text-xs font-bold mb-1 ${kpi.positive ? "text-primary" : "text-error"}`}
              >
                {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Revenue Chart */}
      <div>
        <h2 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-4">
          월별 매출 추이
        </h2>
        <div className="rounded-xl border border-outline-variant/15 bg-surface-container p-6">
          {/* Legend */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-primary" />
              <span className="text-xs text-on-surface-variant">실적</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-outline-variant/40" />
              <span className="text-xs text-on-surface-variant">목표</span>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end gap-3 h-56">
            {monthlyRevenue.map((data) => (
              <div
                key={data.month}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div className="w-full flex items-end justify-center gap-1 h-44">
                  {/* Target bar */}
                  <div
                    className="w-2.5 rounded-t bg-outline-variant/20 transition-all"
                    style={{ height: `${getBarHeight(data.target)}%` }}
                  />
                  {/* Actual bar */}
                  <div
                    className={`w-2.5 rounded-t transition-all ${
                      data.amount >= data.target
                        ? "bg-primary"
                        : "bg-primary-dim"
                    }`}
                    style={{ height: `${getBarHeight(data.amount)}%` }}
                  />
                </div>
                <span className="text-[10px] text-on-surface-variant font-medium">
                  {data.month}
                </span>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 pt-4 border-t border-outline-variant/10 grid grid-cols-3 gap-4">
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-medium">
                연간 총매출
              </span>
              <p className="text-xl font-black text-on-surface mt-0.5">
                193,200만
              </p>
            </div>
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-medium">
                연간 목표
              </span>
              <p className="text-xl font-black text-on-surface mt-0.5">
                198,000만
              </p>
            </div>
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-medium">
                달성률
              </span>
              <p className="text-xl font-black text-primary mt-0.5">97.6%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Clients Table */}
      <div>
        <h2 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-4">
          주요 고객 매출
        </h2>
        <div className="rounded-xl border border-outline-variant/15 bg-surface-container overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-container-high text-on-surface-variant text-left">
                <th className="px-5 py-3 font-semibold">#</th>
                <th className="px-5 py-3 font-semibold">고객명</th>
                <th className="px-5 py-3 font-semibold text-right">매출</th>
                <th className="px-5 py-3 font-semibold text-right">비중</th>
                <th className="px-5 py-3 font-semibold text-right">
                  프로젝트
                </th>
                <th className="px-5 py-3 font-semibold">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {topClients.map((client, idx) => (
                <tr
                  key={client.name}
                  className="hover:bg-surface-container-high/50 transition-colors"
                >
                  <td className="px-5 py-3.5 text-on-surface-variant font-mono text-xs">
                    {String(idx + 1).padStart(2, "0")}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-on-surface">
                    {client.name}
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold text-on-surface tabular-nums">
                    {client.revenue}
                  </td>
                  <td className="px-5 py-3.5 text-right text-on-surface-variant tabular-nums">
                    {client.share}
                  </td>
                  <td className="px-5 py-3.5 text-right text-on-surface-variant tabular-nums">
                    {client.projects}건
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getClientStatusStyle(client.status)}`}
                    >
                      {client.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
