"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconX, IconCircleCheck } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { StatusBadge, Card, UserAvatar } from "@/components/common";
import { updateIncident } from "./actions";

const SEVERITIES = ["낮음", "보통", "높음", "긴급"] as const;
const STATUSES = ["접수", "조사중", "처리중", "완료"] as const;

interface Incident {
  id: number;
  title: string;
  incident_date: string;
  university: string | null;
  service: string | null;
  reporter: string;
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
  onClose: () => void;
}

const inputClass = "w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none";
const labelClass = "block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2";

const severityVariant: Record<string, "success" | "warning" | "error" | "neutral"> = {
  낮음: "neutral",
  보통: "warning",
  높음: "error",
  긴급: "error",
};

export default function IncidentDetail({ incident, onClose }: IncidentDetailProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(incident?.title ?? "");
  const [severity, setSeverity] = useState(incident?.severity ?? "보통");
  const [status, setStatus] = useState(incident?.status ?? "접수");
  const [background, setBackground] = useState(incident?.background ?? "");
  const [cause, setCause] = useState(incident?.cause ?? "");
  const [resolution, setResolution] = useState(incident?.resolution ?? "");
  const [prevention, setPrevention] = useState(incident?.prevention ?? "");

  if (!incident) return null;

  function handleSave() {
    setError("");
    startTransition(async () => {
      const result = await updateIncident(incident!.id, title, severity, status, background, cause, resolution, prevention);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        router.refresh();
        setTimeout(() => { setSuccess(false); setEditing(false); onClose(); }, 800);
      }
    });
  }

  const sectionClass = "p-4 rounded-lg bg-surface-container-low/50";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-surface-container-lowest/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-surface-container rounded-2xl border border-outline-variant/15 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-on-surface">사고 리포트</h2>
            <StatusBadge variant={severityVariant[incident.severity] ?? "neutral"}>{incident.severity}</StatusBadge>
            <StatusBadge variant={incident.status === "완료" ? "success" : "warning"}>{incident.status}</StatusBadge>
          </div>
          <button onClick={onClose} className="p-1 text-on-surface-variant hover:text-on-surface transition-colors rounded-lg">
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

            {/* 기본 정보 */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-on-surface-variant">보고자</span>
                <UserAvatar name={incident.reporter} size="sm" className="!w-5 !h-5" />
                <span className="font-medium text-on-surface">{incident.reporter}</span>
              </div>
              <div>
                <span className="text-on-surface-variant">발생일시: </span>
                <span className="font-medium text-on-surface tabular-nums">{new Date(incident.incident_date).toLocaleString("ko-KR")}</span>
              </div>
              {incident.university && (
                <div>
                  <span className="text-on-surface-variant">관련 대학: </span>
                  <span className="font-medium text-on-surface">{incident.university}</span>
                </div>
              )}
              {incident.service && (
                <div>
                  <span className="text-on-surface-variant">관련 서비스: </span>
                  <span className="font-medium text-on-surface">{incident.service}</span>
                </div>
              )}
            </div>

            {editing ? (
              <>
                <div>
                  <label className={labelClass}>제목</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>중요도</label>
                    <select value={severity} onChange={(e) => setSeverity(e.target.value)} className={`${inputClass} appearance-none`}>
                      {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
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
                  <button type="button" onClick={() => setEditing(false)} className="flex-1 py-3 bg-surface-container-high text-on-surface-variant font-bold rounded-lg text-sm">취소</button>
                  <button type="button" onClick={handleSave} disabled={isPending} className={cn("flex-1 py-3 bg-primary text-on-primary font-bold rounded-lg text-sm", isPending && "opacity-60")}>
                    {isPending ? "저장 중..." : "저장"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-base font-bold text-on-surface">{incident.title}</h3>

                <div className={sectionClass}>
                  <h4 className={labelClass}>경위</h4>
                  <p className="text-sm text-on-surface whitespace-pre-wrap">{incident.background || "-"}</p>
                </div>

                <div className={sectionClass}>
                  <h4 className={labelClass}>원인</h4>
                  <p className="text-sm text-on-surface whitespace-pre-wrap">{incident.cause || "-"}</p>
                </div>

                <div className={sectionClass}>
                  <h4 className={labelClass}>처리</h4>
                  <p className="text-sm text-on-surface whitespace-pre-wrap">{incident.resolution || "-"}</p>
                </div>

                <div className={sectionClass}>
                  <h4 className={labelClass}>대책</h4>
                  <p className="text-sm text-on-surface whitespace-pre-wrap">{incident.prevention || "-"}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="w-full py-3 bg-surface-container-high text-on-surface-variant font-bold rounded-lg text-sm hover:bg-surface-container-highest transition-colors"
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
