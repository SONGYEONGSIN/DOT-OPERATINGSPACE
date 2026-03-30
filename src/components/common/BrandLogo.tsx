import { cn } from "@/lib/cn";

export default function BrandLogo({
  size = "default",
  className,
}: {
  size?: "default" | "small";
  className?: string;
}) {
  const gridSize = size === "small" ? "w-6 h-6" : "w-7 h-7";
  const textSize = size === "small" ? "text-xl" : "text-2xl";
  const subSize = size === "small" ? "text-[7px]" : "text-[8px]";

  return (
    <div className={cn("flex items-center gap-3 group cursor-pointer", className)}>
      <div className="relative flex items-center justify-center">
        <div className={cn("cyber-logo-grid brand-logo-glow", gridSize)}>
          <div className="cyber-logo-part" />
          <div className="cyber-logo-part" />
          <div className="cyber-logo-part" />
          <div className="cyber-logo-part" />
        </div>
        <span className="absolute -inset-1 bg-primary/20 rounded blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="flex flex-col leading-[0.8] ml-1">
        <span
          className={cn(
            "tracking-tighter font-black text-on-surface",
            textSize,
          )}
        >
          DOT<span className="text-primary">.</span>
        </span>
        <span
          className={cn(
            "font-bold text-on-surface-variant uppercase tracking-[0.25em]",
            subSize,
          )}
        >
          OperatingSpace
        </span>
      </div>
    </div>
  );
}
