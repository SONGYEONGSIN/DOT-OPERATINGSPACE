"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  IconLoader2,
  IconAlertCircle,
  IconUser,
  IconClock,
  IconCheck,
  IconEdit,
  IconTrash,
  IconFileDescription,
  IconFolder,
  IconHammer,
  IconWand,
  IconWorld,
  IconPrinter,
  IconTrendingUp,
  IconDatabase,
  IconDots,
  IconCash,
  IconReceipt,
  IconUpload,
  IconPhone,
  IconNote,
  IconChevronDown,
  IconSparkles,
  IconCircleCheck,
  IconCircleDashed,
  IconWriting,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { saveWorkLog, deleteWorkLog } from "./actions";

const TiptapEditor = dynamic(() => import("./TiptapEditor"), {
  ssr: false,
  loading: () => (
    <div className="rounded-[14px] border border-black/[0.04]/15 bg-[var(--color-surface)] min-h-[200px] flex items-center justify-center">
      <IconLoader2
        size={16}
        className="text-[var(--color-text-muted)]/30 animate-spin"
      />
    </div>
  ),
});

/* ══════════════════════════════════════════════════════════════
   카테고리 · 그룹 · 템플릿 정의
   ══════════════════════════════════════════════════════════════ */

const CATEGORIES = [
  {
    key: "contract_info",
    label: "계약정보",
    icon: IconFileDescription,
    group: "contract",
    placeholder: "계약 형태, 계약 금액, 계약 기간, 특이사항 등을 기록하세요.",
  },
  {
    key: "contract_docs",
    label: "계약자료",
    icon: IconFolder,
    group: "contract",
    placeholder:
      "계약서 수령 여부, 날인 상태, 보증보험 확인 내역을 기록하세요.",
  },
  {
    key: "work_basic",
    label: "기초작업",
    icon: IconHammer,
    group: "work",
    placeholder:
      "기초데이터 작성 현황, 항목별 완료 여부, 특이사항을 기록하세요.",
  },
  {
    key: "work_generator",
    label: "생성툴",
    icon: IconWand,
    group: "work",
    placeholder:
      "생성툴 페이지 제작 현황, 원서 양식 설정, 확인 사항을 기록하세요.",
  },
  {
    key: "work_site",
    label: "사이트/페이지",
    icon: IconWorld,
    group: "work",
    placeholder:
      "입학 사이트 페이지 구성, 수정사항, 대학 요청사항을 기록하세요.",
  },
  {
    key: "work_print",
    label: "출력물",
    icon: IconPrinter,
    group: "work",
    placeholder:
      "오즈 출력물 제작 현황, 수험표/성적표 양식, 확인 사항을 기록하세요.",
  },
  {
    key: "work_competition",
    label: "경쟁률",
    icon: IconTrendingUp,
    group: "work",
    placeholder:
      "경쟁률 페이지 설정, 실시간 경쟁률 노출 여부, 특이사항을 기록하세요.",
  },
  {
    key: "work_files",
    label: "전산파일",
    icon: IconDatabase,
    group: "work",
    placeholder:
      "전산 파일 제작 및 업로드 현황, 파일 형식, 전달 여부를 기록하세요.",
  },
  {
    key: "work_etc",
    label: "기타작업",
    icon: IconDots,
    group: "work",
    placeholder: "위 항목에 해당하지 않는 기타 작업 내역을 기록하세요.",
  },
  {
    key: "fee_settlement",
    label: "전형료정산",
    icon: IconCash,
    group: "settlement",
    placeholder:
      "전형료 정산 내역, 환불 처리, 진학캐쉬 관련 사항을 기록하세요.",
  },
  {
    key: "invoice",
    label: "계산서발송",
    icon: IconReceipt,
    group: "settlement",
    placeholder: "세금계산서 발행 여부, 발송 일자, 금액을 기록하세요.",
  },
  {
    key: "school_contact",
    label: "학교담당자",
    icon: IconPhone,
    group: "etc",
    placeholder: "학교 담당자 이름, 연락처, 이메일, 담당 업무를 기록하세요.",
  },
  {
    key: "submission",
    label: "자료제출",
    icon: IconUpload,
    group: "etc",
    placeholder: "대학 제출 자료 목록, 제출 일자, 확인 여부를 기록하세요.",
  },
  {
    key: "note",
    label: "비고",
    icon: IconNote,
    group: "etc",
    placeholder: "기타 참고 사항, 메모, 특이사항을 자유롭게 기록하세요.",
  },
] as const;

