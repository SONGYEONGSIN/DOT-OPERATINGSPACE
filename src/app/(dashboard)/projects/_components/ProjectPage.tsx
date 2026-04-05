"use client";

import { useState } from "react";
import { PageHeader, KpiGrid, KpiCard, Card, StatusBadge, ProgressBar } from "@/components/common";
import { IconListCheck, IconProgress, IconCircleCheck, IconClock, IconPlus, IconLayoutKanban, IconSend, IconHistory } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import KanbanBoard from "./KanbanBoard";
import AddTaskModal from "./AddTaskModal";
import EditTaskModal from "./EditTaskModal";
import PipelineView from "./PipelineView";
import RequestForm from "./RequestForm";
import ActivityLog from "./ActivityLog";
import type { ProjectTask, ProjectLog } from "./types";
import { PROJECT_NAMES, YEARS, PROJECT_OWNERS } from "./types";

interface ProjectPageProps {
  project: string;
  tasks: ProjectTask[];
  logs: ProjectLog[];
  profiles: { name: string }[];
  currentYear: number;
}

type Tab = "board" | "request" | "log";

function getProgressColor(pct: number): "primary" | "warning" | "error" {
  if (pct >= 60) return "primary";
  if (pct >= 30) return "warning";
  return "error";
}

export default function ProjectPage({ project, tasks, logs, profiles, currentYear }: ProjectPageProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("board");
  const [year, setYear] = useState(currentYear);

  // 연도 필터
  const yearTasks = tasks.filter((t) => t.year === year);

  const total = yearTasks.length;
  const doneCount = yearTasks.filter((t) => t.status === "done").length;
  const activeCount = yearTasks.filter((t) => t.status === "development" || t.status === "testing" || t.status === "planning").length;
  const requestCount = yearTasks.filter((t) => t.status === "request").length;
  const holdCount = yearTasks.filter((t) => t.status === "hold").length;
  const progressPct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  const projectName = PROJECT_NAMES[project] ?? project;
  const owners = PROJECT_OWNERS[project] ?? [];

  const tabs: { key: Tab; label: string; icon: typeof IconLayoutKanban }[] = [
    { key: "board", label: "작업 보드", icon: IconLayoutKanban },
    { key: "request", label: "요청하기", icon: IconSend },
    { key: "log", label: "활동 로그", icon: IconHistory },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={projectName}
        description={`${projectName} 프로젝트의 작업 현황을 관리합니다. 담당: ${owners.join(", ")}`}
        breadcrumb={["프로젝트", projectName]}
        actions={
          <div className="flex items-center gap-3">
            {/* 연도 선택 */}
            <div className="flex items-center gap-1 bg-surface-container-high rounded-xl p-1">
              {YEARS.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYear(y)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                    year === y
                      ? "bg-primary text-on-primary"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container",
                  )}
                >
                  {y}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-on-primary font-bold text-sm hover:bg-primary-dim transition-colors"
            >
              <IconPlus size={16} />
              작업 추가
            </button>
          </div>
        }
      />

      {/* KPI */}
      <KpiGrid>
        <KpiCard
          icon={<IconListCheck size={18} className="text-on-surface-variant" />}
          label="전체 작업"
          value={total.toString()}
          suffix="건"
          change={requestCount > 0 ? `신규 요청 ${requestCount}건` : undefined}
        />
        <KpiCard
          icon={<IconProgress size={18} className="text-on-surface-variant" />}
          label="진행 중"
          value={activeCount.toString()}
          suffix="건"
        />
        <KpiCard
          icon={<IconCircleCheck size={18} className="text-on-surface-variant" />}
          label="완료"
          value={doneCount.toString()}
          suffix="건"
        />
        <KpiCard
          icon={<IconClock size={18} className="text-on-surface-variant" />}
          label="달성률"
          value={`${progressPct}`}
          suffix="%"
          change={holdCount > 0 ? `보류 ${holdCount}건` : undefined}
        />
      </KpiGrid>

      {/* 파이프라인 */}
      <PipelineView tasks={yearTasks} />

      {/* 진행률 */}
      <Card className="px-5 py-3">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest whitespace-nowrap">진행률</span>
          <div className="flex-1">
            <ProgressBar value={progressPct} size="sm" color={getProgressColor(progressPct)} />
          </div>
          <span className="text-xs font-black text-on-surface tabular-nums whitespace-nowrap">{progressPct}%</span>
        </div>
      </Card>

      {/* 탭 */}
      <div className="flex items-center gap-1 bg-surface-container-high rounded-xl p-1 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all",
                activeTab === tab.key
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container",
              )}
            >
              <Icon size={14} />
              {tab.label}
              {tab.key === "request" && requestCount > 0 && (
                <span className="bg-error text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {requestCount}
                </span>
              )}
              {tab.key === "log" && logs.length > 0 && (
                <span className="text-[9px] text-on-surface-variant/60">{logs.length}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* 탭 컨텐츠 */}
      {activeTab === "board" && (
        <KanbanBoard
          tasks={yearTasks}
          project={project}
          onAddTask={() => setShowAddModal(true)}
          onEditTask={(task) => setEditingTask(task)}
        />
      )}

      {activeTab === "request" && (
        <RequestForm project={project} year={year} profiles={profiles} />
      )}

      {activeTab === "log" && (
        <ActivityLog logs={logs} />
      )}

      {/* 작업 추가 모달 */}
      <AddTaskModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        project={project}
        profiles={profiles}
        year={year}
      />

      {/* 작업 수정 모달 */}
      {editingTask && (
        <EditTaskModal
          key={editingTask.id}
          open={!!editingTask}
          onClose={() => setEditingTask(null)}
          task={editingTask}
          profiles={profiles}
        />
      )}
    </div>
  );
}
