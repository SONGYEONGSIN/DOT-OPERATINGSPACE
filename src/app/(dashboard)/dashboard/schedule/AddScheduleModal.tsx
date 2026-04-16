"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconX, IconCircleCheck } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { DatePicker } from "@/components/common";
import { createSchedule } from "./actions";

const CATEGORIES = ["일반", "미팅", "마감", "점검", "리뷰"] as const;

export default function AddScheduleModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  if (!open) return null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const title = (formData.get("title") as string).trim();
    const category = formData.get("category") as string;
    const description = (formData.get("description") as string).trim();

    if (!title) { setError("일정 제목을 입력해주세요."); return; }
    if (!startDate || !endDate) { setError("시작일과 종료일을 선택해주세요."); return; }

    startTransition(async () => {
      const result = await createSchedule(title, startDate, endDate, category, description);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        router.refresh();
        setTimeout(() => {
          setSuccess(false);
          setStartDate("");
          setEndDate("");
          onClose();
        }, 1200);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-[var(--color-surface)]est/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[var(--color-surface)] rounded-[20px] border border-black/[0.04]/15 shadow-neu-strong animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.04]/10">
          <h2 className="text-lg font-bold text-[var(--color-text)]">일정 추가</h2>
          <button onClick={onClose} className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors rounded-[14px]">
            <IconX size={20} />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <IconCircleCheck size={48} className="text-primary mx-auto mb-3" />
            <p className="font-bold text-[var(--color-text)]">일정이 등록되었습니다!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-[14px] bg-error-container/20 border border-error/30 text-error text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2">
                일정 제목
              </label>
              <input
                name="title"
                type="text"
                placeholder="일정 제목을 입력하세요"
                required
                className="w-full bg-[var(--color-surface)] border-none rounded-[14px] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2">
                시작일
              </label>
              <DatePicker value={startDate} onChange={setStartDate} placeholder="시작일 선택" includeTime />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2">
                종료일
              </label>
              <DatePicker value={endDate} onChange={setEndDate} placeholder="종료일 선택" includeTime />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2">
                카테고리
              </label>
              <select
                name="category"
                defaultValue="일반"
                className="w-full bg-[var(--color-surface)] border-none rounded-[14px] px-4 py-3 text-sm text-[var(--color-text)] focus:ring-1 focus:ring-primary/50 focus:outline-none appearance-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2">
                설명 (선택)
              </label>
              <textarea
                name="description"
                placeholder="상세 내용을 입력하세요..."
                rows={6}
                className="w-full bg-[var(--color-surface)] border-none rounded-[14px] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none resize-none overflow-y-auto max-h-[200px]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-[var(--color-surface)] text-[var(--color-text-muted)] font-bold rounded-[14px] active:scale-95 transition-transform text-sm"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isPending}
                className={cn(
                  "flex-1 py-3 bg-primary text-on-primary font-bold rounded-[14px] active:scale-95 transition-transform text-sm",
                  isPending && "opacity-60 cursor-not-allowed",
                )}
              >
                {isPending ? "등록 중..." : "등록"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
