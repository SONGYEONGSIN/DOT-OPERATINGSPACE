"use client";

import { useRef, useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconDotsVertical, IconEye, IconTrash, IconX, IconCircleCheck } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { deleteBackupRequest, updateBackupRequest } from "./actions";
import type { BackupRequest } from "./types";
import { getLeaveColor } from "./types";
import { StatusBadge } from "@/components/common";
import dynamic from "next/dynamic";

const TiptapEditor = dynamic(
  () => import("@/app/(dashboard)/operations/services/[id]/TiptapEditor"),
  { ssr: false, loading: () => <div className="min-h-[120px] rounded-[14px] bg-[var(--color-surface)] animate-pulse" /> },
);

export default function BackupActionMenu({ request }: { request: BackupRequest }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [opsContent, setOpsContent] = useState(request.ops_backup_content);
  const [devContent, setDevContent] = useState(request.dev_backup_content);
  const [success, setSuccess] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false);
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  function handleSave(status: string) {
    startTransition(async () => {
      const result = await updateBackupRequest(request.id, opsContent, devContent, status);
      if (result.success) {
        setSuccess(status === "작성 완료" ? "작성 완료 및 알림 발송!" : "저장되었습니다!");
        router.refresh();
        setTimeout(() => { setSuccess(""); setShowDetail(false); }, 1500);
      }
    });
  }

  function handleDelete() {
    if (!confirm("삭제하시겠습니까?")) return;
    startTransition(async () => {
      await deleteBackupRequest(request.id);
      router.refresh();
    });
  }

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-8 h-8 rounded-[14px] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
        >
          <IconDotsVertical size={16} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1 z-10 min-w-[120px] bg-[var(--color-surface)] rounded-[14px] border border-black/[0.04]/15 shadow-neu-strong">
            <button
              type="button"
              onClick={() => { setIsOpen(false); setShowDetail(true); setSuccess(""); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-surface-bright transition-colors rounded-t-lg"
            >
              <IconEye size={16} className="text-[var(--color-text-muted)]" />
              상세보기
            </button>
            <button
              type="button"
              onClick={() => { setIsOpen(false); handleDelete(); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-error hover:bg-surface-bright transition-colors rounded-b-lg"
            >
              <IconTrash size={16} />
              삭제
            </button>
          </div>
        )}
      </div>

      {/* 상세/편집 모달 */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[var(--color-surface)]est/80 backdrop-blur-sm" onClick={() => setShowDetail(false)} />

          <div className="relative w-full max-w-2xl max-h-[90vh] bg-[var(--color-surface)] rounded-[20px] border border-black/[0.04]/15 shadow-neu-strong animate-slide-up flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.04]/10 shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-[var(--color-text)]">백업 요청 상세</h2>
                <StatusBadge variant={request.status === "작성 완료" ? "success" : "warning"}>
                  {request.status}
                </StatusBadge>
              </div>
              <button onClick={() => setShowDetail(false)} className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors rounded-[14px]">
                <IconX size={20} />
              </button>
            </div>

            {success ? (
              <div className="p-8 text-center">
                <IconCircleCheck size={48} className="text-primary mx-auto mb-3" />
                <p className="font-bold text-[var(--color-text)]">{success}</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* 기본 정보 (읽기 전용) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-1">요청자</label>
                    <p className="text-sm font-medium text-[var(--color-text)]">{request.operator_name} ({request.operator_team})</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-1">휴가 유형</label>
                    <StatusBadge variant={getLeaveColor(request.leave_type) as any}>{request.leave_type}</StatusBadge>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-1">기간</label>
                  <p className="text-sm text-[var(--color-text)] tabular-nums">{request.start_date} ~ {request.end_date}</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-1">백업자</label>
                  <p className="text-sm text-[var(--color-text)]">{request.ops_backup_name}</p>
                </div>

                <hr className="border-black/[0.04]/10" />

                {/* 편집 가능 영역 */}
                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2">백업 내용</label>
                  <TiptapEditor key={`ops-${request.id}`} content={opsContent} onUpdate={setOpsContent} disabled={isPending} />
                </div>

                {request.last_notified_at && (
                  <p className="text-xs text-[var(--color-text-muted)]">
                    최종 알림: {new Date(request.last_notified_at).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleSave("작성 전")}
                    disabled={isPending}
                    className="flex-1 py-3 bg-[var(--color-surface)] text-[var(--color-text-muted)] font-bold rounded-[14px] active:scale-95 transition-transform text-sm disabled:opacity-50"
                  >
                    임시저장
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSave("작성 완료")}
                    disabled={isPending}
                    className={cn(
                      "flex-1 py-3 bg-primary text-on-primary font-bold rounded-[14px] active:scale-95 transition-transform text-sm",
                      isPending && "opacity-60 cursor-not-allowed",
                    )}
                  >
                    {isPending ? "처리 중..." : "작성 완료 및 알림 발송"}
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
