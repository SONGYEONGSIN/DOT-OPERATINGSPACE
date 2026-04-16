import { cn } from "@/lib/cn";

interface StatusBadgeProps {
  variant: "success" | "warning" | "error" | "info" | "neutral";
  children: React.ReactNode;
  dot?: boolean;
}

const variantStyles = {
  success: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  warning: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
  error: "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
  info: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
  neutral: "bg-[var(--color-surface)]/60 text-[var(--color-text-muted)]",
} as const;

const dotColors = {
  success: "bg-[var(--color-success)]",
  warning: "bg-[var(--color-warning)]",
  error: "bg-[var(--color-danger)]",
  info: "bg-[var(--color-primary)]",
  neutral: "bg-[var(--color-text-faint)]",
} as const;

export default function StatusBadge({
  variant,
  children,
  dot,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        variantStyles[variant],
      )}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              dotColors[variant],
            )}
          />
          <span
            className={cn(
              "relative inline-flex h-1.5 w-1.5 rounded-full",
              dotColors[variant],
            )}
          />
        </span>
      )}
      {children}
    </span>
  );
}
