"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconCircleCheck, IconSend } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { Card, UserAvatar } from "@/components/common";
import { createRequest } from "./actions";

const PRIORITIES = [
  { value: "low", label: "낮음" },
  { value: "medium", label: "보통" },
  { value: "high", label: "높음" },
  { value: "urgent", label: "긴급" },
] as const;

interface RequestFormProps {
  project: string;
  year: number;
  profiles: { name: string }[];
}

const inputClass = "w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none";

export default function RequestForm({ project, year, profiles }: RequestFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [requester, setRequester] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await createRequest(project, title, description, priority, requester, year);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        router.refresh();
        setTimeout(() => {
          setSuccess(false);
          setTitle("");
          setDescription("");
          setPriority("medium");
        }, 1200);
      }
    });
  }

  if (success) {
    return (
      <Card className="p-12 text-center">
        <IconCircleCheck size={48} className="text-primary mx-auto mb-3" />
        <p className="font-bold text-on-surface">요청이 등록되었습니다!</p>
        <p className="text-xs text-on-surface-variant mt-1">담당자가 확인 후 처리합니다.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-5">요청 등록</h3>
      <p className="text-xs text-on-surface-variant mb-6">프로젝트 담당자에게 개발/수정 요청을 등록합니다.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-error-container/20 border border-error/30 text-error text-xs font-medium">{error}</div>
        )}

        <div>
          <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">요청자</label>
          <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-2">
            {profiles.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => setRequester(p.name)}
                className={cn(
                  "flex items-center gap-2 p-2.5 rounded-lg border-2 transition-all text-left",
                  requester === p.name
                    ? "border-primary bg-primary/5"
                    : "border-outline-variant/10 hover:border-outline-variant/30",
                )}
              >
                <UserAvatar name={p.name} size="sm" className="!w-6 !h-6" />
                <span className="text-xs font-medium text-on-surface truncate">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">요청 제목</label>
          <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="요청사항을 간략히 작성해주세요" className={inputClass} />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">상세 내용</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="요청 배경, 참고사항 등을 작성해주세요" rows={6} className={`${inputClass} resize-none overflow-y-auto max-h-[200px]`} />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">우선순위</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className={`${inputClass} appearance-none`}>
            {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>

        <button
          type="submit"
          disabled={isPending || !requester || !title}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3 bg-primary text-on-primary font-bold rounded-lg active:scale-95 transition-transform text-sm",
            (isPending || !requester || !title) && "opacity-40 cursor-not-allowed",
          )}
        >
          <IconSend size={16} />
          {isPending ? "등록 중..." : "요청 등록"}
        </button>
      </form>
    </Card>
  );
}
