import { cn } from "@/lib/cn";
import { IconCheck } from "@tabler/icons-react";

interface Step {
  label: string;
  status: "completed" | "active" | "pending";
}

interface StepTimelineProps {
  steps: Step[];
}

export default function StepTimeline({ steps }: StepTimelineProps) {
  return (
    <div className="flex items-center w-full">
      {steps.map((step, index) => (
        <div
          key={index}
          className={cn(
            "flex items-center",
            index < steps.length - 1 && "flex-1",
          )}
        >
          {/* Circle */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="relative">
              <div
                className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all",
                  step.status === "completed" &&
                    "bg-primary text-on-primary",
                  step.status === "active" &&
                    "bg-primary text-on-primary ring-4 ring-primary/20",
                  step.status === "pending" &&
                    "bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-black/[0.04]/30",
                )}
              >
                {step.status === "completed" ? (
                  <IconCheck size={14} />
                ) : (
                  index + 1
                )}
              </div>
              {step.status === "active" && (
                <span className="absolute inset-0 rounded-full animate-ping bg-primary/30" />
              )}
            </div>
            <span
              className={cn(
                "text-[10px] font-bold tracking-wide whitespace-nowrap",
                step.status === "completed" && "text-primary",
                step.status === "active" && "text-primary",
                step.status === "pending" && "text-[var(--color-text-muted)]",
              )}
            >
              {step.label}
            </span>
          </div>

          {/* Connecting line */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                "flex-1 h-0.5 mx-2 rounded-full transition-all",
                step.status === "completed"
                  ? "bg-primary"
                  : "bg-outline-variant/30",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
