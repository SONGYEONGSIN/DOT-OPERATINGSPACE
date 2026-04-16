"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconPlus, IconX, IconCircleCheck } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { DatePicker } from "@/components/common";
import { createMailRecord } from "./actions";

const inputClass = "w-full bg-[var(--color-surface)] border-none rounded-[14px] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none";
const labelClass = "block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2";

export default function AddMailButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [sendDate, setSendDate] = useState("");
  const [recipient, setRecipient] = useState("");
  const [recipientPerson, setRecipientPerson] = useState("");
  const [manager, setManager] = useState("");
  const [checker, setChecker] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [remark, setRemark] = useState("");

  function reset() {
    setSendDate(""); setRecipient(""); setRecipientPerson(""); setManager(""); setChecker(""); setTrackingNumber(""); setRemark(""); setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await createMailRecord(sendDate, recipient, recipientPerson, manager, checker, trackingNumber, remark);
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
        우편물 등록
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[var(--color-surface)]est/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md bg-[var(--color-surface)] rounded-[20px] border border-black/[0.04]/15 shadow-neu-strong animate-slide-up overflow-visible">
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.04]/10">
              <h2 className="text-lg font-bold text-[var(--color-text)]">우편물 등록</h2>
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

                <div>
                  <label className={labelClass}>발송일</label>
                  <DatePicker value={sendDate} onChange={setSendDate} placeholder="발송일 선택" />
                </div>

                <div>
                  <label className={labelClass}>수신처</label>
                  <input type="text" required value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="대학명 / 기관명" className={inputClass} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>수신자</label>
                    <input type="text" value={recipientPerson} onChange={(e) => setRecipientPerson(e.target.value)} placeholder="수신자명" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>담당자</label>
                    <input type="text" value={manager} onChange={(e) => setManager(e.target.value)} placeholder="담당자명" className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>확인</label>
                    <input type="text" value={checker} onChange={(e) => setChecker(e.target.value)} placeholder="확인자" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>등기번호</label>
                    <input type="text" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="등기번호" className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>비고</label>
                  <input type="text" value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="비고 (선택)" className={inputClass} />
                </div>

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
