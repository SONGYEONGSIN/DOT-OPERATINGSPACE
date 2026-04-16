"use client";

import { useRef, useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconDotsVertical, IconUpload, IconHistory } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { Card, StatusBadge } from "@/components/common";
import { uploadContractScan, searchPreviousContracts } from "./actions";

interface ContractActionMenuProps {
  numbering: string;
  universityName: string;
  hasScan: boolean;
}

export default function ContractActionMenu({ numbering, universityName, hasScan }: ContractActionMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [uploadMsg, setUploadMsg] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [prevContracts, setPrevContracts] = useState<{ name: string; webUrl: string }[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false);
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  function handleUploadClick() {
    setIsOpen(false);
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,.hwp,.jpg,.png";
    input.onchange = (ev) => {
      const file = (ev.target as HTMLInputElement).files?.[0];
      if (file) doUpload(file);
      input.remove();
    };
    input.click();
  }

  function doUpload(file: File) {
    setUploadMsg("업로드 중...");
    const nfcName = file.name.normalize("NFC");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", nfcName);
    formData.append("numbering", numbering);

    startTransition(async () => {
      const result = await uploadContractScan(formData);
      if (result.error) {
        setUploadMsg(`오류: ${result.error}`);
        setTimeout(() => setUploadMsg(""), 3000);
      } else {
        setUploadMsg("업로드 완료!");
        router.refresh();
        setTimeout(() => setUploadMsg(""), 2000);
      }
    });
  }

  async function handleHistoryClick() {
    setIsOpen(false);
    setShowHistory(true);
    setLoadingHistory(true);
    const results = await searchPreviousContracts(universityName);
    setPrevContracts(results);
    setLoadingHistory(false);
  }

  return (
    <>
      <div ref={menuRef} className="relative">
        <button type="button" onClick={() => setIsOpen((prev) => !prev)} className="w-8 h-8 rounded-[14px] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors">
          <IconDotsVertical size={16} />
        </button>
        {isOpen && (
          <div className="absolute right-0 top-full mt-1 z-10 min-w-[140px] bg-[var(--color-surface)] rounded-[14px] border border-black/[0.04]/15 shadow-neu-strong">
            <button type="button" onClick={handleUploadClick} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-surface-bright transition-colors rounded-t-lg">
              <IconUpload size={16} className="text-[var(--color-text-muted)]" />
              스캔본 업로드
            </button>
            <button type="button" onClick={handleHistoryClick} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-surface-bright transition-colors rounded-b-lg">
              <IconHistory size={16} className="text-[var(--color-text-muted)]" />
              이전 계약서
            </button>
          </div>
        )}
        {uploadMsg && (
          <div className="absolute right-0 top-full mt-1 z-20 px-3 py-2 rounded-[14px] bg-[var(--color-surface)] border border-black/[0.04]/15 shadow-neu-strong text-xs font-medium text-[var(--color-text)] whitespace-nowrap">
            {uploadMsg}
          </div>
        )}
      </div>

      {/* 이전 계약서 모달 */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[var(--color-surface)]est/80 backdrop-blur-sm" onClick={() => setShowHistory(false)} />
          <div className="relative w-full max-w-md bg-[var(--color-surface)] rounded-[20px] border border-black/[0.04]/15 shadow-neu-strong animate-slide-up max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.04]/10">
              <h2 className="text-lg font-bold text-[var(--color-text)]">이전 계약서 - {universityName}</h2>
              <button onClick={() => setShowHistory(false)} className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors rounded-[14px] text-lg">&times;</button>
            </div>
            <div className="p-6">
              {loadingHistory ? (
                <p className="text-sm text-[var(--color-text-muted)] text-center py-8">조회 중...</p>
              ) : prevContracts.length === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)] text-center py-8">이전 계약서가 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {prevContracts.map((f, i) => (
                    <a
                      key={i}
                      href={f.webUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-[14px] bg-[var(--color-surface)]/50 hover:bg-[var(--color-surface)]/50 transition-colors"
                    >
                      <IconHistory size={14} className="text-primary shrink-0" />
                      <span className="text-sm text-[var(--color-text)] truncate">{f.name}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
