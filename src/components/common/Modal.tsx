"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

/**
 * Neumorphism Modal — NEUMORPHISM-SPEC §5.4
 *
 * Backdrop: surface 동색조 rgba(231,229,228,0.72) + blur 4px
 * Container: shadow-neu-strong, rounded-[20px], bg-surface
 * Transition: opacity + scale(0.96→1), duration-modal, ease-neu
 * a11y: role="dialog", aria-modal, Escape close, click-outside close
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-sm",
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, handleEscape]);

  /* Focus first focusable element when modal opens */
  useEffect(() => {
    if (!open || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop — surface 동색조 반투명 + blur */}
      <div
        className="absolute inset-0 bg-[rgba(231,229,228,0.72)] backdrop-blur-[4px] transition-opacity duration-[var(--duration-modal)] ease-[var(--ease-neu)]"
        onClick={onClose}
      />

      {/* Container — extruded-strong */}
      <div
        ref={dialogRef}
        className={cn(
          "relative w-full bg-[var(--color-surface)] rounded-[20px] shadow-neu-strong",
          "transition-all duration-[var(--duration-modal)] ease-[var(--ease-neu)]",
          "motion-safe:animate-modal-enter",
          maxWidth,
        )}
      >
        {/* Header (optional) */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors rounded-[14px]"
              aria-label="닫기"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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
          </div>
        )}

        {/* Body */}
        {children}
      </div>
    </div>
  );
}
