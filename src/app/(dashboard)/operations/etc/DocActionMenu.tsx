"use client";

import { useRef, useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconDotsVertical, IconEdit, IconUpload, IconX, IconCircleCheck, IconFile } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { DatePicker } from "@/components/common";
import { updateDocument, uploadDocumentFile } from "./actions";

interface DocActionMenuProps {
  type: "발신" | "수신";
  docNumber: string;
  date: string | null;
  sender: string;
  title: string;
  fileLink: string | null;
  writer: string | null;
  receiver: string | null;
}

const inputClass = "w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none";
const labelClass = "block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2";

export default function DocActionMenu({ type, docNumber, date, sender, title, fileLink, writer, receiver }: DocActionMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [uploadMsg, setUploadMsg] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editDocNumber, setEditDocNumber] = useState(docNumber);
  const [editDate, setEditDate] = useState(date ?? "");
  const [editSender, setEditSender] = useState(sender);
  const [editTitle, setEditTitle] = useState(title);
  const [editFileLink, setEditFileLink] = useState(fileLink ?? "");
  const [editWriter, setEditWriter] = useState(writer ?? "");
  const [editReceiver, setEditReceiver] = useState(receiver ?? "");

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
      const result = await updateDocument(type, docNumber, editDocNumber, editDate, editSender, editTitle, editFileLink, editWriter, editReceiver);
      if (result.error) { setError(result.error); }
      else { setSuccess(true); router.refresh(); setTimeout(() => { setSuccess(false); setShowEdit(false); }, 1000); }
    });
  }

  function handleUploadClick() {
    setIsOpen(false);
    // input[type=file]을 body에 임시 생성하여 클릭
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,.hwp,.xlsx,.xls";
    input.onchange = (ev) => {
      const file = (ev.target as HTMLInputElement).files?.[0];
      if (file) doUpload(file);
      input.remove();
    };
    input.click();
  }

  function doUpload(file: File) {
    setUploadMsg("업로드 중...");
    // 파일명을 NFC로 정규화하여 별도 필드로 전달
    const nfcName = file.name.normalize("NFC");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", nfcName);
    formData.append("type", type);
    formData.append("docNumber", docNumber);

    startTransition(async () => {
      const result = await uploadDocumentFile(formData);
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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadMsg("업로드 중...");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    formData.append("docNumber", docNumber);

    startTransition(async () => {
      const result = await uploadDocumentFile(formData);
      if (result.error) {
        setUploadMsg(`오류: ${result.error}`);
        setTimeout(() => setUploadMsg(""), 3000);
      } else {
        setUploadMsg("업로드 완료!");
        router.refresh();
        setTimeout(() => setUploadMsg(""), 2000);
      }
    });

    e.target.value = "";
  }

  return (
    <>
      <div ref={menuRef} className="relative">
        <button type="button" onClick={() => setIsOpen((prev) => !prev)} className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors">
          <IconDotsVertical size={16} />
        </button>
        {isOpen && (
          <div className="absolute right-0 top-full mt-1 z-10 min-w-[130px] bg-surface-container-high rounded-lg border border-outline-variant/15 shadow-elevated">
            <button type="button" onClick={() => { setIsOpen(false); setShowEdit(true); setError(""); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-bright transition-colors rounded-t-lg">
              <IconEdit size={16} className="text-on-surface-variant" />
              수정
            </button>
            <button type="button" onClick={handleUploadClick} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-bright transition-colors rounded-b-lg">
              <IconUpload size={16} className="text-on-surface-variant" />
              파일 업로드
            </button>
          </div>
        )}
        {uploadMsg && (
          <div className="absolute right-0 top-full mt-1 z-20 px-3 py-2 rounded-lg bg-surface-container-high border border-outline-variant/15 shadow-elevated text-xs font-medium text-on-surface whitespace-nowrap">
            {uploadMsg}
          </div>
        )}
      </div>

      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.hwp,.xlsx,.xls" />

      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-surface-container-lowest/80 backdrop-blur-sm" onClick={() => setShowEdit(false)} />
          <div className="relative w-full max-w-md bg-surface-container rounded-2xl border border-outline-variant/15 shadow-2xl animate-slide-up overflow-visible">
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
              <h2 className="text-lg font-bold text-on-surface">공문 수정</h2>
              <button onClick={() => setShowEdit(false)} className="p-1 text-on-surface-variant hover:text-on-surface transition-colors rounded-lg"><IconX size={20} /></button>
            </div>
            {success ? (
              <div className="p-8 text-center"><IconCircleCheck size={48} className="text-primary mx-auto mb-3" /><p className="font-bold text-on-surface">수정되었습니다!</p></div>
            ) : (
              <div className="p-6 space-y-4 overflow-visible">
                {error && <div className="p-3 rounded-lg bg-error-container/20 border border-error/30 text-error text-xs font-medium">{error}</div>}
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelClass}>문서번호</label><input type="text" value={editDocNumber} onChange={(e) => setEditDocNumber(e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>일자</label><DatePicker value={editDate} onChange={setEditDate} placeholder="일자 선택" /></div>
                </div>
                <div><label className={labelClass}>발신처</label><input type="text" value={editSender} onChange={(e) => setEditSender(e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>공문제목</label><input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>파일 링크</label>
                  <div className="flex items-center gap-2">
                    <input type="text" value={editFileLink} onChange={(e) => setEditFileLink(e.target.value)} placeholder="파일 URL" className={inputClass} />
                    {editFileLink && (
                      <a href={editFileLink.startsWith("http") ? editFileLink : "#"} target="_blank" rel="noopener noreferrer" className="shrink-0 p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                        <IconFile size={16} />
                      </a>
                    )}
                  </div>
                </div>
                <div><label className={labelClass}>작성자</label><input type="text" value={editWriter} onChange={(e) => setEditWriter(e.target.value)} className={inputClass} /></div>
                {type === "수신" && <div><label className={labelClass}>발신자</label><input type="text" value={editReceiver} onChange={(e) => setEditReceiver(e.target.value)} className={inputClass} /></div>}
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