type CatDef = (typeof CATEGORIES)[number];

const GROUPS = [
  { key: "contract", label: "계약", accent: "bg-blue-400" },
  { key: "work", label: "작업", accent: "bg-amber-400" },
  { key: "settlement", label: "정산", accent: "bg-emerald-400" },
  { key: "etc", label: "기타", accent: "bg-purple-400" },
] as const;

const TEMPLATES: Record<string, string> = {
  contract_info: `<h3>계약 개요</h3><ul><li>계약 형태: </li><li>계약 금액: </li><li>계약 기간: ~ </li><li>비고: </li></ul>`,
  contract_docs: [
    '<ul data-type="taskList">',
    '<li data-type="taskItem" data-checked="false"><p>계약서 수령</p></li>',
    '<li data-type="taskItem" data-checked="false"><p>날인 완료</p></li>',
    '<li data-type="taskItem" data-checked="false"><p>보증보험 확인</p></li>',
    '<li data-type="taskItem" data-checked="false"><p>계약서 사본 전달</p></li>',
    "</ul>",
  ].join(""),
  work_basic: [
    '<ul data-type="taskList">',
    '<li data-type="taskItem" data-checked="false"><p>기초데이터 작성</p></li>',
    '<li data-type="taskItem" data-checked="false"><p>항목별 검증 완료</p></li>',
    '<li data-type="taskItem" data-checked="false"><p>특이사항 확인</p></li>',
    "</ul>",
  ].join(""),
  work_generator: [
    '<ul data-type="taskList">',
    '<li data-type="taskItem" data-checked="false"><p>생성툴 페이지 제작</p></li>',
    '<li data-type="taskItem" data-checked="false"><p>원서 양식 설정</p></li>',
    '<li data-type="taskItem" data-checked="false"><p>테스트 확인</p></li>',
    "</ul>",
  ].join(""),
  work_site: [
    '<ul data-type="taskList">',
    '<li data-type="taskItem" data-checked="false"><p>입학 사이트 구성 확인</p></li>',
    '<li data-type="taskItem" data-checked="false"><p>페이지 수정사항 반영</p></li>',
    '<li data-type="taskItem" data-checked="false"><p>대학 요청사항 처리</p></li>',
    "</ul>",
  ].join(""),
  work_print: [
    '<ul data-type="taskList">',
    '<li data-type="taskItem" data-checked="false"><p>오즈 출력물 제작</p></li>',
    '<li data-type="taskItem" data-checked="false"><p>수험표 양식 확인</p></li>',
    '<li data-type="taskItem" data-checked="false"><p>성적표 양식 확인</p></li>',
    "</ul>",
  ].join(""),
  work_competition: `<ul><li>경쟁률 페이지 설정: </li><li>실시간 노출 여부: </li><li>특이사항: </li></ul>`,
  work_files: [
    '<ul data-type="taskList">',
    '<li data-type="taskItem" data-checked="false"><p>전산 파일 제작</p></li>',
    '<li data-type="taskItem" data-checked="false"><p>파일 업로드</p></li>',
    '<li data-type="taskItem" data-checked="false"><p>대학 전달 완료</p></li>',
    "</ul>",
  ].join(""),
  fee_settlement: `<ul><li>전형료 총액: </li><li>정산 금액: </li><li>환불 건: </li><li>비고: </li></ul>`,
  invoice: `<ul><li>세금계산서 발행일: </li><li>금액: </li><li>발송 확인: </li></ul>`,
  submission: [
    '<ul data-type="taskList">',
    '<li data-type="taskItem" data-checked="false"><p>제출 자료 준비</p></li>',
    '<li data-type="taskItem" data-checked="false"><p>대학 제출 완료</p></li>',
    '<li data-type="taskItem" data-checked="false"><p>확인 회신 수령</p></li>',
    "</ul>",
  ].join(""),
  school_contact: `<ul><li>담당자: </li><li>연락처: </li><li>이메일: </li><li>담당 업무: </li></ul>`,
};

