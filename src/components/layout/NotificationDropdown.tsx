"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import {
  IconBell,
  IconArrowsExchange,
  IconClock,
  IconCalendarEvent,
  IconCheck,
  IconX,
} from "@tabler/icons-react";

interface Notification {
  id: string;
  type: "handover" | "deadline" | "system";
  title: string;
  description: string;
  time: string;
  read: boolean;
}

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  return `${day}일 전`;
}

function stripYear(name: string) {
  return name.replace(/\d{4}학년도\s*|\d{4}-(?=\d학기)/g, "");
}

const typeConfig = {
  handover: { icon: IconArrowsExchange, color: "text-primary", bg: "bg-primary/10" },
  deadline: { icon: IconCalendarEvent, color: "text-tertiary", bg: "bg-tertiary/10" },
  system: { icon: IconClock, color: "text-[var(--color-text-muted)]", bg: "bg-[var(--color-surface)]" },
};

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // 열릴 때 데이터 로드
  useEffect(() => {
    if (!open) return;

    async function load() {
      setLoading(true);
      const supabase = createClient();
      const items: Notification[] = [];

      // 인수인계 이력 (최근 10건)
      const { data: logs } = await supabase
        .from("handover_logs")
        .select("id, from_person, to_person, executed_at, service_id")
        .order("executed_at", { ascending: false })
        .limit(10);

      if (logs) {
        // 서비스 정보 조회
        const svcIds = [...new Set(logs.map((l: any) => l.service_id))];
        const { data: svcs } = await supabase
          .from("services")
          .select("id, university_name, service_name")
          .in("id", svcIds);

        const svcMap = new Map((svcs ?? []).map((s: any) => [s.id, s]));

        for (const log of logs) {
          const svc = svcMap.get(log.service_id);
          items.push({
            id: `h-${log.id}`,
            type: "handover",
            title: `${svc?.university_name ?? "서비스"} 인수인계`,
            description: `${log.from_person ?? "미배정"} → ${log.to_person} (${stripYear(svc?.service_name ?? "")})`,
            time: log.executed_at,
            read: readIds.has(`h-${log.id}`),
          });
        }
      }

      // 다가오는 마감 (7일 이내)
      const now = new Date();
      const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const { data: deadlines } = await supabase
        .from("services")
        .select("id, university_name, service_name, writing_end")
        .not("writing_end", "is", null)
        .gte("writing_end", now.toISOString())
        .lte("writing_end", weekLater.toISOString())
        .order("writing_end", { ascending: true })
        .limit(5);

      if (deadlines) {
        for (const d of deadlines) {
          const dDay = Math.ceil(
            (new Date(d.writing_end!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
          );
          items.push({
            id: `d-${d.id}`,
            type: "deadline",
            title: `${d.university_name} 작성마감 D-${dDay}`,
            description: stripYear(d.service_name ?? ""),
            time: d.writing_end!,
            read: readIds.has(`d-${d.id}`),
          });
        }
      }

      setNotifications(items);
      setLoading(false);
    }

    load();
  }, [open, readIds]);

  function markAllRead() {
    setReadIds(new Set(notifications.map((n) => n.id)));
  }

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-[var(--color-text-muted)] hover:bg-surface-bright hover:text-primary transition-all duration-200 rounded-[14px] active:scale-95"
      >
        <IconBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-error text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[380px] bg-[var(--color-surface)] rounded-[20px] border border-black/[0.04]/15 shadow-neu-strong overflow-hidden z-50">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.04]/10">
            <h3 className="text-sm font-bold text-[var(--color-text)]">알림</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] font-bold text-primary hover:text-primary/70 transition-colors"
                >
                  모두 읽음
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors rounded"
              >
                <IconX size={16} />
              </button>
            </div>
          </div>

          {/* 알림 목록 */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-[var(--color-text-muted)]">
                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((n) => {
                const cfg = typeConfig[n.type];
                const Icon = cfg.icon;
                const isRead = readIds.has(n.id);

                return (
                  <div
                    key={n.id}
                    onClick={() => setReadIds((prev) => new Set(prev).add(n.id))}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 border-b border-black/[0.04]/5 cursor-pointer transition-colors hover:bg-[var(--color-surface)]/50",
                      !isRead && "bg-primary/[0.03]",
                    )}
                  >
                    <div className={cn("shrink-0 w-8 h-8 rounded-[14px] flex items-center justify-center mt-0.5", cfg.bg)}>
                      <Icon size={16} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn("text-xs font-semibold truncate", isRead ? "text-[var(--color-text-muted)]" : "text-[var(--color-text)]")}>
                          {n.title}
                        </p>
                        {!isRead && <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary" />}
                      </div>
                      <p className="text-[11px] text-[var(--color-text-muted)] truncate mt-0.5">{n.description}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]/60 mt-1">{formatRelative(n.time)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-[var(--color-text-muted)]">
                <IconCheck size={32} className="opacity-30 mb-2" />
                <p className="text-xs font-medium">새로운 알림이 없습니다</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
