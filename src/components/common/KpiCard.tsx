import { cn } from "@/lib/cn";
import { IconTrendingUp, IconTrendingDown, IconMinus } from "@tabler/icons-react";

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
  up: "text-primary",
  down: "text-error",
  neutral: "text-on-surface-variant",
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
    <div className="group relative bg-surface-container rounded-xl border border-outline-variant/15 p-6">
      {alert && (
        <span className="absolute top-4 right-4 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-error" />
        </span>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
            {label}
          </span>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl font-black text-on-surface tracking-tight tabular-nums">
            {isNaN(Number(value)) ? value : Number(value).toLocaleString()}
          </span>
          {suffix && (
            <span className="text-sm font-medium text-on-surface-variant">
              {suffix}
            </span>
          )}
        </div>

        {change && !hoverChange && (
          trend ? (() => {
            const TrendIcon = trendIcons[trend];
            return (
              <div className={cn("flex items-center gap-1", trendColors[trend])}>
                <TrendIcon size={14} />
                <span className="text-xs font-bold">{change}</span>
              </div>
            );
          })() : (
            <div className="text-xs font-medium text-on-surface-variant">{change}</div>
          )
        )}
      </div>

      {change && hoverChange && (
        <div className="absolute left-0 right-0 top-full mt-1 z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          <div className="mx-3 px-4 py-3 rounded-lg bg-surface-container-high border border-outline-variant/15 shadow-elevated text-xs font-medium text-on-surface-variant">
            {change}
          </div>
        </div>
      )}
    </div>
  );
}
