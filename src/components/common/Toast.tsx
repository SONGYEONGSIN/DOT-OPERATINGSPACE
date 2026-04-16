"use client";

import React, { useEffect, useCallback } from "react";
import { cn } from "@/lib/cn";

type ToastVariant = "info" | "success" | "warning" | "danger";

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  open: boolean;
  onClose: () => void;
  autoDismiss?: number;
}

const VARIANT_CONFIG: Record<
  ToastVariant,
  { barColor: string; role: "status" | "alert"; defaultDuration: number | null }
> = {
  info: {
    barColor: "bg-[var(--color-primary)]",
    role: "status",
    defaultDuration: 3000,
  },
  success: {
    barColor: "bg-[var(--color-success)]",
    role: "status",
    defaultDuration: 3000,
  },
  warning: {
    barColor: "bg-[var(--color-warning)]",
    role: "alert",
    defaultDuration: 5000,
  },
  danger: {
    barColor: "bg-[var(--color-danger)]",
    role: "alert",
    defaultDuration: null,
  },
};

/**
 * Neumorphism Toast — NEUMORPHISM-SPEC §5.5
 *
 * Container: shadow-neu-strong, rounded-[14px], bg-surface
 * Status indicator: 좌측 4px 세로바 (variant색)
 * Position: 우하단 fixed
 * Entry: translateY(12px)->0 + opacity 0->1, duration-modal
 * Auto-dismiss: info/success 3s, warning 5s, danger 수동
 * a11y: role="status" (info/success) / role="alert" (warning/danger)
 */
export default function Toast({
  message,
  variant = "info",
  open,
  onClose,
  autoDismiss,
}: ToastProps) {
  const config = VARIANT_CONFIG[variant];
  const dismissMs = autoDismiss ?? config.defaultDuration;

  const handleDismiss = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open || dismissMs === null) return;
    const timer = window.setTimeout(handleDismiss, dismissMs);
    return () => window.clearTimeout(timer);
  }, [open, dismissMs, handleDismiss]);

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-[70]",
        "flex items-stretch gap-0",
        "bg-[var(--color-surface)] shadow-neu-strong rounded-[14px]",
        "p-[14px] pr-[18px]",
        "motion-safe:animate-toast-enter",
      )}
      role={config.role}
    >
      {/* 좌측 세로바 4px */}
      <div
        className={cn(
          "w-1 min-h-full rounded-full -ml-[10px] mr-3 shrink-0",
          config.barColor,
        )}
      />

      {/* Message */}
      <span className="text-sm text-[var(--color-text)] flex-1 self-center">
        {message}
      </span>

      {/* Close button (always visible for danger, optional for others) */}
      {config.defaultDuration === null && (
        <button
          type="button"
          onClick={handleDismiss}
          className="ml-3 p-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors shrink-0 self-center"
          aria-label="닫기"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
