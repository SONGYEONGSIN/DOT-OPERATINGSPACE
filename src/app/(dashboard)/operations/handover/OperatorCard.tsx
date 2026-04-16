import { IconUser } from "@tabler/icons-react";
import { StatusBadge, Card } from "@/components/common";
import { type Service, getStatusConfig, formatDate } from "./types";

interface OperatorCardProps {
  operator: string;
  services: Service[];
}

export default function OperatorCard({ operator, services }: OperatorCardProps) {
  const active = services.filter((s) => s.status === "active").length;
  const completed = services.filter((s) => s.status === "completed").length;
  const pending = services.filter((s) => s.status === "pending").length;
  const other = services.length - active - completed - pending;
  const total = services.length;

  const segments = [
    { label: "진행중", color: "bg-primary", count: active },
    { label: "완료", color: "bg-secondary", count: completed },
    { label: "예정", color: "bg-tertiary", count: pending },
    ...(other > 0
      ? [{ label: "기타", color: "bg-outline-variant/30", count: other }]
      : []),
  ];

  return (
    <Card hover className="p-5">
      {/* 운영자 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
            <IconUser size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)]">{operator}</h3>
            <p className="text-[10px] text-[var(--color-text-muted)]">
              담당 {total}건
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge variant="success">{active} 진행</StatusBadge>
          <StatusBadge variant="info">{completed} 완료</StatusBadge>
          <StatusBadge variant="warning">{pending} 예정</StatusBadge>
        </div>
      </div>

      {/* 상태 비율 바 */}
      <div className="mb-4">
        <div className="flex gap-0.5 h-2 rounded-full overflow-hidden bg-[var(--color-surface)]">
          {active > 0 && (
            <div
              className="bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(active / total) * 100}%` }}
            />
          )}
          {completed > 0 && (
            <div
              className="bg-secondary rounded-full transition-all duration-300"
              style={{ width: `${(completed / total) * 100}%` }}
            />
          )}
          {pending > 0 && (
            <div
              className="bg-tertiary rounded-full transition-all duration-300"
              style={{ width: `${(pending / total) * 100}%` }}
            />
          )}
          {other > 0 && (
            <div
              className="bg-outline-variant/30 rounded-full transition-all duration-300"
              style={{ width: `${(other / total) * 100}%` }}
            />
          )}
        </div>
        <div className="flex items-center gap-4 mt-1.5">
          {segments.map((item) => (
            <div key={item.label} className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
              <span className="text-[10px] text-[var(--color-text-muted)] font-medium">
                {item.label} {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 담당 서비스 목록 */}
      <div className="space-y-1.5">
        {services.slice(0, 5).map((s) => {
          const sc = getStatusConfig(s.status);
          return (
            <div
              key={s.id}
              className="flex items-center justify-between px-3 py-2 rounded-[14px] bg-[var(--color-surface)]/50 hover:bg-[var(--color-surface)] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-semibold text-[var(--color-text)] truncate">
                  {s.university_name ?? "-"}
                </span>
                <span className="text-xs text-[var(--color-text-muted)] truncate">
                  {(s.service_name ?? "-").replace(/\d{4}학년도\s*|\d{4}-(?=\d학기)/g, "")}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] text-[var(--color-text-muted)] tabular-nums">
                  {s.writing_start && s.writing_end
                    ? `${formatDate(s.writing_start)} ~ ${formatDate(s.writing_end)}`
                    : "-"}
                </span>
                <StatusBadge variant={sc.variant}>{sc.label}</StatusBadge>
              </div>
            </div>
          );
        })}
        {services.length > 5 && (
          <p className="text-[10px] text-[var(--color-text-muted)] text-center pt-1">
            외 {services.length - 5}건
          </p>
        )}
      </div>
    </Card>
  );
}
