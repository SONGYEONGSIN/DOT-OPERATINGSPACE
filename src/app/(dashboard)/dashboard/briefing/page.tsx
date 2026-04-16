import { createClient } from "@/lib/supabase/server";
import {
  PageHeader,
  KpiCard,
  KpiGrid,
  StatusBadge,
  Card,
  ProgressBar,
  DataTable,
  TableSection,
} from "@/components/common";
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconClock,
  IconCalendarDue,
  IconArrowsExchange,
  IconCloudUpload,
  IconListCheck,
} from "@tabler/icons-react";

const TOTAL_CATEGORIES = 14;

export default async function BriefingPage() {
  const supabase = createClient();

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const todayLabel = now.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  // 전체 서비스/work_logs 수 조회
  const [{ count: svcCount }, { count: wlCount }] = await Promise.all([
    supabase.from("services").select("id", { count: "exact", head: true }),
    supabase.from("service_work_logs").select("service_id", { count: "exact", head: true }),
  ]);

  // 서비스 전체 조회 (1000건씩 페이징)
  const allServices: { id: number; university_name: string | null; service_name: string | null; operator: string | null; category: string | null; writing_end: string | null; payment_end: string | null }[] = [];
  for (let offset = 0; offset < (svcCount ?? 0); offset += 1000) {
    const { data } = await supabase
      .from("services")
      .select("id, university_name, service_name, operator, category, writing_end, payment_end")
      .range(offset, offset + 999);
    if (data) allServices.push(...data);
  }

  // work_logs 전체 조회 (1000건씩 페이징)
  const allWorkLogs: { service_id: number }[] = [];
  for (let offset = 0; offset < (wlCount ?? 0); offset += 1000) {
    const { data } = await supabase
      .from("service_work_logs")
      .select("service_id")
      .range(offset, offset + 999);
    if (data) allWorkLogs.push(...data);
  }

  // 나머지 데이터 병렬 조회
  const [
    { data: handoverLogs },
    { data: backupRequests },
    { data: projectTasks },
    { data: profiles },
  ] = await Promise.all([
    supabase.from("handover_logs").select("id, service_id, field, from_person, to_person, executed_by, executed_at, memo").order("executed_at", { ascending: false }).limit(10),
    supabase.from("backup_requests").select("id, operator_name, operator_team, leave_type, start_date, end_date, status, created_at").order("created_at", { ascending: false }),
    supabase.from("project_tasks").select("id, project, title, status, priority, assignee, due_date, updated_at").order("updated_at", { ascending: false }),
    supabase.from("profiles").select("name, team, status").eq("status", "active"),
  ]);

  const allHandoverLogs = handoverLogs ?? [];
  const allBackupRequests = backupRequests ?? [];
  const allProjectTasks = projectTasks ?? [];
  const allProfiles = profiles ?? [];

  // ── 서비스 상태 계산 ──
  const logCountMap = new Map<number, number>();
  for (const log of allWorkLogs) {
    logCountMap.set(log.service_id, (logCountMap.get(log.service_id) ?? 0) + 1);
  }

  // ── 긴급 이슈 수집 ──
  const urgentIssues: { icon: React.ReactNode; title: string; detail: string; severity: "error" | "warning" }[] = [];

  // 1) 마감 임박 서비스 (3일 이내)
  const nowMs = now.getTime();
  for (const svc of allServices) {
    for (const [field, label] of [["writing_end", "작성마감"], ["payment_end", "결제마감"]] as const) {
      const val = svc[field];
      if (!val) continue;
      const days = Math.ceil((new Date(val).getTime() - nowMs) / (1000 * 60 * 60 * 24));
      if (days >= 0 && days <= 3) {
        urgentIssues.push({
          icon: <IconCalendarDue size={18} />,
          title: `${svc.university_name} ${label} D-${days === 0 ? "Day" : days}`,
          detail: `${svc.service_name} · ${svc.operator ?? "미배정"}`,
          severity: days <= 1 ? "error" : "warning",
        });
      }
    }
  }

  // 2) 마감 임박 프로젝트 작업 (3일 이내)
  for (const task of allProjectTasks) {
    if (!task.due_date || task.status === "done") continue;
    const days = Math.ceil((new Date(task.due_date).getTime() - nowMs) / (1000 * 60 * 60 * 24));
    if (days >= 0 && days <= 3) {
      urgentIssues.push({
        icon: <IconListCheck size={18} />,
        title: `프로젝트 작업 마감 D-${days === 0 ? "Day" : days}`,
        detail: `${task.title} · ${task.assignee ?? "미배정"}`,
        severity: days <= 1 ? "error" : "warning",
      });
    }
  }

  // ── KPI 계산 ──
  const urgentCount = urgentIssues.length;
  const taskDoneToday = allProjectTasks.filter(
    (t) => t.status === "done" && t.updated_at?.startsWith(todayStr),
  ).length;
  const taskInProgress = allProjectTasks.filter(
    (t) => t.status === "in_progress" || t.status === "review",
  ).length;

  // 현재 부재중인 인원
  const absentPeople = allBackupRequests.filter(
    (b) => b.start_date <= todayStr && b.end_date >= todayStr,
  );

  // ── 운영자별 업무 진행 현황 ──
  const operatorMap = new Map<string, { total: number; done: number }>();
  for (const svc of allServices) {
    if (!svc.operator) continue;
    const cnt = logCountMap.get(svc.id) ?? 0;
    const prev = operatorMap.get(svc.operator) ?? { total: 0, done: 0 };
    prev.total++;
    if (cnt >= TOTAL_CATEGORIES) prev.done++;
    operatorMap.set(svc.operator, prev);
  }
  const operatorProgress = Array.from(operatorMap.entries())
    .map(([name, stat]) => ({
      name,
      pct: stat.total > 0 ? Math.round((stat.done / stat.total) * 100) : 0,
      total: stat.total,
      done: stat.done,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  // ── 오늘의 일정 (마감 7일 이내) ──
  const upcomingSchedule = allServices
    .flatMap((svc) => {
      const items: { time: string; title: string; type: string; daysLeft: number }[] = [];
      for (const [field, label] of [["writing_end", "작성마감"], ["payment_end", "결제마감"]] as const) {
        const val = svc[field];
        if (!val) continue;
        const d = new Date(val);
        const days = Math.ceil((d.getTime() - nowMs) / (1000 * 60 * 60 * 24));
        if (days >= 0 && days <= 7) {
          items.push({
            time: d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" }),
            title: `${svc.university_name} - ${svc.service_name}`,
            type: label,
            daysLeft: days,
          });
        }
      }
      return items;
    })
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 8);

  // ── 최근 활동 로그 ──
  type ActivityItem = { time: string; person: string; action: string; variant: "success" | "info" | "warning" | "error"; statusLabel: string };
  const activityItems: ActivityItem[] = [];

  for (const log of allHandoverLogs.slice(0, 5)) {
    const svc = allServices.find((s) => s.id === log.service_id);
    activityItems.push({
      time: new Date(log.executed_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
      person: log.executed_by,
      action: `${svc?.university_name ?? "서비스"} 인수인계 (${log.from_person ?? "미배정"} → ${log.to_person})`,
      variant: "info",
      statusLabel: "인수인계",
    });
  }

  for (const req of allBackupRequests.slice(0, 3)) {
    activityItems.push({
      time: new Date(req.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
      person: req.operator_name,
      action: `${req.leave_type} 백업 요청 (${req.start_date} ~ ${req.end_date})`,
      variant: req.status === "작성 완료" ? "success" : "warning",
      statusLabel: req.status,
    });
  }

  activityItems.sort((a, b) => b.time.localeCompare(a.time));

  const activityColumns = [
    { key: "time", label: "시간", className: "w-20" },
    { key: "person", label: "담당자", className: "w-24" },
    { key: "action", label: "활동 내용" },
    { key: "status", label: "상태", className: "w-28" },
  ];

  const activityData = activityItems.slice(0, 8).map((item) => ({
    time: <span className="font-mono text-xs text-[var(--color-text-muted)]">{item.time}</span>,
    person: <span className="font-medium text-sm">{item.person}</span>,
    action: <span className="text-sm">{item.action}</span>,
    status: <StatusBadge variant={item.variant}>{item.statusLabel}</StatusBadge>,
  }));

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <PageHeader
        title="오늘의 브리핑"
        breadcrumb={["메인", "브리핑"]}
        description={todayLabel}
      />

      {/* ── 오늘의 핵심 지표 ── */}
      <KpiGrid>
        <KpiCard
          icon={<IconAlertTriangle size={18} className="text-[var(--color-text-muted)]" />}
          label="긴급 이슈"
          value={urgentCount.toString()}
          suffix="건"
          change="3일 이내 마감"
          trend={urgentCount > 0 ? "down" : "neutral"}
          alert={urgentCount > 0}
        />
        <KpiCard
          icon={<IconCircleCheck size={18} className="text-[var(--color-text-muted)]" />}
          label="오늘 완료"
          value={taskDoneToday.toString()}
          suffix="건"
          change="프로젝트 작업"
          trend="up"
        />
        <KpiCard
          icon={<IconClock size={18} className="text-[var(--color-text-muted)]" />}
          label="진행 중"
          value={taskInProgress.toString()}
          suffix="건"
          change="프로젝트 작업"
          trend="neutral"
        />
        <KpiCard
          icon={<IconCloudUpload size={18} className="text-[var(--color-text-muted)]" />}
          label="현재 부재"
          value={absentPeople.length.toString()}
          suffix="명"
          change={absentPeople.length > 0 ? absentPeople.map((p) => p.operator_name).join(", ") : "전원 근무"}
          trend="neutral"
        />
      </KpiGrid>

      {/* ── 긴급 알림 ── */}
      {urgentIssues.length > 0 && (
        <Card className="border-l-2 border-error p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--color-text)]">
              <IconAlertTriangle size={18} className="text-error" />
              긴급 알림
            </h3>
            <StatusBadge variant="error" dot>
              {urgentIssues.length}건 대기
            </StatusBadge>
          </div>
          <div className="space-y-3">
            {urgentIssues.slice(0, 5).map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-[14px] border border-black/[0.04]/10 bg-[var(--color-surface)] p-4 transition-colors hover:bg-surface-bright"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-[14px] ${item.severity === "error" ? "bg-error/10 text-error" : "bg-tertiary/10 text-tertiary"}`}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--color-text)]">{item.title}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">{item.detail}</p>
                  </div>
                </div>
                <StatusBadge variant={item.severity}>{item.severity === "error" ? "긴급" : "주의"}</StatusBadge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── 부서별 현황 2열 그리드 ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 운영자별 업무 진행 현황 */}
        <Card className="p-6">
          <h3 className="mb-5 text-sm font-bold text-primary tracking-[0.2em] uppercase">운영자별 등록 현황</h3>
          {operatorProgress.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)] py-4 text-center">운영자 데이터가 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {operatorProgress.map((op) => (
                <div key={op.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--color-text)]">{op.name}</span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      <strong className="text-[var(--color-text)]">{op.done}</strong>/{op.total} 완료 ({op.pct}%)
                    </span>
                  </div>
                  <ProgressBar value={op.pct} size="md" color={op.pct >= 80 ? "primary" : op.pct >= 50 ? "warning" : "error"} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* 다가오는 마감 일정 */}
        <Card className="p-6">
          <h3 className="mb-5 text-sm font-bold text-primary tracking-[0.2em] uppercase flex items-center gap-2">
            <IconCalendarDue size={16} />
            다가오는 마감
          </h3>
          {upcomingSchedule.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)] py-4 text-center">7일 이내 마감 일정이 없습니다.</p>
          ) : (
            <div className="relative space-y-4 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-px before:bg-outline-variant/30">
              {upcomingSchedule.map((item, idx) => (
                <div key={idx} className="relative flex items-start gap-4 pl-6">
                  <div className={`absolute left-0 top-1.5 h-3 w-3 rounded-full ${item.daysLeft <= 1 ? "bg-error" : item.daysLeft <= 3 ? "bg-tertiary" : "bg-primary"}`} />
                  <span className="w-16 shrink-0 text-xs font-bold text-[var(--color-text-muted)]">{item.time}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-[var(--color-text)] truncate block">{item.title}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StatusBadge variant={item.type === "작성마감" ? "warning" : "info"}>{item.type}</StatusBadge>
                      <span className={`text-[10px] font-bold ${item.daysLeft <= 1 ? "text-error" : "text-[var(--color-text-muted)]"}`}>
                        D-{item.daysLeft === 0 ? "Day" : item.daysLeft}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── 최근 활동 로그 ── */}
      {activityData.length > 0 && (
        <section>
          <TableSection totalCount={activityData.length}>
            <div className="px-6 pt-6 pb-2">
              <h3 className="text-sm font-bold text-primary tracking-[0.2em] uppercase">최근 활동 로그</h3>
            </div>
            <DataTable columns={activityColumns} data={activityData} />
          </TableSection>
        </section>
      )}
    </div>
  );
}
