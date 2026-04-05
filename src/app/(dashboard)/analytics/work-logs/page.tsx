import { createClient } from "@/lib/supabase/server";
import {
  PageHeader,
  KpiGrid,
  KpiCard,
  StatusBadge,
  Card,
  UserAvatar,
} from "@/components/common";
import { IconHistory, IconCircleCheck, IconListCheck, IconUsers } from "@tabler/icons-react";
import { PROJECT_NAMES } from "../../projects/_components/types";

interface ProjectLog {
  id: number;
  project: string;
  task_id: number | null;
  action: string;
  actor: string;
  detail: string | null;
  created_at: string;
}

const actionConfig: Record<string, { label: string; variant: "success" | "warning" | "info" | "error" | "neutral" }> = {
  created: { label: "생성", variant: "success" },
  requested: { label: "요청", variant: "warning" },
  status_changed: { label: "상태변경", variant: "info" },
  assigned: { label: "담당변경", variant: "info" },
  deleted: { label: "삭제", variant: "error" },
  edited: { label: "수정", variant: "neutral" },
};

export default async function WorkLogsPage() {
  const supabase = createClient();

  const [{ data: logs }, { count: workLogCount }] = await Promise.all([
    supabase
      .from("project_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("service_work_logs")
      .select("service_id", { count: "exact", head: true }),
  ]);

  const allLogs = (logs ?? []) as ProjectLog[];

  const totalLogs = allLogs.length;
  const uniqueActors = new Set(allLogs.map((l) => l.actor)).size;
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayLogs = allLogs.filter((l) => l.created_at.startsWith(todayStr)).length;

  // 프로젝트별 활동 수
  const projectCounts = new Map<string, number>();
  for (const log of allLogs) {
    projectCounts.set(log.project, (projectCounts.get(log.project) ?? 0) + 1);
  }
  const topProjects = Array.from(projectCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // 날짜별 그룹핑
  const dateGroups = new Map<string, ProjectLog[]>();
  for (const log of allLogs) {
    const date = log.created_at.slice(0, 10);
    if (!dateGroups.has(date)) dateGroups.set(date, []);
    dateGroups.get(date)!.push(log);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="업무 로그"
        description="프로젝트 활동 및 서비스 작업이력을 통합 조회합니다."
        breadcrumb={["분석 & 보고", "업무로그"]}
      />

      <KpiGrid>
        <KpiCard
          icon={<IconHistory size={18} className="text-on-surface-variant" />}
          label="프로젝트 활동"
          value={totalLogs.toString()}
          suffix="건"
          change={`오늘 ${todayLogs}건`}
        />
        <KpiCard
          icon={<IconCircleCheck size={18} className="text-on-surface-variant" />}
          label="서비스 작업이력"
          value={(workLogCount ?? 0).toString()}
          suffix="건"
        />
        <KpiCard
          icon={<IconUsers size={18} className="text-on-surface-variant" />}
          label="활동 인원"
          value={uniqueActors.toString()}
          suffix="명"
        />
        <KpiCard
          icon={<IconListCheck size={18} className="text-on-surface-variant" />}
          label="활성 프로젝트"
          value={projectCounts.size.toString()}
          suffix="개"
        />
      </KpiGrid>

      {topProjects.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-4">프로젝트별 활동</h3>
          <div className="flex items-center gap-4 flex-wrap">
            {topProjects.map(([proj, count]) => (
              <div key={proj} className="flex items-center gap-2">
                <span className="text-xs font-bold text-on-surface">{PROJECT_NAMES[proj] ?? proj}</span>
                <span className="text-xs text-on-surface-variant tabular-nums">{count}건</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 타임라인 */}
      <div className="relative">
        <div className="absolute left-[23px] top-0 bottom-0 w-px bg-outline-variant/20" />
        <div className="space-y-1">
          {Array.from(dateGroups.entries()).map(([date, dateLogs]) => (
            <div key={date}>
              <div className="flex items-center gap-3 py-3 ml-[14px]">
                <div className="w-[18px] h-[18px] rounded-full bg-primary flex items-center justify-center z-10">
                  <IconHistory size={10} className="text-on-primary" />
                </div>
                <span className="text-xs font-bold text-primary tracking-wider uppercase">{date}</span>
                <span className="text-[10px] text-on-surface-variant">{dateLogs.length}건</span>
              </div>

              {dateLogs.map((log) => {
                const config = actionConfig[log.action] ?? actionConfig.edited;
                return (
                  <div key={log.id} className="flex gap-4 group">
                    <div className="relative z-10 flex-shrink-0">
                      <UserAvatar name={log.actor} size="sm" className="!w-[47px] !h-[47px]" />
                    </div>
                    <Card className="flex-1 p-4 group-hover:border-primary/20 transition-colors mb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-on-surface">{log.actor}</span>
                            <StatusBadge variant={config.variant}>{config.label}</StatusBadge>
                          </div>
                          <p className="text-sm text-on-surface/90">{log.detail ?? "-"}</p>
                        </div>
                        <StatusBadge variant="neutral">{PROJECT_NAMES[log.project] ?? log.project}</StatusBadge>
                      </div>
                      <div className="flex items-center gap-1 mt-3 text-on-surface-variant">
                        <IconHistory size={11} />
                        <span className="text-[11px]">
                          {new Date(log.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          ))}

          {allLogs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
              <IconHistory size={40} className="opacity-30 mb-2" />
              <p className="text-sm font-medium">활동 기록이 없습니다.</p>
              <p className="text-xs mt-1">프로젝트에서 작업을 수행하면 자동으로 기록됩니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
