import { cn } from "@/lib/cn";

interface StatusBadgeProps {
  variant: "success" | "warning" | "error" | "info" | "neutral";
  children: React.ReactNode;
  dot?: boolean;
}

const variantStyles = {
  success: "bg-primary/10 text-primary",
  warning: "bg-tertiary/10 text-tertiary",
  error: "bg-error/10 text-error",
  info: "bg-secondary/10 text-secondary",
  neutral: "bg-surface-container-high text-on-surface-variant",
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
              variant === "success" && "bg-primary",
              variant === "warning" && "bg-tertiary",
              variant === "error" && "bg-error",
              variant === "info" && "bg-secondary",
              variant === "neutral" && "bg-on-surface-variant",
            )}
          />
          <span
            className={cn(
              "relative inline-flex h-1.5 w-1.5 rounded-full",
              variant === "success" && "bg-primary",
              variant === "warning" && "bg-tertiary",
              variant === "error" && "bg-error",
              variant === "info" && "bg-secondary",
              variant === "neutral" && "bg-on-surface-variant",
            )}
          />
        </span>
      )}
      {children}
    </span>
  );
}
