import {
  PageHeader,
  KpiGrid,
  KpiCard,
  StatusBadge,
  Card,
  DataTable,
} from "@/components/common";

interface Receivable {
  university: string;
  amount: string;
  amountRaw: number;
  issueDate: string;
  daysOverdue: number;
  status: "정상" | "주의" | "경고" | "연체";
  manager: string;
  invoiceNo: string;
}

const receivables: Receivable[] = [
  { university: "한국외국어대학교", amount: "45,000,000", amountRaw: 45000000, issueDate: "2026.02.15", daysOverdue: 39, status: "주의", manager: "김민수", invoiceNo: "INV-2026-0042" },
  { university: "동국대학교", amount: "128,000,000", amountRaw: 128000000, issueDate: "2025.12.01", daysOverdue: 115, status: "연체", manager: "박준혁", invoiceNo: "INV-2025-0318" },
  { university: "숙명여자대학교", amount: "32,000,000", amountRaw: 32000000, issueDate: "2026.03.01", daysOverdue: 25, status: "정상", manager: "이서연", invoiceNo: "INV-2026-0067" },
  { university: "세종대학교", amount: "67,500,000", amountRaw: 67500000, issueDate: "2026.01.10", daysOverdue: 75, status: "경고", manager: "최영진", invoiceNo: "INV-2026-0015" },
  { university: "건국대학교", amount: "89,000,000", amountRaw: 89000000, issueDate: "2025.11.20", daysOverdue: 126, status: "연체", manager: "한소희", invoiceNo: "INV-2025-0295" },
  { university: "인하대학교", amount: "21,000,000", amountRaw: 21000000, issueDate: "2026.03.10", daysOverdue: 16, status: "정상", manager: "오태현", invoiceNo: "INV-2026-0081" },
  { university: "아주대학교", amount: "54,200,000", amountRaw: 54200000, issueDate: "2026.01.25", daysOverdue: 60, status: "경고", manager: "신예진", invoiceNo: "INV-2026-0028" },
  { university: "광운대학교", amount: "15,800,000", amountRaw: 15800000, issueDate: "2026.03.15", daysOverdue: 11, status: "정상", manager: "윤재호", invoiceNo: "INV-2026-0089" },
];

const statusVariantMap = {
  정상: "success",
  주의: "warning",
  경고: "error",
  연체: "error",
} as const;

function getDaysColor(days: number): string {
  if (days > 90) return "text-error";
  if (days > 60) return "text-error-dim";
  if (days > 30) return "text-tertiary";
  return "text-on-surface";
}

