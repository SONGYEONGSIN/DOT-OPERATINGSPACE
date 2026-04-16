"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconX, IconCircleCheck } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { StatusBadge, UserAvatar } from "@/components/common";
import { updateIncident } from "./actions";

const CATEGORIES = [
  "PIMS", "SMS", "결제", "경쟁률", "기타", "로그인/회원가입",
  "모니터링", "사이트", "수험번호", "알림톡", "원서작성",
  "유의사항", "입학홈페이지", "전산", "전형료", "추천서",
  "출력물", "카톡챗봇", "콜프로그램", "특이사항/수정권한", "관리자",
] as const;

const DEPARTMENTS = ["운영부", "대학영업", "영업기획", "개발부"] as const;

const STATUSES = [
  "할 일", "진행 중", "처리완료", "보류", "처리예정", "테스트", "거절",
] as const;

interface Incident {
  id: number;
  title: string;
  incident_date: string;
  university: string | null;
  category: string | null;
  department: string | null;
  reporter: string;
  assignee: string | null;
  severity: string;
  status: string;
  background: string | null;
  cause: string | null;
  resolution: string | null;
  prevention: string | null;
  created_at: string;
}

interface IncidentDetailProps {
  incident: Incident | null;
  profiles: { name: string }[];
  onClose: () => void;
}

const inputClass = "w-full bg-[var(--color-surface)] border-none rounded-[14px] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none";
const labelClass = "block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2";

const statusVariant: Record<string, "success" | "warning" | "info" | "neutral" | "error"> = {
  "처리완료": "success",
  "할 일": "neutral",
  "진행 중": "info",
  "보류": "warning",
  "처리예정": "info",
  "테스트": "neutral",
  "거절": "error",
};

