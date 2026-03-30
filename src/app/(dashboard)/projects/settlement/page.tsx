const kpis = [
  {
    label: "정산대기",
    value: "12건",
    change: "3.2억",
    icon: "hourglass_top",
    positive: false,
  },
  {
    label: "정산완료",
    value: "148건",
    change: "42.5억",
    icon: "check_circle",
    positive: true,
  },
  {
    label: "진학캐쉬 잔액",
    value: "8,450만",
    change: "+1,200만",
    icon: "account_balance",
    positive: true,
  },
  {
    label: "이번달 사용",
    value: "2,130만",
    change: "-340만",
    icon: "credit_card",
    positive: false,
  },
];

const settlements = [
  {
    id: "STL-2026-148",
    client: "서울대학교",
    project: "차세대 학사시스템",
    amount: "8,500만",
    requestDate: "2026-03-20",
    status: "완료",
    completedDate: "2026-03-24",
  },
  {
    id: "STL-2026-149",
    client: "연세대학교",
    project: "입학포털 개편",
    amount: "3,200만",
    requestDate: "2026-03-22",
    status: "처리중",
    completedDate: "-",
  },
  {
    id: "STL-2026-150",
    client: "고려대학교",
    project: "모바일 앱 1차",
    amount: "5,100만",
    requestDate: "2026-03-23",
    status: "대기",
    completedDate: "-",
  },
  {
    id: "STL-2026-151",
    client: "성균관대학교",
    project: "데이터 분석 플랫폼",
    amount: "4,800만",
    requestDate: "2026-03-24",
    status: "대기",
    completedDate: "-",
  },
  {
    id: "STL-2026-152",
    client: "한양대학교",
    project: "통합인증 시스템",
    amount: "2,400만",
    requestDate: "2026-03-25",
    status: "대기",
    completedDate: "-",
  },
  {
    id: "STL-2026-153",
    client: "중앙대학교",
    project: "경쟁률 분석 모듈",
    amount: "1,800만",
    requestDate: "2026-03-25",
    status: "검토중",
    completedDate: "-",
  },
];

const cashHistory = [
  {
    id: "CSH-0326-001",
    type: "충전",
    description: "월간 정기 충전",
    amount: "+5,000만",
    balance: "8,450만",
    date: "2026-03-01",
  },
  {
    id: "CSH-0326-002",
    type: "사용",
    description: "서울대 입학홍보 광고비",
    amount: "-1,200만",
    balance: "7,250만",
    date: "2026-03-05",
  },
  {
    id: "CSH-0326-003",
    type: "사용",
    description: "연세대 원서접수 시스템 비용",
    amount: "-450만",
    balance: "6,800만",
    date: "2026-03-10",
  },
  {
    id: "CSH-0326-004",
    type: "충전",
    description: "긴급 추가 충전",
    amount: "+2,000만",
    balance: "8,800만",
    date: "2026-03-15",
  },
  {
    id: "CSH-0326-005",
    type: "사용",
    description: "고려대 모바일 앱 서버 비용",
    amount: "-350만",
    balance: "8,450만",
    date: "2026-03-20",
  },
  {
    id: "CSH-0326-006",
    type: "사용",
    description: "성균관대 데이터 분석 라이센스",
    amount: "-130만",
    balance: "8,320만",
    date: "2026-03-23",
  },
];

function getSettlementStatusStyle(status: string) {
  switch (status) {
    case "완료":
      return "bg-primary/10 text-primary";
    case "처리중":
      return "bg-tertiary/10 text-tertiary";
    case "대기":
      return "bg-error/10 text-error";
    case "검토중":
      return "bg-secondary/20 text-on-surface-variant";
    default:
      return "bg-secondary/10 text-secondary";
  }
}

export default function SettlementPage() {
  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
        <span className="material-symbols-outlined text-[18px]">folder</span>
        <span>프로젝트</span>
        <span className="material-symbols-outlined text-[14px]">
          chevron_right
        </span>
        <span className="text-primary font-medium">정산/진학캐쉬</span>
      </div>

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-on-surface">
            정산/진학캐쉬
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            정산 내역과 진학캐쉬 충전/사용 현황을 관리합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-xl bg-surface-container-high px-4 py-2.5 text-on-surface-variant font-bold text-sm hover:text-on-surface transition-colors border border-outline-variant/15">
            <span className="material-symbols-outlined text-[18px]">
              download
            </span>
            내보내기
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-on-primary font-bold text-sm hover:bg-primary-dim transition-colors">
            <span className="material-symbols-outlined text-[18px]">
              add_card
            </span>
            캐쉬 충전
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

      {/* Two Section Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Settlement History */}
        <div>
          <h2 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-4">
            정산 내역
          </h2>
          <div className="rounded-xl border border-outline-variant/15 bg-surface-container overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-container-high text-on-surface-variant text-left">
                  <th className="px-4 py-3 font-semibold">정산번호</th>
                  <th className="px-4 py-3 font-semibold">고객</th>
                  <th className="px-4 py-3 font-semibold text-right">금액</th>
                  <th className="px-4 py-3 font-semibold">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {settlements.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-surface-container-high/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">
                      {item.id}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium text-on-surface text-xs">
                          {item.client}
                        </span>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">
                          {item.project}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-on-surface tabular-nums text-xs">
                      {item.amount}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getSettlementStatusStyle(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cash History */}
        <div>
          <h2 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-4">
            진학캐쉬 충전/사용 내역
          </h2>
          <div className="rounded-xl border border-outline-variant/15 bg-surface-container overflow-hidden">
            {/* Cash Balance Header */}
            <div className="px-5 py-4 bg-surface-container-high border-b border-outline-variant/10">
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface-variant font-medium">
                  현재 잔액
                </span>
                <span className="text-2xl font-black text-primary">
                  8,450만원
                </span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: "68%" }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-on-surface-variant">
                  사용 32%
                </span>
                <span className="text-[10px] text-on-surface-variant">
                  한도 12,500만원
                </span>
              </div>
            </div>

            {/* Transaction List */}
            <div className="divide-y divide-outline-variant/10">
              {cashHistory.map((item) => (
                <div
                  key={item.id}
                  className="px-5 py-3.5 flex items-center justify-between hover:bg-surface-container-high/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        item.type === "충전"
                          ? "bg-primary/10"
                          : "bg-error/10"
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[16px] ${
                          item.type === "충전"
                            ? "text-primary"
                            : "text-error"
                        }`}
                      >
                        {item.type === "충전"
                          ? "add_circle"
                          : "remove_circle"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-on-surface">
                        {item.description}
                      </span>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">
                        {item.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        item.type === "충전"
                          ? "text-primary"
                          : "text-error"
                      }`}
                    >
                      {item.amount}
                    </span>
                    <p className="text-[10px] text-on-surface-variant mt-0.5 tabular-nums">
                      잔액 {item.balance}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
