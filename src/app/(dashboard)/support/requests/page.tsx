import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import {
  PageHeader,
  KpiGrid,
  KpiCard,
  StatusBadge,
  DataTable,
  FilterBar,
  TableSection,
  UserAvatar,
} from "@/components/common";
import { IconInbox, IconClockPause, IconAlertTriangle, IconCircleCheck } from "@tabler/icons-react";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "../../projects/_components/types";
import NewRequestButton from "./NewRequestButton";

interface ProjectTask {
  id: number;
  project: string;
  title: string;
  description: string | null;
  status: string;
  priority: "low" | "medium" | "high" | "urgent";
  assignee: string | null;
  requester: string | null;
  due_date: string | null;
  year: number;
  created_at: string;
}

interface PageProps {
  searchParams: Promise<{ search?: string; tab?: string }>;
}

export default async function RequestsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const searchFilter = params.search ?? "";
  const tabFilter = params.tab ?? "all";

  const supabase = createClient();

  const [{ data: tasks }, { data: profileRows }] = await Promise.all([
    supabase
      .from("project_tasks")
      .select("*")
      .eq("project", "system")
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("name")
      .eq("status", "active")
      .order("name"),
  ]);

  const profiles = (profileRows ?? []) as { name: string }[];

  const allRequests = (tasks ?? []) as ProjectTask[];

  // 필터
  let filtered = allRequests;
  if (tabFilter === "request") filtered = filtered.filter((t) => t.status === "request");
  if (tabFilter === "planning") filtered = filtered.filter((t) => t.status === "planning");
  if (tabFilter === "development") filtered = filtered.filter((t) => t.status === "development" || t.status === "testing");
  if (tabFilter === "done") filtered = filtered.filter((t) => t.status === "done");

  if (searchFilter) {
    const q = searchFilter.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.requester ?? "").toLowerCase().includes(q) ||
        (t.description ?? "").toLowerCase().includes(q),
    );
  }

  // KPI
  const totalCount = allRequests.length;
  const openCount = allRequests.filter((t) => t.status !== "done" && t.status !== "hold").length;
  const highCount = allRequests.filter((t) => t.priority === "high" || t.priority === "urgent").length;
  const doneCount = allRequests.filter((t) => t.status === "done").length;

  const columns = [
    { key: "request", label: "요청 내용" },
    { key: "priority", label: "우선순위", className: "w-[8%]" },
    { key: "status", label: "단계", className: "w-[8%]" },
    { key: "requester", label: "요청자", className: "w-[10%]" },
    { key: "assignee", label: "담당자", className: "w-[10%]" },
    { key: "date", label: "요청일", className: "w-[10%]" },
  ];

  const tableData = filtered.map((t) => {
    const sc = STATUS_CONFIG[t.status] ?? { label: t.status, variant: "neutral" as const };
    const pc = PRIORITY_CONFIG[t.priority];
    return {
      request: (
        <div>
          <p className="text-sm font-semibold text-on-surface">{t.title}</p>
          {t.description && <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">{t.description}</p>}
        </div>
      ),
      priority: <StatusBadge variant={pc.variant}>{pc.label}</StatusBadge>,
      status: <StatusBadge variant={sc.variant}>{sc.label}</StatusBadge>,
      requester: t.requester ? (
        <div className="flex items-center gap-1.5">
          <UserAvatar name={t.requester} size="sm" className="!w-5 !h-5" />
          <span className="text-xs text-on-surface">{t.requester}</span>
        </div>
      ) : <span className="text-xs text-on-surface-variant">-</span>,
      assignee: t.assignee ? (
        <div className="flex items-center gap-1.5">
          <UserAvatar name={t.assignee} size="sm" className="!w-5 !h-5" />
          <span className="text-xs text-on-surface">{t.assignee}</span>
        </div>
      ) : <span className="text-xs text-on-surface-variant">미배정</span>,
      date: <span className="text-xs text-on-surface-variant tabular-nums">{new Date(t.created_at).toLocaleDateString("ko-KR")}</span>,
    };
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="시스템 개선요청"
        description="전체 프로젝트의 개선 요청을 통합 조회합니다."
        breadcrumb={["지원", "시스템 개선요청"]}
        actions={<NewRequestButton profiles={profiles} />}
      />

      <KpiGrid>
        <KpiCard
          icon={<IconInbox size={18} className="text-on-surface-variant" />}
          label="전체 요청"
          value={totalCount.toString()}
          suffix="건"
        />
        <KpiCard
          icon={<IconClockPause size={18} className="text-on-surface-variant" />}
          label="처리중"
          value={openCount.toString()}
          suffix="건"
        />
        <KpiCard
          icon={<IconAlertTriangle size={18} className="text-on-surface-variant" />}
          label="높은 우선순위"
          value={highCount.toString()}
          suffix="건"
          alert={highCount > 0}
        />
        <KpiCard
          icon={<IconCircleCheck size={18} className="text-on-surface-variant" />}
          label="처리 완료"
          value={doneCount.toString()}
          suffix="건"
          change={totalCount > 0 ? `${Math.round((doneCount / totalCount) * 100)}%` : undefined}
          trend={doneCount > 0 ? "up" : undefined}
        />
      </KpiGrid>

      <Suspense>
        <FilterBar
          searchPlaceholder="요청 제목, 요청자 검색..."
          tabs={[
            { label: "전체", value: "all" },
            { label: "요청", value: "request" },
            { label: "기획/검토", value: "planning" },
            { label: "개발/테스트", value: "development" },
            { label: "완료", value: "done" },
          ]}
        />
      </Suspense>

      <TableSection totalCount={filtered.length}>
        <DataTable columns={columns} data={tableData} />
        {allRequests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
            <IconInbox size={40} className="opacity-30 mb-2" />
            <p className="text-sm font-medium">등록된 요청이 없습니다.</p>
            <p className="text-xs mt-1">프로젝트 메뉴에서 "요청하기" 탭으로 요청을 등록할 수 있습니다.</p>
          </div>
        )}
      </TableSection>
    </div>
  );
}
