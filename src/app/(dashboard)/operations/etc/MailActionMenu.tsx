"use client";

import { useRef, useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconDotsVertical, IconEdit, IconX, IconCircleCheck } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { DatePicker } from "@/components/common";
import { updateMailRecord } from "./actions";

interface MailActionMenuProps {
  sendDate: string | null;
  recipient: string;
  recipientPerson: string;
  manager: string;
  checker: string | null;
  trackingNumber: string | null;
  remark: string | null;
}

const inputClass = "w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none";
const labelClass = "block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2";

export default function MailActionMenu({ sendDate, recipient, recipientPerson, manager, checker, trackingNumber, remark }: MailActionMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const [editSendDate, setEditSendDate] = useState(sendDate ?? "");
  const [editRecipient, setEditRecipient] = useState(recipient);
  const [editRecipientPerson, setEditRecipientPerson] = useState(recipientPerson);
  const [editManager, setEditManager] = useState(manager);
  const [editChecker, setEditChecker] = useState(checker ?? "");
  const [editTrackingNumber, setEditTrackingNumber] = useState(trackingNumber ?? "");
  const [editRemark, setEditRemark] = useState(remark ?? "");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false);
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  function handleSave() {
    setError("");
    startTransition(async () => {
      const result = await updateMailRecord(trackingNumber ?? "", recipient, editSendDate, editRecipient, editRecipientPerson, editManager, editChecker, editTrackingNumber, editRemark);
      if (result.error) { setError(result.error); }
      else { setSuccess(true); router.refresh(); setTimeout(() => { setSuccess(false); setShowEdit(false); }, 1000); }
    });
  }

  return (
    <>
      <div ref={menuRef} className="relative">
        <button type="button" onClick={() => setIsOpen((prev) => !prev)} className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors">
          <IconDotsVertical size={16} />
        </button>
        {isOpen && (
          <div className="absolute right-0 top-full mt-1 z-10 min-w-[120px] bg-surface-container-high rounded-lg border border-outline-variant/15 shadow-elevated">
            <button type="button" onClick={() => { setIsOpen(false); setShowEdit(true); setError(""); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-bright transition-colors rounded-lg">
              <IconEdit size={16} className="text-on-surface-variant" />
              수정
            </button>
          </div>
        )}
      </div>

      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-surface-container-lowest/80 backdrop-blur-sm" onClick={() => setShowEdit(false)} />
          <div className="relative w-full max-w-md bg-surface-container rounded-2xl border border-outline-variant/15 shadow-2xl animate-slide-up overflow-visible">
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
              <h2 className="text-lg font-bold text-on-surface">우편물 수정</h2>
              <button onClick={() => setShowEdit(false)} className="p-1 text-on-surface-variant hover:text-on-surface transition-colors rounded-lg"><IconX size={20} /></button>
            </div>
            {success ? (
              <div className="p-8 text-center"><IconCircleCheck size={48} className="text-primary mx-auto mb-3" /><p className="font-bold text-on-surface">수정되었습니다!</p></div>
            ) : (
              <div className="p-6 space-y-4 overflow-visible">
                {error && <div className="p-3 rounded-lg bg-error-container/20 border border-error/30 text-error text-xs font-medium">{error}</div>}
                <div><label className={labelClass}>발송일</label><DatePicker value={editSendDate} onChange={setEditSendDate} placeholder="발송일 선택" /></div>
                <div><label className={labelClass}>수신처</label><input type="text" value={editRecipient} onChange={(e) => setEditRecipient(e.target.value)} className={inputClass} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelClass}>수신자</label><input type="text" value={editRecipientPerson} onChange={(e) => setEditRecipientPerson(e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>담당자</label><input type="text" value={editManager} onChange={(e) => setEditManager(e.target.value)} className={inputClass} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelClass}>확인</label><input type="text" value={editChecker} onChange={(e) => setEditChecker(e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>등기번호</label><input type="text" value={editTrackingNumber} onChange={(e) => setEditTrackingNumber(e.target.value)} className={inputClass} /></div>
                </div>
                <div><label className={labelClass}>비고</label><input type="text" value={editRemark} onChange={(e) => setEditRemark(e.target.value)} className={inputClass} /></div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowEdit(false)} className="flex-1 py-3 bg-surface-container-high text-on-surface-variant font-bold rounded-lg text-sm">취소</button>
                  <button type="button" onClick={handleSave} disabled={isPending} className={cn("flex-1 py-3 bg-primary text-on-primary font-bold rounded-lg text-sm", isPending && "opacity-60")}>{isPending ? "저장 중..." : "저장"}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
