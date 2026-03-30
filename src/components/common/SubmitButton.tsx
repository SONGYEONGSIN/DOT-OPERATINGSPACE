"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/cn";

interface SubmitButtonProps {
  children: React.ReactNode;
  loadingText: string;
  className?: string;
}

export function SubmitButton({
  children,
  loadingText,
  className,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "w-full py-4 bg-primary text-on-primary font-black rounded-lg",
        "active:scale-95 transition-all glow-primary hover:brightness-110",
        pending && "opacity-60 cursor-not-allowed",
        className,
      )}
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <span className="material-symbols-outlined animate-spin text-lg">
            progress_activity
          </span>
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
