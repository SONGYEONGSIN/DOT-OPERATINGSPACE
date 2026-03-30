import { cn } from "@/lib/cn";

interface KpiCardProps {
  icon: string;
  label: string;
  value: string;
  suffix?: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  alert?: boolean;
}

const trendConfig = {
  up: { icon: "trending_up", className: "text-primary" },
  down: { icon: "trending_down", className: "text-error" },
  neutral: { icon: "trending_flat", className: "text-on-surface-variant" },
} as const;

export default function KpiCard({
  icon,
  label,
  value,
  suffix,
  change,
  trend,
  alert,
}: KpiCardProps) {
  return (
    <div className="relative bg-surface-container rounded-xl border border-outline-variant/15 p-6">
      {alert && (
        <span className="absolute top-4 right-4 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-error" />
        </span>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant text-lg">
            {icon}
          </span>
          <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
            {label}
          </span>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl font-black text-on-surface tracking-tight">
            {value}
          </span>
          {suffix && (
            <span className="text-sm font-medium text-on-surface-variant">
              {suffix}
            </span>
          )}
        </div>

        {change && trend && (
          <div className={cn("flex items-center gap-1", trendConfig[trend].className)}>
            <span className="material-symbols-outlined text-sm">
              {trendConfig[trend].icon}
            </span>
            <span className="text-xs font-bold">{change}</span>
          </div>
        )}
      </div>
    </div>
  );
}
