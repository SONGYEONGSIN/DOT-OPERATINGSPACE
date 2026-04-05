import { createClient } from "@/lib/supabase/server";
import { PageHeader, KpiGrid, KpiCard, Card, ProgressBar, StatusBadge } from "@/components/common";
import { IconLayoutKanban, IconCircleCheck, IconProgress, IconListCheck } from "@tabler/icons-react";
import { PROJECT_NAMES, PRIORITY_CONFIG, PROJECT_OWNERS } from "./_components/types";
import type { ProjectTask, ProjectLog } from "./_components/types";
import Link from "next/link";

const PROJECT_KEYS = Object.keys(PROJECT_NAMES);

function getProgressColor(pct: number): "primary" | "warning" | "error" {
  if (pct >= 60) return "primary";
  if (pct >= 30) return "warning";
  return "error";
}

export default async function ProjectsOverviewPage() {
  const supabase = createClient();

  const [{ data: allTasks }, { data: allLogs }] = await Promise.all([
    supabase
      .from("project_tasks")
      .select("*")
      .order("sort_order"),
    supabase
      .from("project_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const tasks = (allTasks ?? []) as ProjectTask[];
  const logs = (allLogs ?? []) as ProjectLog[];

  // 프로젝트별 통계
  const projectStats = PROJECT_KEYS.map((key) => {
    const projectTasks = tasks.filter((t) => t.project === key);
    const total = projectTasks.length;
    const done = projectTasks.filter((t) => t.status === "done").length;
    const development = projectTasks.filter((t) => t.status === "development").length;
    const testing = projectTasks.filter((t) => t.status === "testing").length;
    const request = projectTasks.filter((t) => t.status === "request").length;
    const planning = projectTasks.filter((t) => t.status === "planning").length;
    const hold = projectTasks.filter((t) => t.status === "hold").length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    // 마감 임박 (7일 이내)
    const now = Date.now();
    const urgentCount = projectTasks.filter((t) => {
      if (!t.due_date || t.status === "done") return false;
      const daysLeft = Math.ceil((new Date(t.due_date).getTime() - now) / (1000 * 60 * 60 * 24));
      return daysLeft <= 7 && daysLeft >= 0;
    }).length;

    return {
      key,
      name: PROJECT_NAMES[key],
      total,
      done,
      inProgress: development + testing,
      request,
      planning,
      hold,
      pct,
      urgentCount,
    };
  });

  // 전체 통계
  const totalTasks = tasks.length;
  const totalDone = tasks.filter((t) => t.status === "done").length;
  const totalInProgress = tasks.filter((t) => t.status === "development" || t.status === "testing").length;
  const totalPct = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;

  // 활성 프로젝트 (작업 1개 이상)
  const activeProjects = projectStats.filter((p) => p.total > 0).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="프로젝트 전체 현황"
        description="모든 프로젝트의 진행 상황을 한눈에 확인합니다."
        breadcrumb={["프로젝트", "전체 현황"]}
      />

      <KpiGrid>
        <KpiCard
          icon={<IconLayoutKanban size={18} className="text-on-surface-variant" />}
          label="활성 프로젝트"
          value={activeProjects.toString()}
          suffix={`/ ${PROJECT_KEYS.length}`}
        />
        <KpiCard
          icon={<IconListCheck size={18} className="text-on-surface-variant" />}
          label="전체 작업"
          value={totalTasks.toString()}
          suffix="건"
        />
        <KpiCard
          icon={<IconProgress size={18} className="text-on-surface-variant" />}
          label="진행 중"
          value={totalInProgress.toString()}
          suffix="건"
        />
        <KpiCard
          icon={<IconCircleCheck size={18} className="text-on-surface-variant" />}
          label="전체 달성률"
          value={`${totalPct}`}
          suffix="%"
        />
      </KpiGrid>

      {/* 전체 진행률 */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">전체 진행률</span>
          <span className="text-sm font-black text-on-surface tabular-nums">{totalPct}%</span>
        </div>
        <ProgressBar value={totalPct} size="md" color={getProgressColor(totalPct)} />
        <div className="flex items-center gap-6 mt-3 text-[10px] text-on-surface-variant">
          <span>완료 <strong className="text-on-surface">{totalDone}</strong></span>
          <span>진행 중 <strong className="text-on-surface">{totalInProgress}</strong></span>
          <span>대기 <strong className="text-on-surface">{totalTasks - totalDone - totalInProgress}</strong></span>
        </div>
      </Card>

      {/* 프로젝트 카드 그리드 */}
      <div>
        <h2 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-4">프로젝트별 현황</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projectStats.map((proj) => (
            <Link key={proj.key} href={`/projects/${proj.key}`}>
              <Card hover className="p-5 space-y-4 h-full">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-on-surface">{proj.name}</h3>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">{(PROJECT_OWNERS[proj.key] ?? []).join(", ")}</p>
                  </div>
                  {proj.urgentCount > 0 && (
                    <StatusBadge variant="error">{proj.urgentCount}건 마감 임박</StatusBadge>
                  )}
                </div>

                {proj.total === 0 ? (
                  <p className="text-xs text-on-surface-variant py-2">등록된 작업이 없습니다.</p>
                ) : (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-on-surface-variant">진행률</span>
                        <span className="font-black text-on-surface tabular-nums">{proj.pct}%</span>
                      </div>
                      <ProgressBar value={proj.pct} size="sm" color={getProgressColor(proj.pct)} />
                    </div>

                    <div className="flex items-center gap-4 text-[10px] text-on-surface-variant">
                      <span>전체 <strong className="text-on-surface">{proj.total}</strong></span>
                      <span>진행 <strong className="text-on-surface">{proj.inProgress}</strong></span>
                      <span>완료 <strong className="text-on-surface">{proj.done}</strong></span>
                      <span>요청 <strong className="text-on-surface">{proj.request}</strong></span>
                    </div>
                  </>
                )}
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* 최근 활동 */}
      {tasks.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-4">최근 업데이트된 작업</h2>
          <Card className="divide-y divide-outline-variant/10 overflow-hidden p-0">
            {tasks
              .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
              .slice(0, 10)
              .map((task) => (
                <div key={task.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-surface-container-high/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                        {PROJECT_NAMES[task.project] ?? task.project}
                      </span>
                      <span className="text-sm font-semibold text-on-surface truncate">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge variant={PRIORITY_CONFIG[task.priority].variant}>
                        {PRIORITY_CONFIG[task.priority].label}
                      </StatusBadge>
                      <StatusBadge
                        variant={
                          task.status === "done"
                            ? "success"
                            : task.status === "development"
                              ? "warning"
                              : task.status === "testing"
                                ? "info"
                                : task.status === "planning"
                                  ? "info"
                                  : task.status === "hold"
                                    ? "error"
                                    : "neutral"
                        }
                      >
                        {task.status === "request" ? "요청" : task.status === "planning" ? "기획" : task.status === "development" ? "개발" : task.status === "testing" ? "테스트" : task.status === "hold" ? "보류" : "완료"}
                      </StatusBadge>
                      {task.assignee && (
                        <span className="text-[10px] text-on-surface-variant">{task.assignee}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-on-surface-variant tabular-nums whitespace-nowrap">
                    {new Date(task.updated_at).toLocaleDateString("ko-KR")}
                  </span>
                </div>
              ))}
          </Card>
        </div>
      )}
    </div>
  );
}