export default function IncidentDetail({ incident, profiles, onClose }: IncidentDetailProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(incident?.title ?? "");
  const [category, setCategory] = useState(incident?.category ?? "");
  const [department, setDepartment] = useState(incident?.department ?? "");
  const [assignee, setAssignee] = useState(incident?.assignee ?? "");
  const [status, setStatus] = useState(incident?.status ?? "할 일");
  const [background, setBackground] = useState(incident?.background ?? "");
  const [cause, setCause] = useState(incident?.cause ?? "");
  const [resolution, setResolution] = useState(incident?.resolution ?? "");
  const [prevention, setPrevention] = useState(incident?.prevention ?? "");

  if (!incident) return null;

  function handleSave() {
    setError("");
    startTransition(async () => {
      const result = await updateIncident(
        incident!.id, title, category, department, assignee,
        status, background, cause, resolution, prevention,
      );
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        router.refresh();
        setTimeout(() => { setSuccess(false); setEditing(false); onClose(); }, 800);
      }
    });
  }

  const sectionClass = "p-4 rounded-[14px] bg-[var(--color-surface)]/50";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-[var(--color-surface)]est/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[var(--color-surface)] rounded-[20px] border border-black/[0.04]/15 shadow-neu-strong animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.04]/10">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-[var(--color-text)]">사고 리포트</h2>
            {incident.category && (
              <span className="text-xs font-medium text-[var(--color-text-muted)] bg-[var(--color-surface)] rounded-md px-2 py-0.5">
                {incident.category}
              </span>
            )}
            <StatusBadge variant={statusVariant[incident.status] ?? "neutral"}>{incident.status}</StatusBadge>
          </div>
          <button onClick={onClose} className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors rounded-[14px]">
            <IconX size={20} />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <IconCircleCheck size={48} className="text-primary mx-auto mb-3" />
            <p className="font-bold text-[var(--color-text)]">수정되었습니다!</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-[14px] bg-error-container/20 border border-error/30 text-error text-xs font-medium">{error}</div>
            )}

            {/* 기본 정보 */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[var(--color-text-muted)]">보고자</span>
                <UserAvatar name={incident.reporter} size="sm" className="!w-5 !h-5" />
                <span className="font-medium text-[var(--color-text)]">{incident.reporter}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--color-text-muted)]">담당자</span>
                {incident.assignee ? (
                  <>
                    <UserAvatar name={incident.assignee} size="sm" className="!w-5 !h-5" />
                    <span className="font-medium text-[var(--color-text)]">{incident.assignee}</span>
                  </>
                ) : (
                  <span className="font-medium text-[var(--color-text-muted)]">-</span>
                )}
              </div>
              <div>
                <span className="text-[var(--color-text-muted)]">발생일시: </span>
                <span className="font-medium text-[var(--color-text)] tabular-nums">{new Date(incident.incident_date).toLocaleString("ko-KR")}</span>
              </div>
              {incident.department && (
                <div>
                  <span className="text-[var(--color-text-muted)]">부서: </span>
                  <span className="font-medium text-[var(--color-text)]">{incident.department}</span>
                </div>
              )}
              {incident.university && (
                <div>
                  <span className="text-[var(--color-text-muted)]">대학교: </span>
                  <span className="font-medium text-[var(--color-text)]">{incident.university}</span>
                </div>
              )}
            </div>

            {editing ? (
              <>
                <div>
                  <label className={labelClass}>요약 (제목)</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>분류</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${inputClass} appearance-none`}>
                      <option value="">분류 선택</option>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>부서</label>
                    <select value={department} onChange={(e) => setDepartment(e.target.value)} className={`${inputClass} appearance-none`}>
                      <option value="">부서 선택</option>
                      {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>상태</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputClass} appearance-none`}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>담당자</label>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                    {profiles.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setAssignee(p.name)}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-[14px] border-2 transition-all text-left",
                          assignee === p.name ? "border-primary bg-primary/5" : "border-black/[0.04]/10 hover:border-black/[0.04]/30",
                        )}
                      >
                        <UserAvatar name={p.name} size="sm" className="!w-5 !h-5" />
                        <span className="text-xs font-medium text-[var(--color-text)] truncate">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>경위</label>
                  <textarea value={background} onChange={(e) => setBackground(e.target.value)} rows={4} className={`${inputClass} resize-none overflow-y-auto max-h-[200px]`} />
                </div>
                <div>
                  <label className={labelClass}>원인</label>
                  <textarea value={cause} onChange={(e) => setCause(e.target.value)} rows={4} className={`${inputClass} resize-none overflow-y-auto max-h-[200px]`} />
                </div>
                <div>
                  <label className={labelClass}>처리</label>
                  <textarea value={resolution} onChange={(e) => setResolution(e.target.value)} rows={4} className={`${inputClass} resize-none overflow-y-auto max-h-[200px]`} />
                </div>
                <div>
                  <label className={labelClass}>대책</label>
                  <textarea value={prevention} onChange={(e) => setPrevention(e.target.value)} rows={4} className={`${inputClass} resize-none overflow-y-auto max-h-[200px]`} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setEditing(false)} className="flex-1 py-3 bg-[var(--color-surface)] text-[var(--color-text-muted)] font-bold rounded-[14px] text-sm">취소</button>
                  <button type="button" onClick={handleSave} disabled={isPending} className={cn("flex-1 py-3 bg-primary text-on-primary font-bold rounded-[14px] text-sm", isPending && "opacity-60")}>
                    {isPending ? "저장 중..." : "저장"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-base font-bold text-[var(--color-text)]">{incident.title}</h3>

                <div className={sectionClass}>
                  <h4 className={labelClass}>경위</h4>
                  <p className="text-sm text-[var(--color-text)] whitespace-pre-wrap">{incident.background || "-"}</p>
                </div>

                <div className={sectionClass}>
                  <h4 className={labelClass}>원인</h4>
                  <p className="text-sm text-[var(--color-text)] whitespace-pre-wrap">{incident.cause || "-"}</p>
                </div>

                <div className={sectionClass}>
                  <h4 className={labelClass}>처리</h4>
                  <p className="text-sm text-[var(--color-text)] whitespace-pre-wrap">{incident.resolution || "-"}</p>
                </div>

                <div className={sectionClass}>
                  <h4 className={labelClass}>대책</h4>
                  <p className="text-sm text-[var(--color-text)] whitespace-pre-wrap">{incident.prevention || "-"}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="w-full py-3 bg-[var(--color-surface)] text-[var(--color-text-muted)] font-bold rounded-[14px] text-sm hover:bg-[var(--color-surface)] transition-colors"
                >
                  수정
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
