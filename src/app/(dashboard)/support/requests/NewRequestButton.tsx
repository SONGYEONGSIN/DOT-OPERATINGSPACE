"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconPlus, IconX, IconCircleCheck } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { UserAvatar } from "@/components/common";
import { createRequest } from "../../projects/_components/actions";

const PRIORITIES = [
  { value: "low", label: "낮음" },
  { value: "medium", label: "보통" },
  { value: "high", label: "높음" },
  { value: "urgent", label: "긴급" },
] as const;

interface NewRequestButtonProps {
  profiles: { name: string }[];
}

const inputClass = "w-full bg-[var(--color-surface)] border-none rounded-[14px] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none";

export default function NewRequestButton({ profiles }: NewRequestButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [requester, setRequester] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!requester) { setError("요청자를 선택해주세요."); return; }
    setError("");

    startTransition(async () => {
      const result = await createRequest("system", title, description, priority, requester, 2026);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        router.refresh();
        setTimeout(() => {
          setSuccess(false);
          setOpen(false);
          setTitle("");
          setDescription("");
          setPriority("medium");
        }, 1000);
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-[20px] font-bold text-sm hover:bg-primary-dim transition-colors"
      >
        <IconPlus size={16} />
        새 요청
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[var(--color-surface)]est/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg bg-[var(--color-surface)] rounded-[20px] border border-black/[0.04]/15 shadow-neu-strong animate-slide-up overflow-visible max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.04]/10">
              <h2 className="text-lg font-bold text-[var(--color-text)]">시스템 개선 요청</h2>
              <button onClick={() => setOpen(false)} className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors rounded-[14px]">
                <IconX size={20} />
              </button>
            </div>

            {success ? (
              <div className="p-8 text-center">
                <IconCircleCheck size={48} className="text-primary mx-auto mb-3" />
                <p className="font-bold text-[var(--color-text)]">요청이 등록되었습니다!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-visible">
                {error && (
                  <div className="p-3 rounded-[14px] bg-error-container/20 border border-error/30 text-error text-xs font-medium">{error}</div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2">요청자</label>
                  <div className="grid grid-cols-4 gap-2">
                    {profiles.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setRequester(p.name)}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-[14px] border-2 transition-all text-left",
                          requester === p.name
                            ? "border-primary bg-primary/5"
                            : "border-black/[0.04]/10 hover:border-black/[0.04]/30",
                        )}
                      >
                        <UserAvatar name={p.name} size="sm" className="!w-5 !h-5" />
                        <span className="text-xs font-medium text-[var(--color-text)] truncate">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2">요청 제목</label>
                  <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="개선 요청사항을 간략히 작성해주세요" className={inputClass} />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2">상세 내용</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="요청 배경, 참고사항 등을 작성해주세요" rows={6} className={`${inputClass} resize-none overflow-y-auto max-h-[200px]`} />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2">우선순위</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className={`${inputClass} appearance-none`}>
                    {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setOpen(false)} className="flex-1 py-3 bg-[var(--color-surface)] text-[var(--color-text-muted)] font-bold rounded-[14px] active:scale-95 transition-transform text-sm">취소</button>
                  <button type="submit" disabled={isPending} className={cn("flex-1 py-3 bg-primary text-on-primary font-bold rounded-[14px] active:scale-95 transition-transform text-sm", isPending && "opacity-60")}>
                    {isPending ? "등록 중..." : "요청 등록"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
