"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconX, IconCircleCheck } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { DatePicker } from "@/components/common";
import { createTask } from "./actions";

const PRIORITIES = [
  { value: "low", label: "낮음" },
  { value: "medium", label: "보통" },
  { value: "high", label: "높음" },
  { value: "urgent", label: "긴급" },
] as const;

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  project: string;
  profiles: { name: string }[];
  year?: number;
}

const inputClass = "w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none";

export default function AddTaskModal({ open, onClose, project, profiles, year = 2026 }: AddTaskModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [dueDate, setDueDate] = useState("");

  if (!open) return null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createTask(
        project,
        fd.get("title") as string,
        fd.get("description") as string,
        fd.get("priority") as string,
        fd.get("assignee") as string,
        dueDate,
        year,
        fd.get("assignee") as string,
      );
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        router.refresh();
        setTimeout(() => { setSuccess(false); onClose(); }, 1000);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-surface-container-lowest/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface-container rounded-2xl border border-outline-variant/15 shadow-2xl animate-slide-up overflow-visible">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
          <h2 className="text-lg font-bold text-on-surface">작업 추가</h2>
          <button onClick={onClose} className="p-1 text-on-surface-variant hover:text-on-surface transition-colors rounded-lg">
            <IconX size={20} />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <IconCircleCheck size={48} className="text-primary mx-auto mb-3" />
            <p className="font-bold text-on-surface">작업이 추가되었습니다!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-visible">
            {error && (
              <div className="p-3 rounded-lg bg-error-container/20 border border-error/30 text-error text-xs font-medium">{error}</div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">제목</label>
              <input name="title" type="text" required placeholder="작업 제목" className={inputClass} />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">설명</label>
              <textarea name="description" placeholder="작업 설명 (선택)" rows={6} className={`${inputClass} resize-none overflow-y-auto max-h-[200px]`} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">우선순위</label>
                <select name="priority" defaultValue="medium" className={`${inputClass} appearance-none`}>
                  {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">담당자</label>
                <select name="assignee" defaultValue="" className={`${inputClass} appearance-none`}>
                  <option value="">미배정</option>
                  {profiles.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">마감일</label>
              <input type="hidden" name="dueDate" value={dueDate} />
              <DatePicker value={dueDate} onChange={setDueDate} placeholder="마감일 선택" position="top" />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-3 bg-surface-container-high text-on-surface-variant font-bold rounded-lg active:scale-95 transition-transform text-sm">취소</button>
              <button type="submit" disabled={isPending} className={cn("flex-1 py-3 bg-primary text-on-primary font-bold rounded-lg active:scale-95 transition-transform text-sm", isPending && "opacity-60")}>
                {isPending ? "추가 중..." : "추가"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
