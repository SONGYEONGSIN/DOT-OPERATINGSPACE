"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconPlus, IconX, IconCircleCheck } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { DatePicker } from "@/components/common";
import { createDocument } from "./actions";

const inputClass = "w-full bg-[var(--color-surface)] border-none rounded-[14px] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none";
const labelClass = "block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2";

export default function AddDocumentButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [type, setType] = useState<"발신" | "수신">("발신");
  const [docNumber, setDocNumber] = useState("");
  const [date, setDate] = useState("");
  const [sender, setSender] = useState("");
  const [title, setTitle] = useState("");
  const [writer, setWriter] = useState("");
  const [receiver, setReceiver] = useState("");

  function reset() {
    setDocNumber(""); setDate(""); setSender(""); setTitle(""); setWriter(""); setReceiver(""); setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await createDocument(type, docNumber, date, sender, title, writer, receiver);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        router.refresh();
        setTimeout(() => { setSuccess(false); setOpen(false); reset(); }, 1000);
      }
    });
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-[20px] font-bold text-sm hover:bg-primary-dim transition-colors">
        <IconPlus size={16} />
        공문 등록
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[var(--color-surface)]est/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md bg-[var(--color-surface)] rounded-[20px] border border-black/[0.04]/15 shadow-neu-strong animate-slide-up overflow-visible">
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.04]/10">
              <h2 className="text-lg font-bold text-[var(--color-text)]">공문 등록</h2>
              <button onClick={() => setOpen(false)} className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors rounded-[14px]">
                <IconX size={20} />
              </button>
            </div>

            {success ? (
              <div className="p-8 text-center">
                <IconCircleCheck size={48} className="text-primary mx-auto mb-3" />
                <p className="font-bold text-[var(--color-text)]">등록되었습니다!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-visible">
                {error && <div className="p-3 rounded-[14px] bg-error-container/20 border border-error/30 text-error text-xs font-medium">{error}</div>}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>구분</label>
                    <select value={type} onChange={(e) => setType(e.target.value as "발신" | "수신")} className={`${inputClass} appearance-none`}>
                      <option value="발신">발신</option>
                      <option value="수신">수신</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>일자</label>
                    <DatePicker value={date} onChange={setDate} placeholder="일자 선택" />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>문서번호</label>
                  <input type="text" required value={docNumber} onChange={(e) => setDocNumber(e.target.value)} placeholder="운영2601-0001" className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>발신처</label>
                  <input type="text" value={sender} onChange={(e) => setSender(e.target.value)} placeholder="발신처 / 수신처" className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>공문제목</label>
                  <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="공문 제목" className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>작성자</label>
                  <input type="text" value={writer} onChange={(e) => setWriter(e.target.value)} placeholder="작성자" className={inputClass} />
                </div>
                {type === "수신" && (
                  <div>
                    <label className={labelClass}>발신자</label>
                    <input type="text" value={receiver} onChange={(e) => setReceiver(e.target.value)} placeholder="발신자" className={inputClass} />
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setOpen(false)} className="flex-1 py-3 bg-[var(--color-surface)] text-[var(--color-text-muted)] font-bold rounded-[14px] text-sm">취소</button>
                  <button type="submit" disabled={isPending} className={cn("flex-1 py-3 bg-primary text-on-primary font-bold rounded-[14px] text-sm", isPending && "opacity-60")}>
                    {isPending ? "등록 중..." : "등록"}
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
