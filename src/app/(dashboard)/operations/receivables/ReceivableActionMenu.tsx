"use client";

import { useRef, useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconDotsVertical, IconEdit, IconMail, IconX, IconCircleCheck } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { updateReceivableCell, sendDunningMail } from "./actions";

interface ReceivableActionMenuProps {
  university: string;
  salesType: string;
  detail: string;
  operator: string;
  amount: number;
  memo: string | null;
  schoolContact: string | null;
  invoiceDate: string | null;
  mailSentDate: string | null;
  expectedPayDate: string | null;
  daysElapsed: number;
}

const inputReadonly = "w-full bg-surface-container-highest/60 border-none rounded-lg px-4 py-3 text-sm text-on-surface-variant cursor-not-allowed";
const inputEditable = "w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none";

export default function ReceivableActionMenu({
  university,
  salesType,
  detail,
  operator,
  amount,
  memo,
  schoolContact,
  invoiceDate,
  mailSentDate,
  expectedPayDate,
  daysElapsed,
}: ReceivableActionMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDunning, setShowDunning] = useState(false);
  const [editMemo, setEditMemo] = useState(memo ?? "");
  const [editContactEmail, setEditContactEmail] = useState(schoolContact ?? "");
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [dunningSuccess, setDunningSuccess] = useState(false);
  const [error, setError] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  function handleSave() {
    setError("");
    startTransition(async () => {
      const result = await updateReceivableCell(university, amount, editContactEmail, editMemo);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        router.refresh();
        setTimeout(() => {
          setSuccess(false);
          setShowEdit(false);
        }, 1200);
      }
    });
  }

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            "text-on-surface-variant hover:text-on-surface",
            "hover:bg-surface-container-high transition-colors",
          )}
        >
          <IconDotsVertical size={16} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1 z-10 min-w-[140px] bg-surface-container-high rounded-lg border border-outline-variant/15 shadow-elevated">
            <button
              type="button"
              onClick={() => { setIsOpen(false); setShowEdit(true); setError(""); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-bright transition-colors rounded-t-lg"
            >
              <IconEdit size={16} className="text-on-surface-variant" />
              수정
            </button>
            <button
              type="button"
              onClick={() => { setIsOpen(false); setShowDunning(true); setError(""); }}
              disabled={!schoolContact}
              className={cn(
                "w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-surface-bright transition-colors rounded-b-lg",
                schoolContact ? "text-on-surface" : "text-on-surface-variant/40 cursor-not-allowed",
              )}
            >
              <IconMail size={16} className={schoolContact ? "text-on-surface-variant" : "text-on-surface-variant/40"} />
              독촉메일
              {!schoolContact && <span className="text-[10px] ml-auto">이메일 없음</span>}
            </button>
          </div>
        )}
      </div>

      {/* 수정 모달 */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-surface-container-lowest/80 backdrop-blur-sm" onClick={() => setShowEdit(false)} />

          <div className="relative w-full max-w-lg bg-surface-container rounded-2xl border border-outline-variant/15 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
              <h2 className="text-lg font-bold text-on-surface">미수채권 수정</h2>
              <button onClick={() => setShowEdit(false)} className="p-1 text-on-surface-variant hover:text-on-surface transition-colors rounded-lg">
                <IconX size={20} />
              </button>
            </div>

            {success ? (
              <div className="p-8 text-center">
                <IconCircleCheck size={48} className="text-primary mx-auto mb-3" />
                <p className="font-bold text-on-surface">수정되었습니다!</p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-error-container/20 border border-error/30 text-error text-xs font-medium">{error}</div>
                )}

                {/* 읽기 전용 필드 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">청구일자</label>
                    <input type="text" value={invoiceDate ?? "-"} readOnly className={inputReadonly} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">거래처명</label>
                    <input type="text" value={university} readOnly className={inputReadonly} />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">거래내역</label>
                  <input type="text" value={detail} readOnly className={inputReadonly} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">운영자</label>
                    <input type="text" value={operator} readOnly className={inputReadonly} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">청구금액</label>
                    <input type="text" value={`${amount.toLocaleString()}원`} readOnly className={inputReadonly} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">메일발송일자</label>
                    <input type="text" value={mailSentDate ?? "-"} readOnly className={inputReadonly} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">입금예정일</label>
                    <input type="text" value={expectedPayDate ?? "-"} readOnly className={inputReadonly} />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">경과일</label>
                  <input type="text" value={`${daysElapsed}일`} readOnly className={inputReadonly} />
                </div>

                <hr className="border-outline-variant/10" />

                {/* 수정 가능 필드 */}
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">학교담당자 이메일</label>
                  <input
                    type="email"
                    value={editContactEmail}
                    onChange={(e) => setEditContactEmail(e.target.value)}
                    placeholder="name@university.ac.kr"
                    className={inputEditable}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">입금여부</label>
                  <input
                    type="text"
                    value={editMemo}
                    onChange={(e) => setEditMemo(e.target.value)}
                    placeholder="입금 확인 내용 입력..."
                    className={inputEditable}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEdit(false)}
                    className="flex-1 py-3 bg-surface-container-high text-on-surface-variant font-bold rounded-lg active:scale-95 transition-transform text-sm"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isPending}
                    className={cn(
                      "flex-1 py-3 bg-primary text-on-primary font-bold rounded-lg active:scale-95 transition-transform text-sm",
                      isPending && "opacity-60 cursor-not-allowed",
                    )}
                  >
                    {isPending ? "저장 중..." : "저장"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* 독촉메일 확인 모달 */}
      {showDunning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-surface-container-lowest/80 backdrop-blur-sm" onClick={() => setShowDunning(false)} />

          <div className="relative w-full max-w-md bg-surface-container rounded-2xl border border-outline-variant/15 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
              <h2 className="text-lg font-bold text-on-surface">독촉메일 발송</h2>
              <button onClick={() => setShowDunning(false)} className="p-1 text-on-surface-variant hover:text-on-surface transition-colors rounded-lg">
                <IconX size={20} />
              </button>
            </div>

            {dunningSuccess ? (
              <div className="p-8 text-center">
                <IconCircleCheck size={48} className="text-primary mx-auto mb-3" />
                <p className="font-bold text-on-surface">발송 완료!</p>
                <p className="text-xs text-on-surface-variant mt-1">{schoolContact}로 발송되었습니다.</p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-error-container/20 border border-error/30 text-error text-xs font-medium">{error}</div>
                )}

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-high/50">
                    <span className="text-on-surface-variant">거래처</span>
                    <span className="font-semibold text-on-surface">{university}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-high/50">
                    <span className="text-on-surface-variant">청구금액</span>
                    <span className="font-bold text-error">{amount.toLocaleString()}원</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-high/50">
                    <span className="text-on-surface-variant">경과일</span>
                    <span className="font-semibold text-on-surface">{daysElapsed}일</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-high/50">
                    <span className="text-on-surface-variant">발송 대상</span>
                    <span className="font-semibold text-primary">{schoolContact}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDunning(false)}
                    className="flex-1 py-3 bg-surface-container-high text-on-surface-variant font-bold rounded-lg active:scale-95 transition-transform text-sm"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      setError("");
                      startTransition(async () => {
                        const res = await sendDunningMail(
                          schoolContact!,
                          university,
                          detail,
                          amount,
                          invoiceDate,
                          daysElapsed,
                          operator,
                        );
                        if (res.error) {
                          setError(res.error);
                        } else {
                          setDunningSuccess(true);
                          setTimeout(() => {
                            setDunningSuccess(false);
                            setShowDunning(false);
                          }, 1500);
                        }
                      });
                    }}
                    className={cn(
                      "flex-1 py-3 bg-error text-white font-bold rounded-lg active:scale-95 transition-transform text-sm",
                      isPending && "opacity-60 cursor-not-allowed",
                    )}
                  >
                    {isPending ? "발송 중..." : "독촉메일 발송"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
