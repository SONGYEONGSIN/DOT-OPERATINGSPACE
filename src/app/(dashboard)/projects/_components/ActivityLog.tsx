"use client";

import { IconArrowRight, IconPlus, IconTrash, IconUserCheck, IconEdit } from "@tabler/icons-react";
import { Card, UserAvatar } from "@/components/common";
import type { ProjectLog } from "./types";

interface ActivityLogProps {
  logs: ProjectLog[];
}

const actionConfig: Record<string, { icon: typeof IconPlus; color: string; label: string }> = {
  created: { icon: IconPlus, color: "text-primary", label: "생성" },
  requested: { icon: IconPlus, color: "text-tertiary", label: "요청" },
  status_changed: { icon: IconArrowRight, color: "text-info", label: "상태 변경" },
  assigned: { icon: IconUserCheck, color: "text-primary", label: "담당자 변경" },
  deleted: { icon: IconTrash, color: "text-error", label: "삭제" },
  edited: { icon: IconEdit, color: "text-[var(--color-text-muted)]", label: "수정" },
};

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

export default function ActivityLog({ logs }: ActivityLogProps) {
  if (logs.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-sm text-[var(--color-text-muted)]">활동 기록이 없습니다.</p>
        <p className="text-xs text-[var(--color-text-muted)]/60 mt-1">작업을 생성하거나 상태를 변경하면 기록됩니다.</p>
      </Card>
    );
  }

  return (
    <Card className="divide-y divide-outline-variant/10 overflow-hidden p-0">
      {logs.map((log) => {
        const config = actionConfig[log.action] ?? actionConfig.edited;
        const Icon = config.icon;

        return (
          <div key={log.id} className="px-5 py-3.5 flex items-start gap-3 hover:bg-[var(--color-surface)]/50 transition-colors">
            <div className={`mt-0.5 shrink-0 ${config.color}`}>
              <Icon size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <UserAvatar name={log.actor} size="sm" className="!w-5 !h-5" />
                <span className="text-xs font-bold text-[var(--color-text)]">{log.actor}</span>
                <span className={`text-[10px] font-medium ${config.color}`}>{config.label}</span>
              </div>
              {log.detail && (
                <p className="text-xs text-[var(--color-text-muted)] mt-1">{log.detail}</p>
              )}
            </div>
            <span className="text-[10px] text-[var(--color-text-muted)] whitespace-nowrap shrink-0 mt-0.5">
              {formatTime(log.created_at)}
            </span>
          </div>
        );
      })}
    </Card>
  );
}
