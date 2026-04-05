"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { IconLoader2, IconAlertCircle, IconUser, IconClock } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { Card } from "@/components/common";
import { saveWorkLog, deleteWorkLog } from "./actions";

const TiptapEditor = dynamic(() => import("./TiptapEditor"), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-outline-variant/15 bg-surface-container-highest min-h-[280px] flex items-center justify-center">
      <IconLoader2 size={16} className="text-on-surface-variant/30 animate-spin" />
    </div>
  ),
});

const CATEGORIES = [
  { key: "contract_info", label: "계약정보" },
  { key: "contract_docs", label: "계약자료" },
  { key: "work_basic", label: "기초작업" },
  { key: "work_generator", label: "생성툴" },
  { key: "work_site", label: "사이트/페이지" },
  { key: "work_print", label: "출력물" },
  { key: "work_competition", label: "경쟁률" },
  { key: "work_files", label: "전산파일" },
  { key: "work_etc", label: "기타작업" },
  { key: "fee_settlement", label: "전형료정산" },
  { key: "invoice", label: "계산서발송" },
  { key: "submission", label: "자료제출" },
  { key: "school_contact", label: "학교담당자" },
  { key: "note", label: "비고" },
] as const;

interface WorkLog {
  id: number;
  service_id: number;
  category: string;
  content: string;
  author: string | null;
  created_at: string;
  updated_at: string;
}

interface WorkLogEditorProps {
  serviceId: number;
  workLogs: WorkLog[];
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** 기존 plain text를 HTML로 변환 (하위 호환) */
function plainTextToHtml(text: string): string {
  if (text.startsWith("<")) return text;
  return text
    .split("\n")
    .map((line) => (line.trim() === "" ? "<p></p>" : `<p>${line}</p>`))
    .join("");
}

export default function WorkLogEditor({
  serviceId,
  workLogs,
}: WorkLogEditorProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>(CATEGORIES[0].key);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const logMap = new Map(workLogs.map((log) => [log.category, log]));
  const currentLog = logMap.get(activeTab);
  const filledCount = workLogs.length;

  function handleEdit() {
    const raw = currentLog?.content ?? "";
    setEditContent(plainTextToHtml(raw));
    setIsEditing(true);
    setError(null);
  }

  function handleCancel() {
    setIsEditing(false);
    setEditContent("");
    setError(null);
  }

  const handleEditorUpdate = useCallback((html: string) => {
    setEditContent(html);
  }, []);

  function handleSave() {
    const textOnly = editContent.replace(/<[^>]*>/g, "").trim();
    if (!textOnly) {
      setError("내용을 입력해주세요.");
      return;
    }
    startTransition(async () => {
      const result = await saveWorkLog(serviceId, activeTab, editContent, "관리자");
      if (result.error) {
        setError(result.error);
      } else {
        setIsEditing(false);
        setEditContent("");
        setError(null);
        router.refresh();
      }
    });
  }

  function handleDelete() {
    if (!currentLog) return;
    startTransition(async () => {
      const result = await deleteWorkLog(currentLog.id);
      if (result.error) {
        setError(result.error);
      } else {
        setIsEditing(false);
        setEditContent("");
        setError(null);
        router.refresh();
      }
    });
  }

  function handleTabChange(key: string) {
    setActiveTab(key);
    setIsEditing(false);
    setEditContent("");
    setError(null);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold text-primary">작업이력</h2>
        <span className="text-xs text-on-surface-variant">
          {filledCount}/{CATEGORIES.length}개 작성됨
        </span>
      </div>

      <Card className="overflow-hidden">
        <div className="flex min-h-[400px]">
          {/* 좌측: 카테고리 사이드 리스트 */}
          <div className="w-44 shrink-0 border-r border-outline-variant/10 bg-surface-container-low/50">
            {CATEGORIES.map((cat) => {
              const hasContent = logMap.has(cat.key);
              const isActive = activeTab === cat.key;

              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => handleTabChange(cat.key)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium transition-all text-left",
                    isActive
                      ? "bg-primary/10 text-primary border-r-2 border-primary"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
                  )}
                >
                  <span>{cat.label}</span>
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      hasContent ? "bg-primary" : "bg-outline-variant/30",
                    )}
                  />
                </button>
              );
            })}
          </div>

          {/* 우측: 작성 영역 */}
          <div className="flex-1 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-on-surface">
                {CATEGORIES.find((c) => c.key === activeTab)?.label}
              </h3>
              {!isEditing && currentLog && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isPending}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-error hover:bg-error/10 transition-colors disabled:opacity-50"
                  >
                    삭제
                  </button>
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface-variant text-xs font-bold transition-colors hover:bg-surface-container-highest"
                  >
                    수정
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-error/10 text-error text-xs font-medium">
                <IconAlertCircle size={16} />
                {error}
              </div>
            )}

            {isEditing ? (
              <div className="space-y-4">
                <TiptapEditor
                  key={`edit-${activeTab}`}
                  content={editContent}
                  onUpdate={handleEditorUpdate}
                  disabled={isPending}
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isPending}
                    className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface-variant text-xs font-bold transition-colors hover:bg-surface-container-highest disabled:opacity-50"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isPending}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isPending && (
                      <IconLoader2 size={16} className="animate-spin" />
                    )}
                    저장
                  </button>
                </div>
              </div>
            ) : currentLog ? (
              <div className="space-y-3">
                <div
                  className="tiptap rounded-lg bg-surface-container-highest/50 p-4 text-sm text-on-surface leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: currentLog.content.startsWith("<")
                      ? currentLog.content
                      : plainTextToHtml(currentLog.content),
                  }}
                />
                <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                  {currentLog.author && (
                    <span className="flex items-center gap-1">
                      <IconUser size={14} />
                      {currentLog.author}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <IconClock size={14} />
                    {formatDateTime(currentLog.updated_at)}
                  </span>
                </div>
              </div>
            ) : !isEditing ? (
              <div className="space-y-4">
                <TiptapEditor
                  key={`new-${activeTab}`}
                  content=""
                  onUpdate={handleEditorUpdate}
                  disabled={isPending}
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isPending}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isPending && (
                      <IconLoader2 size={16} className="animate-spin" />
                    )}
                    저장
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Card>
    </div>
  );
}
