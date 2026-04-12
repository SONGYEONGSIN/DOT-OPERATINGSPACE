import { Suspense } from "react";
import {
  PageHeader,
  KpiGrid,
  KpiCard,
  Card,
  DataTable,
  TableSection,
  FilterBar,
} from "@/components/common";
import { IconWallet, IconCash, IconAlertTriangle, IconClock } from "@tabler/icons-react";
import { fetchReceivables } from "@/lib/sharepoint";
import ReceivableActionMenu from "./ReceivableActionMenu";

function stripNumbers(text: string): string {
  return text.replace(/^\d+\s*/, "").replace(/\s+/g, " ").trim();
}

interface PageProps {
  searchParams: Promise<{ search?: string; tab?: string }>;
}

export default async function ReceivablesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const searchFilter = params.search ?? "";
  const tabFilter = params.tab ?? "all";
  const result = await fetchReceivables();
  const items = result?.items ?? [];
  const totalAmount = result?.totalAmount ?? 0;
  const sheetName = result?.sheetName ?? "-";

  // 입금 여부 판단: 적요에 "입금완료"가 포함된 경우만 입금 처리
  const paidItems = items.filter((r) => r.memo && String(r.memo).includes("입금완료"));
  const unpaidItems = items.filter((r) => !r.memo || !String(r.memo).includes("입금완료"));
  const paidAmount = paidItems.reduce((sum, r) => sum + r.amount, 0);
  const unpaidAmount = unpaidItems.reduce((sum, r) => sum + r.amount, 0);

  // 30일 경과 미수
  const over30Unpaid = unpaidItems.filter((r) => r.daysElapsed > 30);

  // 회수율
  const collectionRate = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

  // 필터 적용
  let filteredItems = items;

  if (tabFilter === "unpaid") {
    filteredItems = unpaidItems;
  } else if (tabFilter === "paid") {
    filteredItems = paidItems;
  } else if (tabFilter === "over30") {
    filteredItems = over30Unpaid;
  }

  if (searchFilter) {
    const q = searchFilter.toLowerCase();
    filteredItems = filteredItems.filter(
      (r) =>
        (r.university ?? "").toLowerCase().includes(q) ||
        (r.operator ?? "").toLowerCase().includes(q) ||
        (r.detail ?? "").toLowerCase().includes(q),
    );
  }

  const columns = [
    { key: "invoiceDate", label: "청구일자", className: "w-[8%]" },
    { key: "university", label: "거래처명", className: "w-[13%]" },
    { key: "detail", label: "거래내역", className: "w-[16%]" },
    { key: "operator", label: "운영자", className: "w-[6%]" },
    { key: "amount", label: "청구금액", className: "w-[10%] text-right" },
    { key: "schoolContact", label: "학교담당자", className: "w-[12%]" },
    { key: "mailSentDate", label: "메일발송일자", className: "w-[9%]" },
    { key: "expectedPayDate", label: "입금예정일", className: "w-[8%]" },
    { key: "daysElapsed", label: "경과", className: "w-[6%] text-center" },
    { key: "payStatus", label: "입금여부", className: "w-[10%]" },
    { key: "actions", label: "", className: "!px-1 w-10" },
  ];

  const tableData = filteredItems.map((item) => {
    const hasMemo = item.memo && String(item.memo).trim() !== "" && String(item.memo).trim() !== "-";

    return {
      invoiceDate: (
        <span className="text-xs text-on-surface tabular-nums">{item.invoiceDate ?? "-"}</span>
      ),
      university: (
        <span className="text-sm font-medium text-on-surface">{item.university ?? "-"}</span>
      ),
      detail: (
        <span className="text-xs text-on-surface-variant truncate block max-w-[200px]">
          {item.detail ? stripNumbers(item.detail) : "-"}
        </span>
      ),
      operator: (
        <span className="text-xs text-on-surface">{item.operator ?? "-"}</span>
      ),
      amount: (
        <div className="text-right">
          <span className="font-bold tabular-nums text-sm">{item.amount.toLocaleString()}</span>
        </div>
      ),
      schoolContact: (
        <span className="text-xs text-on-surface-variant">{item.schoolContact ?? "-"}</span>
      ),
      mailSentDate: (
        <span className="text-xs text-on-surface-variant tabular-nums">{item.mailSentDate ?? "-"}</span>
      ),
      expectedPayDate: (
        <span className="text-xs text-on-surface-variant tabular-nums">{item.expectedPayDate ?? "-"}</span>
      ),
      daysElapsed: (
        <span className={`text-xs font-bold tabular-nums ${item.daysElapsed > 60 ? "text-error" : item.daysElapsed > 30 ? "text-tertiary" : "text-on-surface"}`}>
          {item.daysElapsed}일
        </span>
      ),
      payStatus: hasMemo ? (
        <span className="text-xs text-primary font-medium">{String(item.memo)}</span>
      ) : (
        <span className="text-xs text-error font-medium">미입금</span>
      ),
      actions: (
        <ReceivableActionMenu
          university={item.university ?? "-"}
          salesType={item.salesType ?? "-"}
          detail={item.detail ? stripNumbers(item.detail) : "-"}
          operator={item.operator ?? "-"}
          amount={item.amount}
          memo={item.memo}
          schoolContact={item.schoolContact}
          invoiceDate={item.invoiceDate}
          mailSentDate={item.mailSentDate}
          expectedPayDate={item.expectedPayDate}
          daysElapsed={item.daysElapsed}
        />
      ),
    };
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="미수채권"
        description="미수금 현황을 관리하고 회수 진행 상태를 추적합니다."
        breadcrumb={["운영", "미수채권"]}
      />

      <div className="text-xs text-on-surface-variant">
        기준일: <span className="font-bold text-on-surface">{sheetName}</span> (SharePoint 연동)
      </div>

      <KpiGrid>
        <KpiCard
          icon={<IconWallet size={18} className="text-on-surface-variant" />}
          label="청구금액"
          value={totalAmount.toLocaleString()}
          suffix="원"
        />
        <KpiCard
          icon={<IconCash size={18} className="text-on-surface-variant" />}
          label="입금금액"
          value={paidAmount.toLocaleString()}
          suffix="원"
        />
        <KpiCard
          icon={<IconAlertTriangle size={18} className="text-on-surface-variant" />}
          label="미수금"
          value={unpaidAmount.toLocaleString()}
          suffix="원"
          change={`${unpaidItems.length}건`}
          trend={unpaidItems.length > 0 ? "down" : undefined}
          alert={unpaidItems.length > 0}
        />
        <KpiCard
          icon={<IconClock size={18} className="text-on-surface-variant" />}
          label="30일 경과 미수"
          value={over30Unpaid.length.toString()}
          suffix="건"
          change={over30Unpaid.length > 0 ? `${over30Unpaid.reduce((s, r) => s + r.amount, 0).toLocaleString()}원` : undefined}
          trend={over30Unpaid.length > 0 ? "down" : undefined}
          alert={over30Unpaid.length > 0}
        />
      </KpiGrid>

      {/* 회수율 바 */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-on-surface">회수율</h2>
          <span className="text-2xl font-black text-primary tabular-nums">{collectionRate}%</span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden bg-surface-container-high">
          <div
            className="bg-primary transition-all rounded-full"
            style={{ width: `${collectionRate}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-on-surface-variant">
          <span>입금 <span className="font-bold text-on-surface">{paidAmount.toLocaleString()}원</span> ({paidItems.length}건)</span>
          <span>미수 <span className="font-bold text-error">{unpaidAmount.toLocaleString()}원</span> ({unpaidItems.length}건)</span>
        </div>
      </Card>

      <Suspense>
        <FilterBar
          searchPlaceholder="거래처명, 운영자, 거래내역 검색..."
          tabs={[
            { label: "전체", value: "all" },
            { label: "미입금", value: "unpaid" },
            { label: "입금완료", value: "paid" },
            { label: "30일 경과", value: "over30" },
          ]}
        />
      </Suspense>

      <TableSection totalCount={filteredItems.length}>
        <DataTable columns={columns} data={tableData} />
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
            <IconWallet size={40} className="opacity-30 mb-2" />
            <p className="text-sm font-medium">미수채권이 없습니다.</p>
          </div>
        )}
      </TableSection>
    </div>
  );
}
