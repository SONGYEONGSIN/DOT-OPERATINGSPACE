import { Suspense } from "react";
import {
  PageHeader,
  KpiGrid,
  KpiCard,
  StatusBadge,
  DataTable,
  TableSection,
  ProgressBar,
  Card,
} from "@/components/common";
import { IconFileDescription, IconCircleCheck, IconClock, IconCreditCard } from "@tabler/icons-react";
import { fetchContracts } from "@/lib/sharepoint";
import ContractFilters from "./ContractFilters";
import ContractActionMenu from "./ContractActionMenu";

function getStatusVariant(status: string | null) {
  if (!status) return { variant: "neutral" as const, label: "미정" };
  if (status.includes("완료")) return { variant: "success" as const, label: status };
  if (status.includes("진행")) return { variant: "warning" as const, label: status };
  return { variant: "neutral" as const, label: status };
}

interface PageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    region?: string;
    status?: string;
    charge?: string;
    scan?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 50;

export default async function ContractsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const categoryFilter = params.category ?? "";
  const searchFilter = params.search ?? "";
  const regionFilter = params.region ?? "";
  const statusFilter = params.status ?? "";
  const chargeFilter = params.charge ?? "";
  const scanFilter = params.scan ?? "";
  const currentPage = Math.max(1, Number(params.page) || 1);

  const result = await fetchContracts();
  const allContracts = result?.items ?? [];

  // 필터 옵션 추출
  const uniqueRegions = [...new Set(allContracts.map((c) => c.region).filter(Boolean))] as string[];
  const uniqueStatuses = [...new Set(allContracts.map((c) => c.contractStatus).filter(Boolean))] as string[];
  const uniqueChargeMethods = [...new Set(allContracts.map((c) => c.chargeMethod).filter(Boolean))] as string[];

  // 필터 적용
  let filtered = allContracts;
  if (categoryFilter) filtered = filtered.filter((c) => c.category === categoryFilter);
  if (regionFilter) filtered = filtered.filter((c) => c.region === regionFilter);
  if (statusFilter) filtered = filtered.filter((c) => c.contractStatus === statusFilter);
  if (chargeFilter) filtered = filtered.filter((c) => c.chargeMethod === chargeFilter);
  if (scanFilter === "incomplete") filtered = filtered.filter((c) => !c.hasScan);
  if (scanFilter === "complete") filtered = filtered.filter((c) => c.hasScan);
  if (searchFilter) {
    const q = searchFilter.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.universityName.toLowerCase().includes(q) ||
        (c.operator ?? "").toLowerCase().includes(q) ||
        (c.salesperson ?? "").toLowerCase().includes(q),
    );
  }

  // KPI
  const totalCount = allContracts.length;
  const completedCount = allContracts.filter((c) => c.contractStatus?.includes("완료")).length;
  const incompleteCount = totalCount - completedCount;
  const avgFee = totalCount > 0 ? Math.round(allContracts.reduce((sum, c) => sum + c.fee, 0) / totalCount) : 0;

  // 카테고리별 완료/미완료/수수료
  const categories = ["4년제", "전문대", "초중고", "대학원", "기타"] as const;
  const catStats = categories.map((cat) => {
    const items = allContracts.filter((c) => c.category === cat);
    const done = items.filter((c) => c.contractStatus?.includes("완료")).length;
    const fees = items.filter((c) => c.fee > 0);
    const avg = fees.length > 0 ? Math.round(fees.reduce((s, c) => s + c.fee, 0) / fees.length) : 0;
    return { cat, total: items.length, done, incomplete: items.length - done, avgFee: avg };
  });

  // 페이지네이션
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const columns = [
    { key: "numbering", label: "번호", className: "w-[6%]" },
    { key: "category", label: "구분", className: "w-[6%]" },
    { key: "region", label: "지역", className: "w-[5%]" },
    { key: "university", label: "대학명", className: "w-[16%]" },
    { key: "operator", label: "운영자", className: "w-[7%]" },
    { key: "salesperson", label: "영업자", className: "w-[7%]" },
    { key: "contractStatus", label: "계약현황", className: "w-[10%]" },
    { key: "chargeMethod", label: "청구방식", className: "w-[7%]" },
    { key: "fee", label: "수수료", className: "w-[7%] text-right" },
    { key: "period", label: "계약기간", className: "w-[9%]" },
    { key: "scan", label: "스캔본", className: "w-[5%] text-center" },
    { key: "remark", label: "비고", className: "w-[8%]" },
    { key: "action", label: "", className: "w-[4%]" },
  ];

  const tableData = pageItems.map((c) => {
    const sv = getStatusVariant(c.contractStatus);
    return {
      numbering: <span className="font-mono text-xs text-[var(--color-text-muted)]">{c.numbering}</span>,
      category: (
        <span className={`text-xs font-bold ${c.category === "4년제" ? "text-primary" : c.category === "전문대" ? "text-tertiary" : "text-[var(--color-text-muted)]"}`}>
          {c.category}
        </span>
      ),
      region: <span className="text-xs text-[var(--color-text-muted)]">{c.region ?? "-"}</span>,
      university: <span className="text-sm font-medium text-[var(--color-text)]">{c.universityName}</span>,
      operator: <span className="text-xs text-[var(--color-text-muted)]">{c.operator ?? "-"}</span>,
      salesperson: <span className="text-xs text-[var(--color-text-muted)]">{c.salesperson ?? "-"}</span>,
      contractStatus: c.contractStatus ? <StatusBadge variant={sv.variant}>{sv.label}</StatusBadge> : <span className="text-xs text-[var(--color-text-muted)]">-</span>,
      chargeMethod: <span className="text-xs text-[var(--color-text-muted)]">{c.chargeMethod ?? "-"}</span>,
      fee: <span className="text-xs font-semibold text-[var(--color-text)] tabular-nums">{c.fee > 0 ? c.fee.toLocaleString() : "-"}</span>,
      period: <span className="text-xs text-[var(--color-text-muted)]">{c.contractPeriod ?? "-"}</span>,
      scan: c.hasScan ? (
        <span className="text-xs font-bold text-primary">○</span>
      ) : (
        <span className="text-xs text-[var(--color-text-muted)]">-</span>
      ),
      remark: c.remark ? (
        <span className="text-xs text-[var(--color-text-muted)] truncate max-w-[120px] block cursor-help" title={c.remark}>{c.remark}</span>
      ) : (
        <span className="text-xs text-[var(--color-text-muted)]">-</span>
      ),
      action: <ContractActionMenu numbering={c.numbering} universityName={c.universityName} hasScan={c.hasScan} />,
    };
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="계약서 관리"
        description={`2027학년도 대학 계약 현황을 관리합니다. (총 ${totalCount}건)`}
        breadcrumb={["운영", "계약서 관리"]}
      />

      <KpiGrid>
        <KpiCard
          icon={<IconFileDescription size={18} className="text-[var(--color-text-muted)]" />}
          label="전체 계약"
          value={totalCount.toString()}
          suffix="건"
          hoverChange
          change={
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {catStats.map((s) => (
                <span key={s.cat} className="text-[10px] text-[var(--color-text-muted)]">{s.cat} <strong className="text-[var(--color-text)]">{s.total}</strong></span>
              ))}
            </div>
          }
        />
        <KpiCard
          icon={<IconCircleCheck size={18} className="text-[var(--color-text-muted)]" />}
          label="계약완료"
          value={completedCount.toString()}
          suffix="건"
          hoverChange
          change={
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {catStats.map((s) => (
                <span key={s.cat} className="text-[10px] text-[var(--color-text-muted)]">{s.cat} <strong className="text-[var(--color-text)]">{s.done}</strong></span>
              ))}
            </div>
          }
        />
        <KpiCard
          icon={<IconClock size={18} className="text-[var(--color-text-muted)]" />}
          label="계약미완료"
          value={incompleteCount.toString()}
          suffix="건"
          alert={incompleteCount > 0}
          hoverChange
          change={
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {catStats.map((s) => (
                <span key={s.cat} className="text-[10px] text-[var(--color-text-muted)]">{s.cat} <strong className="text-[var(--color-text)]">{s.incomplete}</strong></span>
              ))}
            </div>
          }
        />
        <KpiCard
          icon={<IconCreditCard size={18} className="text-[var(--color-text-muted)]" />}
          label="평균 수수료"
          value={avgFee.toLocaleString()}
          suffix="원"
          hoverChange
          change={
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {catStats.filter((s) => s.avgFee > 0).map((s) => (
                <span key={s.cat} className="text-[10px] text-[var(--color-text-muted)]">{s.cat} <strong className="text-[var(--color-text)] tabular-nums">{s.avgFee.toLocaleString()}</strong></span>
              ))}
            </div>
          }
        />
      </KpiGrid>

      <Suspense>
        <ContractFilters
          regions={uniqueRegions.sort()}
          statuses={uniqueStatuses.sort()}
          chargeMethods={uniqueChargeMethods.sort()}
        />
      </Suspense>

      {/* 카테고리별 진행률 */}
      <div className="grid grid-cols-5 gap-3">
        {catStats.map((s) => {
          const pct = s.total > 0 ? Math.round((s.done / s.total) * 100) : 0;
          return (
            <Card key={s.cat} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--color-text)]">{s.cat}</span>
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] tabular-nums">{s.done}/{s.total} ({pct}%)</span>
              </div>
              <ProgressBar value={s.done} max={s.total || 1} size="sm" color={pct === 100 ? "primary" : pct >= 50 ? "warning" : "error"} />
              <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-muted)]">
                <span>스캔 <strong className="text-[var(--color-text)]">{allContracts.filter((c) => c.category === s.cat && c.hasScan).length}</strong>/{s.total}</span>
                <span>미완료 <strong className="text-[var(--color-text)]">{s.incomplete}</strong></span>
              </div>
            </Card>
          );
        })}
      </div>

      <TableSection totalCount={filtered.length}>
        <DataTable
          columns={columns}
          data={tableData}
          footer={
            totalPages > 1 ? (
              <div className="flex items-center justify-between">
                <p className="text-xs text-[var(--color-text-muted)]">
                  총 <span className="font-bold text-[var(--color-text)]">{filtered.length}</span>건 중{" "}
                  {(currentPage - 1) * PAGE_SIZE + 1}~{Math.min(currentPage * PAGE_SIZE, filtered.length)}건
                </p>
                <div className="flex items-center gap-1">
                  {currentPage > 1 && (
                    <a
                      href={`?${new URLSearchParams({ ...params, page: String(currentPage - 1) }).toString()}`}
                      className="px-3 py-1.5 rounded-[14px] text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] transition-colors"
                    >
                      이전
                    </a>
                  )}
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <a
                        key={p}
                        href={`?${new URLSearchParams({ ...params, page: String(p) }).toString()}`}
                        className={`px-3 py-1.5 rounded-[14px] text-xs font-bold ${
                          p === currentPage ? "bg-primary/10 text-primary" : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]"
                        } transition-colors`}
                      >
                        {p}
                      </a>
                    );
                  })}
                  {currentPage < totalPages && (
                    <a
                      href={`?${new URLSearchParams({ ...params, page: String(currentPage + 1) }).toString()}`}
                      className="px-3 py-1.5 rounded-[14px] text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] transition-colors"
                    >
                      다음
                    </a>
                  )}
                </div>
              </div>
            ) : undefined
          }
        />
        {allContracts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-[var(--color-text-muted)]">
            <IconFileDescription size={40} className="opacity-30 mb-2" />
            <p className="text-sm font-medium">계약서 데이터를 불러올 수 없습니다.</p>
            <p className="text-xs mt-1">SharePoint 연동을 확인해주세요.</p>
          </div>
        )}
      </TableSection>
    </div>
  );
}
