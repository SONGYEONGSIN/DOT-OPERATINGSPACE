"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconX, IconCircleCheck } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { DatePicker } from "@/components/common";
import { updateTask } from "./actions";
import type { ProjectTask } from "./types";
import { STATUS_COLUMNS } from "./types";

const PRIORITIES = [
  { value: "low", label: "낮음" },
  { value: "medium", label: "보통" },
  { value: "high", label: "높음" },
  { value: "urgent", label: "긴급" },
] as const;

interface EditTaskModalProps {
  open: boolean;
  onClose: () => void;
  task: ProjectTask;
  profiles: { name: string }[];
}

const inputClass = "w-full bg-[var(--color-surface)] border-none rounded-[14px] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none";

export default function EditTaskModal({ open, onClose, task, profiles }: EditTaskModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [priority, setPriority] = useState(task.priority);
  const [status, setStatus] = useState(task.status);
  const [assignee, setAssignee] = useState(task.assignee ?? "");
  const [dueDate, setDueDate] = useState(task.due_date ?? "");

  if (!open) return null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await updateTask(
        task.id,
        task.project,
        title,
        description,
        priority,
        status,
        assignee,
        dueDate,
        assignee || task.assignee || "시스템",
      );
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        router.refresh();
        setTimeout(() => { setSuccess(false); onClose(); }, 800);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-[var(--color-surface)]est/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--color-surface)] rounded-[20px] border border-black/[0.04]/15 shadow-neu-strong animate-slide-up overflow-visible max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.04]/10">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)]">작업 수정</h2>
            {task.requester && (
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">요청자: {task.requester}</p>
            )}
          </div>
          <button onClick={onClose} className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors rounded-[14px]">
            <IconX size={20} />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <IconCircleCheck size={48} className="text-primary mx-auto mb-3" />
            <p className="font-bold text-[var(--color-text)]">수정되었습니다!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-visible">
            {error && (
              <div className="p-3 rounded-[14px] bg-error-container/20 border border-error/30 text-error text-xs font-medium">{error}</div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2">제목</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="작업 제목" className={inputClass} />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2">설명</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="작업 설명 (선택)" rows={6} className={`${inputClass} resize-none overflow-y-auto max-h-[200px]`} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2">단계</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as ProjectTask["status"])} className={`${inputClass} appearance-none`}>
                  {STATUS_COLUMNS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2">우선순위</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value as ProjectTask["priority"])} className={`${inputClass} appearance-none`}>
                  {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2">담당자</label>
              <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className={`${inputClass} appearance-none`}>
                <option value="">미배정</option>
                {profiles.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2">마감일</label>
              <DatePicker value={dueDate} onChange={setDueDate} placeholder="마감일 선택" position="top" />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-3 bg-[var(--color-surface)] text-[var(--color-text-muted)] font-bold rounded-[14px] active:scale-95 transition-transform text-sm">취소</button>
              <button type="submit" disabled={isPending} className={cn("flex-1 py-3 bg-primary text-on-primary font-bold rounded-[14px] active:scale-95 transition-transform text-sm", isPending && "opacity-60")}>
                {isPending ? "수정 중..." : "수정"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