export default function ReceivablesPage() {
  const totalAmount = receivables.reduce((sum, r) => sum + r.amountRaw, 0);
  const within30 = receivables.filter((r) => r.daysOverdue <= 30);
  const within60 = receivables.filter(
    (r) => r.daysOverdue > 30 && r.daysOverdue <= 60,
  );
  const over90 = receivables.filter((r) => r.daysOverdue > 90);

  const within30Amount = within30.reduce((sum, r) => sum + r.amountRaw, 0);
  const within60Amount = within60.reduce((sum, r) => sum + r.amountRaw, 0);
  const over90Amount = over90.reduce((sum, r) => sum + r.amountRaw, 0);

  const columns = [
    { key: "university", label: "대학명" },
    { key: "amount", label: "미수금액", className: "text-right" },
    { key: "issueDate", label: "발생일" },
    { key: "daysOverdue", label: "경과일", className: "text-center" },
    { key: "status", label: "상태", className: "text-center" },
    { key: "manager", label: "담당자" },
  ];

  const tableData = receivables.map((item) => ({
    university: (
      <div>
        <p className="text-sm font-semibold text-on-surface">
          {item.university}
        </p>
        <p className="text-[10px] text-on-surface-variant font-mono">
          {item.invoiceNo}
        </p>
      </div>
    ),
    amount: (
      <div className="text-right">
        <span className="font-bold tabular-nums">{item.amount}</span>
        <span className="text-xs text-on-surface-variant ml-1">원</span>
      </div>
    ),
    issueDate: (
      <span className="text-on-surface-variant">{item.issueDate}</span>
    ),
    daysOverdue: (
      <span
        className={`font-bold tabular-nums ${getDaysColor(item.daysOverdue)}`}
      >
        {item.daysOverdue}일
      </span>
    ),
    status: (
      <div className="text-center">
        <StatusBadge variant={statusVariantMap[item.status]}>
          {item.status}
        </StatusBadge>
      </div>
    ),
    manager: (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center">
          <span className="text-[9px] font-bold text-on-surface-variant">
            {item.manager.charAt(0)}
          </span>
        </div>
        <span className="text-on-surface">{item.manager}</span>
      </div>
    ),
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="미수채권"
        description="미수금 현황을 관리하고 회수 진행 상태를 추적합니다."
        breadcrumb={["운영", "미수채권"]}
        actions={
          <>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-high text-on-surface-variant text-sm font-semibold hover:bg-surface-bright transition-colors">
              <span className="material-symbols-outlined text-lg">
                download
              </span>
              보고서 다운로드
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-black hover:brightness-110 transition-all active:scale-95">
              <span className="material-symbols-outlined text-lg">send</span>
              일괄 청구
            </button>
          </>
        }
      />

      <KpiGrid>
        <KpiCard
          icon="account_balance_wallet"
          label="총 미수금"
          value={(totalAmount / 100000000).toFixed(1)}
          suffix="억원"
        />
        <KpiCard
          icon="schedule"
          label="30일 이내"
          value={within30.length.toString()}
          suffix="건"
          change={`${(within30Amount / 10000).toFixed(0)}만원`}
          trend="neutral"
        />
        <KpiCard
          icon="warning"
          label="60일 이내"
          value={within60.length.toString()}
          suffix="건"
          alert={within60.length > 0}
        />
        <KpiCard
          icon="error"
          label="90일 초과"
          value={over90.length.toString()}
          suffix="건"
          alert={over90.length > 0}
        />
      </KpiGrid>

      {/* Aging Distribution Stacked Bar */}
      <Card className="p-5">
        <h2 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-4">
          연체 분포
        </h2>
        <div className="flex h-3 rounded-full overflow-hidden bg-surface-container-high">
          {within30Amount > 0 && (
            <div
              className="bg-primary transition-all"
              style={{
                width: `${(within30Amount / totalAmount) * 100}%`,
              }}
              title={`30일 이내: ${within30.length}건`}
            />
          )}
          {within60Amount > 0 && (
            <div
              className="bg-tertiary transition-all"
              style={{
                width: `${(within60Amount / totalAmount) * 100}%`,
              }}
              title={`31~60일: ${within60.length}건`}
            />
          )}
          {over90Amount > 0 && (
            <div
              className="bg-error transition-all"
              style={{
                width: `${(over90Amount / totalAmount) * 100}%`,
              }}
              title={`90일 초과: ${over90.length}건`}
            />
          )}
        </div>
        <div className="flex items-center gap-6 mt-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-[10px] text-on-surface-variant font-medium">
              30일 이내 ({within30.length}건)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary" />
            <span className="text-[10px] text-on-surface-variant font-medium">
              31~60일 ({within60.length}건)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-error" />
            <span className="text-[10px] text-on-surface-variant font-medium">
              90일 초과 ({over90.length}건)
            </span>
          </div>
        </div>
      </Card>

      {/* Receivables Table */}
      <Card>
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
          <h2 className="text-sm font-bold text-primary tracking-[0.2em] uppercase">
            미수금 상세
          </h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-base">
                search
              </span>
              <input
                type="text"
                placeholder="대학명 검색..."
                className="bg-surface-container-high border-none rounded-lg pl-9 pr-4 py-2 text-xs text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none w-56"
              />
            </div>
            <select className="bg-surface-container-high border-none rounded-lg px-3 py-2 text-xs text-on-surface-variant focus:ring-1 focus:ring-primary/50 focus:outline-none appearance-none cursor-pointer">
              <option>전체 상태</option>
              <option>정상</option>
              <option>주의</option>
              <option>경고</option>
              <option>연체</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={tableData}
          footer={
            <div className="flex items-center justify-between">
              <p className="text-xs text-on-surface-variant">
                총{" "}
                <span className="font-bold text-on-surface">
                  {receivables.length}
                </span>
                건 &middot; 미수금 합계{" "}
                <span className="font-bold text-on-surface">
                  {(totalAmount / 100000000).toFixed(1)}억
                </span>
                원
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
          }
        />
      </Card>
    </div>
  );
}
