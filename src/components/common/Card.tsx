import { cn } from "@/lib/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "sunken";
  hover?: boolean;
}

const variantStyles = {
  default: "bg-surface-container rounded-xl border border-outline-variant/15",
  elevated:
    "bg-surface-container rounded-xl border border-outline-variant/15 shadow-elevated",
  sunken: "bg-surface-container-lowest rounded-xl",
} as const;

export default function Card({
  children,
  className,
  variant = "default",
  hover,
}: CardProps) {
  return (
    <div
      className={cn(
        variantStyles[variant],
        hover && "hover:border-primary/30 transition-all",
        className,
      )}
    >
      {children}
    </div>
  );
}
