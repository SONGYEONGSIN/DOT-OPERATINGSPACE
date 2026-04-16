import { cn } from "@/lib/cn";

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: "sm" | "md";
  color?: "primary" | "warning" | "error";
}

const colorStyles = {
  primary: "bg-primary",
  warning: "bg-tertiary",
  error: "bg-error",
} as const;

const sizeStyles = {
  sm: "h-1.5",
  md: "h-2.5",
} as const;

export default function ProgressBar({
  value,
  max = 100,
  size = "sm",
  color = "primary",
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      className={cn(
        "w-full bg-[var(--color-surface)] rounded-full overflow-hidden",
        sizeStyles[size],
      )}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-300",
          colorStyles[color],
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
