import { Suspense } from "react";
import {
  PageHeader,
  KpiGrid,
  KpiCard,
  StatusBadge,
  DataTable,
  TableSection,
  FilterBar,
  UserAvatar,
} from "@/components/common";
import { IconCalendarEvent, IconClock, IconCircleCheck, IconAlertTriangle } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import type { BackupRequest } from "./types";
import { getLeaveColor } from "./types";
import BackupPageTabs from "./BackupPageTabs";
import BackupActionMenu from "./BackupActionMenu";

interface PageProps {
  searchParams: Promise<{ search?: string; tab?: string }>;
}

export default async function BackupPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const searchFilter = params.search ?? "";
  const tabFilter = params.tab ?? "all";

  const supabase = createClient();

  const { data: requestRows } = await supabase
    .from("backup_requests")
    .select("*")
    .order("created_at", { ascending: false });

  const requests: BackupRequest[] = (requestRows ?? []) as BackupRequest[];

  const { data: profileRows } = await supabase
    .from("profiles")
    .select("id, name, team, email")
    .eq("status", "active")
    .order("name");

  const profiles = (profileRows ?? []) as { id: number; name: string; team: string; email: string }[];

  // KPI
  const today = new Date().toISOString().slice(0, 10);
  const totalCount = requests.length;
  const activeCount = requests.filter((r) => r.start_date <= today && r.end_date >= today).length;
  const completedCount = requests.filter((r) => r.status === "작성 완료").length;
  const pendingCount = requests.filter((r) => r.status === "작성 전").length;

  // 필터
  let filtered = requests;
  if (tabFilter === "운영1팀") filtered = filtered.filter((r) => r.operator_team === "운영1팀");
  if (tabFilter === "운영2팀") filtered = filtered.filter((r) => r.operator_team === "운영2팀");
  if (tabFilter === "pending") filtered = filtered.filter((r) => r.status === "작성 전");
  if (tabFilter === "completed") filtered = filtered.filter((r) => r.status === "작성 완료");

  if (searchFilter) {
    const q = searchFilter.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.operator_name.toLowerCase().includes(q) ||
        r.ops_backup_name.toLowerCase().includes(q),
    );
  }

  const columns = [
    { key: "operator", label: "요청자", className: "w-[14%]" },
    { key: "team", label: "운영팀", className: "w-[8%]" },
    { key: "leaveType", label: "휴가유형", className: "w-[10%]" },
    { key: "period", label: "기간", className: "w-[20%]" },
    { key: "opsBackup", label: "백업자", className: "w-[14%]" },
    { key: "status", label: "상태", className: "w-[10%]" },
    { key: "notifiedAt", label: "최종알림", className: "w-[14%]" },
    { key: "actions", label: "", className: "!px-1 w-10" },
  ];

  const tableData = filtered.map((r) => ({
    operator: (
      <div className="flex items-center gap-2">
        <UserAvatar name={r.operator_name} size="sm" />
        <span className="text-sm font-semibold text-[var(--color-text)]">{r.operator_name}</span>
      </div>
    ),
    team: <span className="text-xs text-[var(--color-text-muted)]">{r.operator_team}</span>,
    leaveType: (
      <StatusBadge variant={getLeaveColor(r.leave_type) as any}>{r.leave_type}</StatusBadge>
    ),
    period: (
      <span className="text-xs text-[var(--color-text)] tabular-nums">{r.start_date} → {r.end_date}</span>
    ),
    opsBackup: (
      <div className="flex items-center gap-2">
        <UserAvatar name={r.ops_backup_name} size="sm" />
        <span className="text-xs text-[var(--color-text)]">{r.ops_backup_name}</span>
      </div>
    ),
    status: (
      <StatusBadge variant={r.status === "작성 완료" ? "success" : "warning"} dot={r.status === "작성 완료"}>
        {r.status}
      </StatusBadge>
    ),
    notifiedAt: (
      <span className="text-xs text-[var(--color-text-muted)] tabular-nums">
        {r.last_notified_at
          ? new Date(r.last_notified_at).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })
          : "-"}
      </span>
    ),
    actions: <BackupActionMenu request={r} />,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="백업요청"
        description="운영자 부재 시 업무 백업을 요청하고 관리합니다."
        breadcrumb={["운영", "백업요청"]}
      />

      <BackupPageTabs profiles={profiles}>
        {/* 백업 현황 콘텐츠 */}
        <KpiGrid>
          <KpiCard icon={<IconCalendarEvent size={18} className="text-[var(--color-text-muted)]" />} label="전체 요청" value={totalCount.toString()} suffix="건" />
          <KpiCard icon={<IconClock size={18} className="text-[var(--color-text-muted)]" />} label="진행 중" value={activeCount.toString()} suffix="건" />
          <KpiCard icon={<IconCircleCheck size={18} className="text-[var(--color-text-muted)]" />} label="작성 완료" value={completedCount.toString()} suffix="건" />
          <KpiCard icon={<IconAlertTriangle size={18} className="text-[var(--color-text-muted)]" />} label="작성 전" value={pendingCount.toString()} suffix="건" alert={pendingCount > 0} />
        </KpiGrid>

        <Suspense>
          <FilterBar
            searchPlaceholder="요청자, 백업자 검색..."
            tabs={[
              { label: "전체", value: "all" },
              { label: "운영1팀", value: "운영1팀" },
              { label: "운영2팀", value: "운영2팀" },
              { label: "작성 전", value: "pending" },
              { label: "작성 완료", value: "completed" },
            ]}
          />
        </Suspense>

        <TableSection totalCount={filtered.length}>
          <DataTable columns={columns} data={tableData} />
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-[var(--color-text-muted)]">
              <IconCalendarEvent size={40} className="opacity-30 mb-2" />
              <p className="text-sm font-medium">백업 요청이 없습니다.</p>
            </div>
          )}
        </TableSection>
      </BackupPageTabs>
    </div>
  );
}
