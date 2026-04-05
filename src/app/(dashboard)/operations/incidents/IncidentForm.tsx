"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconPlus, IconX, IconCircleCheck } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { UserAvatar, DatePicker } from "@/components/common";
import { createIncident } from "./actions";

const SEVERITIES = [
  { value: "낮음", label: "낮음" },
  { value: "보통", label: "보통" },
  { value: "높음", label: "높음" },
  { value: "긴급", label: "긴급" },
] as const;

interface IncidentFormProps {
  profiles: { name: string }[];
}

const inputClass = "w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none";
const labelClass = "block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2";

export default function IncidentForm({ profiles }: IncidentFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [title, setTitle] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [university, setUniversity] = useState("");
  const [service, setService] = useState("");
  const [reporter, setReporter] = useState("");
  const [severity, setSeverity] = useState("보통");
  const [background, setBackground] = useState("");
  const [cause, setCause] = useState("");
  const [resolution, setResolution] = useState("");
  const [prevention, setPrevention] = useState("");

  function reset() {
    setTitle(""); setIncidentDate(""); setUniversity(""); setService("");
    setReporter(""); setSeverity("보통"); setBackground(""); setCause("");
    setResolution(""); setPrevention(""); setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await createIncident(title, incidentDate, university, service, reporter, severity, background, cause, resolution, prevention);
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
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-error text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-error/90 transition-colors"
      >
        <IconPlus size={16} />
        사고 등록
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-surface-container-lowest/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-2xl bg-surface-container rounded-2xl border border-outline-variant/15 shadow-2xl animate-slide-up overflow-visible max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
              <h2 className="text-lg font-bold text-on-surface">사고 리포트 등록</h2>
              <button onClick={() => setOpen(false)} className="p-1 text-on-surface-variant hover:text-on-surface transition-colors rounded-lg">
                <IconX size={20} />
              </button>
            </div>

            {success ? (
              <div className="p-8 text-center">
                <IconCircleCheck size={48} className="text-primary mx-auto mb-3" />
                <p className="font-bold text-on-surface">등록되었습니다!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-visible">
                {error && (
                  <div className="p-3 rounded-lg bg-error-container/20 border border-error/30 text-error text-xs font-medium">{error}</div>
                )}

                <div>
                  <label className={labelClass}>사고 제목</label>
                  <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="사고 내용을 간략히 작성" className={inputClass} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>발생일시</label>
                    <DatePicker value={incidentDate} onChange={setIncidentDate} placeholder="발생일 선택" includeTime />
                  </div>
                  <div>
                    <label className={labelClass}>중요도</label>
                    <select value={severity} onChange={(e) => setSeverity(e.target.value)} className={`${inputClass} appearance-none`}>
                      {SEVERITIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>관련 대학</label>
                    <input type="text" value={university} onChange={(e) => setUniversity(e.target.value)} placeholder="대학명 (선택)" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>관련 서비스</label>
                    <input type="text" value={service} onChange={(e) => setService(e.target.value)} placeholder="서비스명 (선택)" className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>보고자</label>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                    {profiles.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setReporter(p.name)}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg border-2 transition-all text-left",
                          reporter === p.name ? "border-primary bg-primary/5" : "border-outline-variant/10 hover:border-outline-variant/30",
                        )}
                      >
                        <UserAvatar name={p.name} size="sm" className="!w-5 !h-5" />
                        <span className="text-xs font-medium text-on-surface truncate">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <hr className="border-outline-variant/10" />

                <div>
                  <label className={labelClass}>경위 (발생 경위)</label>
                  <textarea value={background} onChange={(e) => setBackground(e.target.value)} placeholder="사고가 발생하게 된 경위를 작성해주세요" rows={4} className={`${inputClass} resize-none overflow-y-auto max-h-[200px]`} />
                </div>

                <div>
                  <label className={labelClass}>원인 (사고 원인)</label>
                  <textarea value={cause} onChange={(e) => setCause(e.target.value)} placeholder="사고의 근본 원인을 분석하여 작성해주세요" rows={4} className={`${inputClass} resize-none overflow-y-auto max-h-[200px]`} />
                </div>

                <div>
                  <label className={labelClass}>처리 (조치 내용)</label>
                  <textarea value={resolution} onChange={(e) => setResolution(e.target.value)} placeholder="사고 발생 후 수행한 조치 내용을 작성해주세요" rows={4} className={`${inputClass} resize-none overflow-y-auto max-h-[200px]`} />
                </div>

                <div>
                  <label className={labelClass}>대책 (재발 방지 대책)</label>
                  <textarea value={prevention} onChange={(e) => setPrevention(e.target.value)} placeholder="향후 재발 방지를 위한 대책을 작성해주세요" rows={4} className={`${inputClass} resize-none overflow-y-auto max-h-[200px]`} />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setOpen(false)} className="flex-1 py-3 bg-surface-container-high text-on-surface-variant font-bold rounded-lg active:scale-95 transition-transform text-sm">취소</button>
                  <button type="submit" disabled={isPending} className={cn("flex-1 py-3 bg-error text-white font-bold rounded-lg active:scale-95 transition-transform text-sm", isPending && "opacity-60")}>
                    {isPending ? "등록 중..." : "사고 등록"}
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
