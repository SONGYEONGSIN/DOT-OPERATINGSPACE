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
  IconNetwork,
  IconCircleCheck,
  IconArrowsExchange,
  IconCreditCardOff,
  IconCalendarDue,
  IconUsers,
  IconListCheck,
  IconProgress,
} from "@tabler/icons-react";
import Link from "next/link";

const TOTAL_CATEGORIES = 14;

function computeStatusLabel(logCount: number) {
  if (logCount === 0) return { label: "등록예정", variant: "info" as const };
  if (logCount >= TOTAL_CATEGORIES)
    return { label: "등록완료", variant: "neutral" as const };
  return { label: "등록중", variant: "success" as const };
}

export default async function DashboardPage() {
  const supabase = createClient();

  // 전체 서비스 수 조회
  const { count: svcCount } = await supabase
    .from("services")
    .select("id", { count: "exact", head: true });
  const totalSvcRows = svcCount ?? 0;

  // 전체 work_logs 수 조회
  const { count: wlCount } = await supabase
    .from("service_work_logs")
    .select("service_id", { count: "exact", head: true });
  const totalWlRows = wlCount ?? 0;

  // 서비스 + work_logs 전체 조회 (1000건씩 페이징)
  const allServices: {
    id: number;
    university_name: string | null;
    service_name: string | null;
    operator: string | null;
    category: string | null;
    writing_end: string | null;
    payment_end: string | null;
    writing_start: string | null;
    payment_start: string | null;
  }[] = [];
  for (let offset = 0; offset < totalSvcRows; offset += 1000) {
    const { data } = await supabase
      .from("services")
      .select(
        "id, university_name, service_name, operator, category, writing_end, payment_end, writing_start, payment_start",
      )
      .range(offset, offset + 999);
    if (data) allServices.push(...data);
  }

  const allWorkLogs: { service_id: number }[] = [];
  for (let offset = 0; offset < totalWlRows; offset += 1000) {
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
    supabase
      .from("handover_logs")
      .select(
        "id, service_id, field, from_person, to_person, executed_by, executed_at",
      )
      .order("executed_at", { ascending: false })
      .limit(10),
    supabase
      .from("backup_requests")
      .select(
        "id, operator_name, leave_type, start_date, end_date, status, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("project_tasks")
      .select("id, project, title, status, priority, assignee, updated_at")
      .order("updated_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("name, team, status")
      .eq("status", "active"),
  ]);

  const allHandoverLogs = handoverLogs ?? [];
  const allBackupRequests = backupRequests ?? [];
  const allProjectTasks = projectTasks ?? [];
  const allProfiles = profiles ?? [];

  // ── 서비스 통계 ──
  const logCountMap = new Map<number, number>();
  for (const log of allWorkLogs) {
    logCountMap.set(log.service_id, (logCountMap.get(log.service_id) ?? 0) + 1);
  }

  let activeCount = 0;
  let completedCount = 0;
  let upcomingCount = 0;
  for (const svc of allServices) {
    const cnt = logCountMap.get(svc.id) ?? 0;
    if (cnt === 0) upcomingCount++;
    else if (cnt >= TOTAL_CATEGORIES) completedCount++;
    else activeCount++;
  }

  // ── 마감 임박 서비스 (7일 이내) ──
  const now = Date.now();
  const urgentDeadlines = allServices
    .map((svc) => {
      const deadlines: { type: string; date: Date; svc: typeof svc }[] = [];
      if (svc.writing_end) {
        const d = new Date(svc.writing_end);
        const days = Math.ceil((d.getTime() - now) / (1000 * 60 * 60 * 24));
        if (days >= 0 && days <= 7)
          deadlines.push({ type: "작성마감", date: d, svc });
      }
      if (svc.payment_end) {
        const d = new Date(svc.payment_end);
        const days = Math.ceil((d.getTime() - now) / (1000 * 60 * 60 * 24));
        if (days >= 0 && days <= 7)
          deadlines.push({ type: "결제마감", date: d, svc });
      }
      return deadlines;
    })
    .flat()
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  // ── 프로젝트 통계 ──
  const taskTotal = allProjectTasks.length;
  const taskDone = allProjectTasks.filter((t) => t.status === "done").length;
  const taskInProgress = allProjectTasks.filter(
    (t) => t.status === "in_progress" || t.status === "review",
  ).length;
  const taskPct = taskTotal > 0 ? Math.round((taskDone / taskTotal) * 100) : 0;

  // ── 운영자별 서비스 담당 현황 ──
  const operatorMap = new Map<string, number>();
  for (const svc of allServices) {
    if (svc.operator) {
      operatorMap.set(svc.operator, (operatorMap.get(svc.operator) ?? 0) + 1);
    }
  }
  const excludedOperators = new Set(["송영신", "허승철"]);
  const operatorStats = Array.from(operatorMap.entries())
    .filter(([name]) => !excludedOperators.has(name))
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const maxOperatorCount =
    operatorStats.length > 0 ? operatorStats[0].count : 1;

  // ── 현재 진행 중인 백업 ──
  const today = new Date().toISOString().slice(0, 10);
  const activeBackups = allBackupRequests.filter(
    (b) => b.start_date <= today && b.end_date >= today,
  );

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <PageHeader
        title="통합 운영 현황"
        description="서비스, 프로젝트, 인력 운영 현황을 실시간으로 확인합니다."
        breadcrumb={["메인", "대시보드"]}
      />

      {/* ── KPI Cards ── */}
      <KpiGrid>
        <KpiCard
          icon={<IconNetwork size={18} className="text-[var(--color-text-muted)]" />}
          label="전체 서비스"
          value={allServices.length.toString()}
          suffix="건"
          change={`등록중 ${activeCount} · 완료 ${completedCount}`}
        />
        <KpiCard
          icon={<IconListCheck size={18} className="text-[var(--color-text-muted)]" />}
          label="프로젝트 작업"
          value={taskTotal.toString()}
          suffix="건"
          change={`완료 ${taskDone} · 진행 ${taskInProgress}`}
        />
        <KpiCard
          icon={
            <IconArrowsExchange size={18} className="text-[var(--color-text-muted)]" />
          }
          label="인수인계"
          value={allHandoverLogs.length.toString()}
          suffix="건"
          change="최근 기록"
        />
        <KpiCard
          icon={<IconUsers size={18} className="text-[var(--color-text-muted)]" />}
          label="운영인력"
          value={allProfiles.length.toString()}
          suffix="명"
          change={`운영자 ${operatorStats.length}명 배정`}
        />
      </KpiGrid>

      {/* ── 서비스 현황 + 프로젝트 진행률 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 서비스 상태 분포 */}
        <Card className="p-6">
          <h3 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-5">
            서비스 등록 현황
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--color-text-muted)]">등록중</span>
                <span className="font-bold text-[var(--color-text)]">
                  {activeCount.toLocaleString()}건
                </span>
              </div>
              <ProgressBar
                value={activeCount}
                max={allServices.length || 1}
                size="md"
                color="primary"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--color-text-muted)]">등록완료</span>
                <span className="font-bold text-[var(--color-text)]">
                  {completedCount.toLocaleString()}건
                </span>
              </div>
              <ProgressBar
                value={completedCount}
                max={allServices.length || 1}
                size="md"
                color="primary"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--color-text-muted)]">등록예정</span>
                <span className="font-bold text-[var(--color-text)]">
                  {upcomingCount.toLocaleString()}건
                </span>
              </div>
              <ProgressBar
                value={upcomingCount}
                max={allServices.length || 1}
                size="md"
                color="warning"
              />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-black/[0.04]/10 text-center">
            <Link
              href="/operations/services"
              className="text-xs font-bold text-primary hover:underline"
            >
              서비스 관리 바로가기 →
            </Link>
          </div>
        </Card>

        {/* 프로젝트 달성률 */}
        <Card className="p-6">
          <h3 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-5">
            프로젝트 달성률
          </h3>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  strokeWidth="8"
                  className="stroke-surface-container-highest"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  strokeWidth="8"
                  className="stroke-primary"
                  strokeDasharray={`${taskPct * 2.64} 264`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-[var(--color-text)]">
                  {taskPct}%
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)]">
                  달성률
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 text-[10px] text-[var(--color-text-muted)]">
            <span>
              할 일{" "}
              <strong className="text-[var(--color-text)]">
                {taskTotal - taskDone - taskInProgress}
              </strong>
            </span>
            <span>
              진행 중{" "}
              <strong className="text-[var(--color-text)]">{taskInProgress}</strong>
            </span>
            <span>
              완료 <strong className="text-[var(--color-text)]">{taskDone}</strong>
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-black/[0.04]/10 text-center">
            <Link
              href="/projects"
              className="text-xs font-bold text-primary hover:underline"
            >
              프로젝트 현황 바로가기 →
            </Link>
          </div>
        </Card>
      </div>

      {/* ── 마감 임박 + 운영자 현황 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 마감 임박 */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-primary tracking-[0.2em] uppercase flex items-center gap-2">
                <IconCalendarDue size={16} />
                마감 임박 서비스
              </h3>
              <StatusBadge variant="error">
                {urgentDeadlines.length}건
              </StatusBadge>
            </div>
            {urgentDeadlines.length === 0 ? (
              <p className="text-xs text-[var(--color-text-muted)] py-6 text-center">
                7일 이내 마감 예정 서비스가 없습니다.
              </p>
            ) : (
              <div className="space-y-3">
                {urgentDeadlines.map((item, idx) => {
                  const daysLeft = Math.ceil(
                    (item.date.getTime() - now) / (1000 * 60 * 60 * 24),
                  );
                  return (
                    <div
                      key={`${item.svc.id}-${item.type}-${idx}`}
                      className="flex items-center justify-between p-3 rounded-[14px] bg-[var(--color-surface)]/50"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[var(--color-text)] truncate">
                            {item.svc.university_name}
                          </span>
                          <StatusBadge
                            variant={
                              item.type === "작성마감" ? "warning" : "info"
                            }
                          >
                            {item.type}
                          </StatusBadge>
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
                          {item.svc.service_name} ·{" "}
                          {item.svc.operator ?? "미배정"}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-black tabular-nums whitespace-nowrap ml-3 ${daysLeft <= 3 ? "text-error" : "text-tertiary"}`}
                      >
                        {daysLeft === 0 ? "오늘 마감" : `D-${daysLeft}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* 운영자별 담당 현황 */}
        <Card className="p-6">
          <h3 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-5">
            운영자별 담당
          </h3>
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-3">
            {operatorStats.map((op) => (
              <div key={op.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--color-text)] font-medium">{op.name}</span>
                  <span className="font-bold text-[var(--color-text-muted)] tabular-nums">
                    {op.count}건
                  </span>
                </div>
                <ProgressBar
                  value={op.count}
                  max={maxOperatorCount}
                  size="sm"
                  color="primary"
                />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── 최근 인수인계 + 백업 현황 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 인수인계 */}
        <div>
          <h3 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-4">
            최근 인수인계
          </h3>
          {allHandoverLogs.length === 0 ? (
            <Card className="p-6">
              <p className="text-xs text-[var(--color-text-muted)] text-center">
                인수인계 기록이 없습니다.
              </p>
            </Card>
          ) : (
            <Card className="divide-y divide-outline-variant/10 overflow-hidden p-0">
              {allHandoverLogs.slice(0, 5).map((log) => {
                const svc = allServices.find((s) => s.id === log.service_id);
                return (
                  <div
                    key={log.id}
                    className="px-5 py-3.5 flex items-center gap-3 hover:bg-[var(--color-surface)]/50 transition-colors"
                  >
                    <IconArrowsExchange
                      size={16}
                      className="text-primary shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-text)] truncate">
                        {svc?.university_name ?? "서비스"} ·{" "}
                        {svc?.service_name ?? ""}
                      </p>
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                        {log.from_person ?? "미배정"} →{" "}
                        <strong className="text-[var(--color-text)]">
                          {log.to_person}
                        </strong>{" "}
                        · {log.executed_by}
                      </p>
                    </div>
                    <span className="text-[10px] text-[var(--color-text-muted)] tabular-nums whitespace-nowrap">
                      {new Date(log.executed_at).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                );
              })}
            </Card>
          )}
          <div className="mt-3 text-center">
            <Link
              href="/operations/handover"
              className="text-xs font-bold text-primary hover:underline"
            >
              전체 보기 →
            </Link>
          </div>
        </div>

        {/* 백업 현황 */}
        <div>
          <h3 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-4">
            백업 현황
            {activeBackups.length > 0 && (
              <StatusBadge variant="warning">
                {activeBackups.length}명 부재
              </StatusBadge>
            )}
          </h3>
          {allBackupRequests.length === 0 ? (
            <Card className="p-6">
              <p className="text-xs text-[var(--color-text-muted)] text-center">
                백업 요청이 없습니다.
              </p>
            </Card>
          ) : (
            <Card className="divide-y divide-outline-variant/10 overflow-hidden p-0">
              {allBackupRequests.slice(0, 5).map((req) => (
                <div
                  key={req.id}
                  className="px-5 py-3.5 flex items-center gap-3 hover:bg-[var(--color-surface)]/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--color-text)]">
                        {req.operator_name}
                      </span>
                      <StatusBadge
                        variant={
                          req.status === "작성 완료" ? "success" : "warning"
                        }
                      >
                        {req.status}
                      </StatusBadge>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                      {req.leave_type} · {req.start_date} ~ {req.end_date}
                    </p>
                  </div>
                </div>
              ))}
            </Card>
          )}
          <div className="mt-3 text-center">
            <Link
              href="/operations/backup"
              className="text-xs font-bold text-primary hover:underline"
            >
              전체 보기 →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
