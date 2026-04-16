import { cn } from "@/lib/cn";

export default function BrandLogo({
  size = "default",
  className,
  showSubtitle = false,
}: {
  size?: "default" | "small";
  className?: string;
  showSubtitle?: boolean;
}) {
  const gridSize = size === "small" ? "w-6 h-6" : "w-7 h-7";
  const textSize = size === "small" ? "text-base" : "text-lg";
  const subSize = size === "small" ? "text-[7px]" : "text-[8px]";

  return (
    <div className={cn("flex flex-col items-center group cursor-pointer", className)}>
      <div className="relative flex items-center justify-center mb-1">
        <div className={cn("cyber-logo-grid brand-logo-glow", gridSize)}>
          <div className="cyber-logo-part" />
          <div className="cyber-logo-part" />
          <div className="cyber-logo-part" />
          <div className="cyber-logo-part" />
        </div>
        <span className="absolute -inset-1 bg-primary/20 rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "tracking-tight font-black text-[var(--color-text)] leading-none",
            textSize,
          )}
        >
          Orchestrator System
        </span>
        {showSubtitle && (
          <span
            className={cn(
              "font-medium text-[var(--color-text-muted)] tracking-[0.2em] leading-none mt-[2px]",
              subSize,
            )}
          >
            Tactical Intelligence
          </span>
        )}
      </div>
    </div>
  );
}
