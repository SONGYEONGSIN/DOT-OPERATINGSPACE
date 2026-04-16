"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconCheck } from "@tabler/icons-react";
import { toggleOnboardingItem } from "./actions";

interface OnboardingChecklistProps {
  items: { key: string; label: string; done: boolean; hint?: string; completedAt?: string }[];
}

export default function OnboardingChecklist({ items }: OnboardingChecklistProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggle(key: string, label: string, currentDone: boolean) {
    startTransition(async () => {
      await toggleOnboardingItem(key, label, !currentDone);
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          disabled={isPending}
          onClick={() => handleToggle(item.key, item.label, item.done)}
          className="w-full flex items-start gap-2.5 group text-left"
        >
          <div
            className={`w-5 h-5 mt-0.5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${
              item.done
                ? "bg-primary border-primary"
                : "border-black/[0.04] bg-transparent group-hover:border-primary/50"
            }`}
          >
            {item.done && (
              <IconCheck size={14} className="text-on-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`text-sm ${
                  item.done
                    ? "text-[var(--color-text-muted)] line-through"
                    : "text-[var(--color-text)]"
                }`}
              >
                {item.label}
              </span>
              {item.done && item.completedAt && (
                <span className="text-[10px] text-[var(--color-text-muted)] tabular-nums">
                  {new Date(item.completedAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                </span>
              )}
            </div>
            {item.hint && !item.done && (
              <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{item.hint}</p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