/* ══════════════════════════════════════════════════════════════
   타입 · 유틸
   ══════════════════════════════════════════════════════════════ */

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

function fmt(dateStr: string): string {
  const d = new Date(dateStr);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function toHtml(text: string): string {
  if (text.startsWith("<")) return text;
  return text
    .split("\n")
    .map((l) => (l.trim() === "" ? "<p></p>" : `<p>${l}</p>`))
    .join("");
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").trim();
}

function preview(html: string, max = 90) {
  const t = stripHtml(html);
  return t.length > max ? t.slice(0, max) + "..." : t;
}

/* ══════════════════════════════════════════════════════════════
   원형 진행률
   ══════════════════════════════════════════════════════════════ */

function ProgressRing({ filled, total }: { filled: number; total: number }) {
  const pct = total === 0 ? 0 : filled / total;
  const r = 40;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);
  const done = filled === total && total > 0;

  return (
    <div className="relative w-[104px] h-[104px] shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="5"
          className="text-surface-container-highest"
          stroke="currentColor"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          stroke={done ? "#22c55e" : "var(--color-primary)"}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            "text-2xl font-black tabular-nums leading-none",
            done ? "text-green-400" : "text-[var(--color-text)]",
          )}
        >
          {filled}
        </span>
        <span className="text-[10px] font-bold text-[var(--color-text-muted)] mt-0.5">
          / {total}
        </span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   퀵 점프 칩 바
   ══════════════════════════════════════════════════════════════ */

