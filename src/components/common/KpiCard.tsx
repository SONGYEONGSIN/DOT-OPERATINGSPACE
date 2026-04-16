import { cn } from "@/lib/cn";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
} from "@tabler/icons-react";

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  suffix?: string;
  change?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  alert?: boolean;
  /** true이면 change를 hover 시에만 툴팁으로 표시 */
  hoverChange?: boolean;
}

const trendIcons = {
  up: IconTrendingUp,
  down: IconTrendingDown,
  neutral: IconMinus,
} as const;

const trendColors = {
  up: "text-[var(--color-success)]",
  down: "text-[var(--color-danger)]",
  neutral: "text-[var(--color-text-muted)]",
} as const;

export default function KpiCard({
  icon,
  label,
  value,
  suffix,
  change,
  trend,
  alert,
  hoverChange,
}: KpiCardProps) {
  return (
    <div className="group relative bg-[var(--color-surface)] rounded-[20px] shadow-neu-soft p-5 transition-shadow duration-[var(--duration-hover)] ease-[var(--ease-neu)] hover:shadow-neu-strong">
      {alert && (
        <span className="absolute top-4 right-4 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-danger)] opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-danger)]" />
        </span>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-medium text-[var(--color-text-faint)] uppercase tracking-wider">
            {label}
          </span>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="font-[var(--font-display)] text-[32px] font-bold text-[var(--color-text)] leading-[1.1] tracking-tight tabular-nums">
            {isNaN(Number(value)) ? value : Number(value).toLocaleString()}
          </span>
          {suffix && (
            <span className="text-sm font-medium text-[var(--color-text-muted)]">
              {suffix}
            </span>
          )}
        </div>

        {change &&
          !hoverChange &&
          (trend ? (
            (() => {
              const TrendIcon = trendIcons[trend];
              return (
                <div
                  className={cn("flex items-center gap-1", trendColors[trend])}
                >
                  <TrendIcon size={14} />
                  <span className="text-xs font-bold">{change}</span>
                </div>
              );
            })()
          ) : (
            <div className="text-xs font-medium text-[var(--color-text-muted)]">
              {change}
            </div>
          ))}
      </div>

      {change && hoverChange && (
        <div className="absolute left-0 right-0 top-full mt-1 z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-[var(--duration-hover)] ease-[var(--ease-neu)]">
          <div className="mx-3 px-4 py-3 rounded-[14px] bg-[var(--color-surface)] shadow-neu-strong text-xs font-medium text-[var(--color-text-muted)]">
            {change}
          </div>
        </div>
      )}
    </div>
  );
}
