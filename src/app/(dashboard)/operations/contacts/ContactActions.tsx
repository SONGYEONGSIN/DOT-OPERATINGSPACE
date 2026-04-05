"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { IconPlus, IconUpload, IconX, IconCircleCheck } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { addContact, importContacts } from "./actions";

const CATEGORIES = ["PIMS", "원서접수"] as const;

export default function ContactActions() {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleAddSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await addContact(
        fd.get("university") as string,
        fd.get("category") as string,
        fd.get("department") as string,
        fd.get("role") as string,
        fd.get("person") as string,
        fd.get("phone") as string,
        fd.get("email") as string,
      );
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("연락처가 등록되었습니다!");
        router.refresh();
        setTimeout(() => { setSuccess(""); setShowAdd(false); }, 1200);
      }
    });
  }

  async function handleExcelUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const XLSX = await import("xlsx");
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws);

    const contacts = rows.map((r) => ({
      university_name: r["대학명"] ?? "",
      category: r["구분"] ?? "PIMS",
      department: r["부서"] ?? "",
      role: r["직급"] ?? "",
      person_name: r["담당자"] ?? "",
      phone: r["연락처"] ?? "",
      email: r["이메일"] ?? "",
    })).filter((c) => c.university_name && c.person_name);

    if (contacts.length === 0) {
      setError("유효한 데이터가 없습니다. 컬럼명을 확인해주세요 (대학명, 구분, 부서, 직급, 담당자, 연락처, 이메일)");
      return;
    }

    startTransition(async () => {
      const result = await importContacts(contacts);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(`${result.count}건이 업로드되었습니다!`);
        router.refresh();
        setTimeout(() => setSuccess(""), 2000);
      }
    });

    // input 초기화
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleExcelUpload}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-high text-on-surface-variant text-sm font-semibold hover:bg-surface-container-highest transition-colors disabled:opacity-50"
      >
        <IconUpload size={16} />
        엑셀 업로드
      </button>
      <button
        type="button"
        onClick={() => { setShowAdd(true); setError(""); setSuccess(""); }}
        className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary transition-all hover:brightness-110 active:scale-95"
      >
        <IconPlus size={16} />
        연락처 추가
      </button>

      {/* 성공 토스트 */}
      {success && !showAdd && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-on-primary text-sm font-bold shadow-xl animate-slide-up">
          <IconCircleCheck size={18} />
          {success}
        </div>
      )}

      {/* 에러 토스트 */}
      {error && !showAdd && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl bg-error text-white text-sm font-bold shadow-xl animate-slide-up">
          {error}
        </div>
      )}

      {/* 연락처 추가 모달 */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-surface-container-lowest/80 backdrop-blur-sm" onClick={() => setShowAdd(false)} />

          <div className="relative w-full max-w-lg bg-surface-container rounded-2xl border border-outline-variant/15 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
              <h2 className="text-lg font-bold text-on-surface">연락처 추가</h2>
              <button onClick={() => setShowAdd(false)} className="p-1 text-on-surface-variant hover:text-on-surface transition-colors rounded-lg">
                <IconX size={20} />
              </button>
            </div>

            {success ? (
              <div className="p-8 text-center">
                <IconCircleCheck size={48} className="text-primary mx-auto mb-3" />
                <p className="font-bold text-on-surface">{success}</p>
              </div>
            ) : (
              <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-error-container/20 border border-error/30 text-error text-xs font-medium">{error}</div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">대학명</label>
                  <input name="university" type="text" required placeholder="서울대학교"
                    className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">구분</label>
                  <select name="category" defaultValue="PIMS"
                    className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/50 focus:outline-none appearance-none">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">부서</label>
                  <input name="department" type="text" placeholder="입학처"
                    className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">직급</label>
                  <input name="role" type="text" placeholder="팀장"
                    className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">담당자명</label>
                  <input name="person" type="text" required placeholder="홍길동"
                    className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">연락처</label>
                  <input name="phone" type="tel" placeholder="02-000-0000"
                    className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">이메일</label>
                  <input name="email" type="email" placeholder="name@university.ac.kr"
                    className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAdd(false)}
                    className="flex-1 py-3 bg-surface-container-high text-on-surface-variant font-bold rounded-lg active:scale-95 transition-transform text-sm">
                    취소
                  </button>
                  <button type="submit" disabled={isPending}
                    className={cn("flex-1 py-3 bg-primary text-on-primary font-bold rounded-lg active:scale-95 transition-transform text-sm", isPending && "opacity-60 cursor-not-allowed")}>
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