function QuickJump({
  logMap,
  activeKey,
  onJump,
}: {
  logMap: Map<string, WorkLog>;
  activeKey: string | null;
  onJump: (key: string) => void;
}) {
  return (
    <div
      className="flex items-center gap-1.5 overflow-x-auto pb-1"
      style={{ scrollbarWidth: "none" }}
    >
      {CATEGORIES.map((cat) => {
        const filled = logMap.has(cat.key);
        const active = activeKey === cat.key;
        return (
          <button
            key={cat.key}
            type="button"
            onClick={() => onJump(cat.key)}
            className={cn(
              "shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-[14px] text-[11px] font-bold transition-all",
              active
                ? "bg-primary text-on-primary shadow-neu-soft scale-[1.03]"
                : filled
                  ? "bg-primary/10 text-primary hover:bg-primary/15"
                  : "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]",
            )}
          >
            {filled ? (
              <IconCircleCheck size={12} />
            ) : (
              <IconCircleDashed size={12} />
            )}
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   카테고리 카드
   ══════════════════════════════════════════════════════════════ */

function CategoryCard({
  cat,
  log,
  isExpanded,
  isEditing,
  editContent,
  editorVersion,
  isPending,
  error,
  onToggle,
  onEdit,
  onEditWithTemplate,
  onCancel,
  onSave,
  onDelete,
  onEditorUpdate,
  onUseTemplate,
}: {
  cat: CatDef;
  log: WorkLog | undefined;
  isExpanded: boolean;
  isEditing: boolean;
  editContent: string;
  editorVersion: number;
  isPending: boolean;
  error: string | null;
  onToggle: () => void;
  onEdit: () => void;
  onEditWithTemplate: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
  onEditorUpdate: (html: string) => void;
  onUseTemplate: () => void;
}) {
  const CatIcon = cat.icon;
  const has = !!log;
  const tmpl = TEMPLATES[cat.key];

  return (
    <div
      id={`cat-${cat.key}`}
      className={cn(
        "rounded-[20px] border transition-all duration-300",
        isExpanded
          ? "border-primary/30 bg-[var(--color-surface)] shadow-neu-strong shadow-primary/5"
          : has
            ? "border-black/[0.04]/15 bg-[var(--color-surface)] hover:border-primary/20 hover:shadow-neu-soft"
            : "border-black/[0.04]/10 bg-[var(--color-surface)]/50 hover:border-black/[0.04]/20 hover:bg-[var(--color-surface)]",
      )}
    >
      {/* ── 헤더 (항상 표시) ── */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
      >
        {/* 상태 아이콘 */}
        <div
          className={cn(
            "w-9 h-9 rounded-[14px] flex items-center justify-center shrink-0 transition-colors",
            has ? "bg-primary/15" : "bg-[var(--color-surface)]",
          )}
        >
          <CatIcon
            size={17}
            className={cn(has ? "text-primary" : "text-[var(--color-text-muted)]/50")}
          />
        </div>

        {/* 라벨 + 미리보기 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-sm font-bold",
                has ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]",
              )}
            >
              {cat.label}
            </span>
            {has && (
              <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-bold">
                완료
              </span>
            )}
          </div>
          {has && !isExpanded && (
            <p className="text-xs text-[var(--color-text-muted)]/70 mt-0.5 truncate">
              {preview(log.content)}
            </p>
          )}
          {!has && !isExpanded && (
            <p className="text-[11px] text-[var(--color-text-muted)]/40 mt-0.5 italic">
              미작성
            </p>
          )}
        </div>

        {/* 타임스탬프 + 화살표 */}
        <div className="flex items-center gap-3 shrink-0">
          {has && (
            <span className="text-[10px] text-[var(--color-text-muted)]/50 tabular-nums hidden sm:block">
              {fmt(log.updated_at)}
            </span>
          )}
          <IconChevronDown
            size={16}
            className={cn(
              "text-[var(--color-text-muted)]/40 transition-transform duration-300",
              isExpanded && "rotate-180",
            )}
          />
        </div>
      </button>

      {/* ── 펼침 영역 (grid-rows 애니메이션) ── */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isExpanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 space-y-4">
            <div className="h-px bg-outline-variant/10" />

            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-[14px] bg-error/10 text-error text-xs font-medium">
                <IconAlertCircle size={16} /> {error}
              </div>
            )}

            {isEditing ? (
              /* ── 편집 모드 ── */
              <div className="space-y-3">
                <TiptapEditor
                  key={`edit-${cat.key}-${editorVersion}`}
                  content={editContent}
                  onUpdate={onEditorUpdate}
                  disabled={isPending}
                  placeholder={cat.placeholder}
                />
                <div className="flex items-center justify-between">
                  <div>
                    {!has && tmpl && (
                      <button
                        type="button"
                        onClick={onUseTemplate}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-[14px] text-xs font-bold text-tertiary bg-tertiary/10 hover:bg-tertiary/15 transition-colors"
                      >
                        <IconSparkles size={14} />
                        템플릿 채우기
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onCancel}
                      disabled={isPending}
                      className="px-4 py-2 rounded-[14px] bg-[var(--color-surface)] text-[var(--color-text-muted)] text-xs font-bold hover:bg-[var(--color-surface)] transition-colors disabled:opacity-50"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={onSave}
                      disabled={isPending}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-[14px] bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {isPending ? (
                        <IconLoader2 size={14} className="animate-spin" />
                      ) : (
                        <IconCheck size={14} />
                      )}
                      저장
                    </button>
                  </div>
                </div>
              </div>
            ) : has ? (
              /* ── 읽기 모드 ── */
              <div className="space-y-3">
                <div
                  className="tiptap rounded-[20px] bg-[var(--color-surface)]/30 border border-black/[0.04]/10 p-5 text-sm text-[var(--color-text)] leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: log.content.startsWith("<")
                      ? log.content
                      : toHtml(log.content),
                  }}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                    {log.author && (
                      <span className="flex items-center gap-1.5">
                        <IconUser size={13} /> {log.author}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <IconClock size={13} /> {fmt(log.updated_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={onEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[14px] bg-[var(--color-surface)] text-[var(--color-text-muted)] text-xs font-bold hover:bg-[var(--color-surface)] transition-colors"
                    >
                      <IconEdit size={14} /> 수정
                    </button>
                    <button
                      type="button"
                      onClick={onDelete}
                      disabled={isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[14px] text-xs font-semibold text-error hover:bg-error/10 transition-colors disabled:opacity-50"
                    >
                      <IconTrash size={14} /> 삭제
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ── 빈 상태 ── */
              <div className="space-y-4">
                {tmpl && (
                  <div className="rounded-[20px] border border-dashed border-black/[0.04]/20 bg-[var(--color-surface)]/20 p-4">
                    <p className="text-[10px] font-bold text-[var(--color-text-muted)]/50 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                      <IconSparkles size={12} /> 빠른 시작 템플릿
                    </p>
                    <div
                      className="tiptap text-xs text-[var(--color-text-muted)]/60 leading-relaxed [&_ul]:ml-4 [&_li]:mb-0.5"
                      dangerouslySetInnerHTML={{ __html: tmpl }}
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {tmpl && (
                    <button
                      type="button"
                      onClick={onEditWithTemplate}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-[14px] bg-primary/10 text-primary text-xs font-bold hover:bg-primary/15 transition-colors"
                    >
                      <IconSparkles size={14} />
                      템플릿으로 시작
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onEdit}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-[14px] bg-[var(--color-surface)] text-[var(--color-text-muted)] text-xs font-bold hover:bg-[var(--color-surface)] transition-colors"
                  >
                    <IconWriting size={14} />
                    직접 작성
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   메인 컴포넌트
   ══════════════════════════════════════════════════════════════ */

export default function WorkLogEditor({
  serviceId,
  workLogs,
}: WorkLogEditorProps) {
  const router = useRouter();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [editorVersion, setEditorVersion] = useState(0);

  const logMap = new Map(workLogs.map((l) => [l.category, l]));
  const filledCount = workLogs.length;

  /* ── 핸들러 ── */

  function scrollTo(key: string) {
    const el = document.getElementById(`cat-${key}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function handleToggle(key: string) {
    if (expandedKey === key) {
      setExpandedKey(null);
      setEditingKey(null);
      setEditContent("");
      setError(null);
    } else {
      setExpandedKey(key);
      setEditingKey(null);
      setEditContent("");
      setError(null);
    }
  }

  function handleEdit(key: string) {
    const log = logMap.get(key);
    setEditContent(toHtml(log?.content ?? ""));
    setEditingKey(key);
    setExpandedKey(key);
    setError(null);
  }

  function handleCancel() {
    setEditingKey(null);
    setEditContent("");
    setError(null);
  }

  function handleEditWithTemplate(key: string) {
    const t = TEMPLATES[key];
    setEditContent(t ?? "");
    setEditingKey(key);
    setExpandedKey(key);
    setEditorVersion((v) => v + 1);
    setError(null);
  }

  function handleUseTemplate(key: string) {
    const t = TEMPLATES[key];
    if (t) {
      setEditContent(t);
      setEditorVersion((v) => v + 1);
    }
  }

  const handleEditorUpdate = useCallback((html: string) => {
    setEditContent(html);
  }, []);

  function handleSave(key: string) {
    if (!stripHtml(editContent)) {
      setError("내용을 입력해주세요.");
      return;
    }
    startTransition(async () => {
      const res = await saveWorkLog(serviceId, key, editContent, "관리자");
      if (res.error) {
        setError(res.error);
      } else {
        setEditingKey(null);
        setEditContent("");
        setError(null);
        setSavedKey(key);
        setTimeout(() => setSavedKey(null), 2000);
        router.refresh();
      }
    });
  }

  function handleDelete(key: string) {
    const log = logMap.get(key);
    if (!log) return;
    startTransition(async () => {
      const res = await deleteWorkLog(log.id);
      if (res.error) {
        setError(res.error);
      } else {
        setEditingKey(null);
        setEditContent("");
        setError(null);
        router.refresh();
      }
    });
  }

  function handleJump(key: string) {
    setExpandedKey(key);
    setTimeout(() => scrollTo(key), 80);
  }

  /* ── 렌더링 ── */

  return (
    <div className="space-y-6">
      {/* ── 헤더: 진행률 오버뷰 ── */}
      <div className="flex items-center justify-between gap-6">
        <div className="space-y-1.5">
          <h2 className="text-lg font-black text-[var(--color-text)] tracking-tight">
            작업이력
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            {filledCount === CATEGORIES.length ? (
              <span className="text-green-400 font-bold">
                모든 항목이 작성되었습니다!
              </span>
            ) : (
              <>
                <span className="text-primary font-bold">{filledCount}개</span>{" "}
                작성 완료,{" "}
                <span className="font-bold">
                  {CATEGORIES.length - filledCount}개
                </span>{" "}
                남음
              </>
            )}
          </p>
          {/* 그룹별 미니 프로그레스 */}
          <div className="flex items-center gap-3 pt-1">
            {GROUPS.map((g) => {
              const cats = CATEGORIES.filter((c) => c.group === g.key);
              const done = cats.filter((c) => logMap.has(c.key)).length;
              return (
                <div key={g.key} className="flex items-center gap-1.5">
                  <div className={cn("w-1.5 h-1.5 rounded-full", g.accent)} />
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    {g.label}{" "}
                    <span className="font-bold tabular-nums">
                      {done}/{cats.length}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <ProgressRing filled={filledCount} total={CATEGORIES.length} />
      </div>

      {/* ── 퀵 점프 (sticky) ── */}
      <div className="sticky top-0 z-10 -mx-1 px-1 py-2 bg-surface/80 backdrop-blur-sm rounded-[20px]">
        <QuickJump
          logMap={logMap}
          activeKey={expandedKey}
          onJump={handleJump}
        />
      </div>

      {/* ── 카테고리 그룹 ── */}
      {GROUPS.map((group) => {
        const groupCats = CATEGORIES.filter((c) => c.group === group.key);
        const groupFilled = groupCats.filter((c) => logMap.has(c.key)).length;

        return (
          <div key={group.key} className="space-y-3">
            {/* 그룹 헤더 */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={cn("w-1 h-5 rounded-full", group.accent)} />
                <span className="text-xs font-black text-[var(--color-text-muted)] tracking-widest uppercase">
                  {group.label}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)]/50 tabular-nums font-bold">
                  {groupFilled}/{groupCats.length}
                </span>
              </div>
              <div className="flex-1 h-px bg-outline-variant/10" />
            </div>

            {/* 카테고리 카드 스택 */}
            <div className="space-y-2 ml-3">
              {groupCats.map((cat) => (
                <CategoryCard
                  key={cat.key}
                  cat={cat}
                  log={logMap.get(cat.key)}
                  isExpanded={expandedKey === cat.key}
                  isEditing={editingKey === cat.key}
                  editContent={editingKey === cat.key ? editContent : ""}
                  editorVersion={editorVersion}
                  isPending={isPending}
                  error={editingKey === cat.key ? error : null}
                  onToggle={() => handleToggle(cat.key)}
                  onEdit={() => handleEdit(cat.key)}
                  onEditWithTemplate={() => handleEditWithTemplate(cat.key)}
                  onCancel={handleCancel}
                  onSave={() => handleSave(cat.key)}
                  onDelete={() => handleDelete(cat.key)}
                  onEditorUpdate={handleEditorUpdate}
                  onUseTemplate={() => handleUseTemplate(cat.key)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* ── 저장 완료 토스트 ── */}
      {savedKey && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-[20px] bg-primary text-on-primary text-xs font-bold shadow-neu-strong"
          style={{ animation: "slideUp .3s ease-out" }}
        >
          <IconCheck size={16} />
          {CATEGORIES.find((c) => c.key === savedKey)?.label} 저장 완료
        </div>
      )}

      {/* toast 애니메이션 */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, 12px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}
