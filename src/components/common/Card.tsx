import { cn } from "@/lib/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "sunken";
  hover?: boolean;
}

const variantStyles = {
  default: "bg-[var(--color-surface)] rounded-[20px] shadow-neu-soft",
  elevated: "bg-[var(--color-surface)] rounded-[20px] shadow-neu-strong",
  sunken: "bg-[var(--color-surface)] rounded-[20px] shadow-neu-inset-soft",
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
        hover &&
          "hover:shadow-neu-strong transition-all duration-[var(--duration-hover)] ease-[var(--ease-neu)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
