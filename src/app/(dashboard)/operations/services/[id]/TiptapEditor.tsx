"use client";

import { useEffect, useState, useCallback } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { cn } from "@/lib/cn";
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconHighlight,
  IconPalette,
  IconH1,
  IconH2,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconList,
  IconListNumbers,
  IconListCheck,
  IconBlockquote,
  IconCode,
  IconSeparator,
  IconLink,
  IconTable,
  IconSuperscript,
  IconSubscript,
  IconArrowBackUp,
  IconArrowForwardUp,
} from "@tabler/icons-react";

/* ── 툴바 버튼 ── */

function Btn({
  icon,
  label,
  isActive,
  onClick,
  disabled,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "p-1.5 rounded-md transition-colors disabled:opacity-40",
        isActive
          ? "bg-primary/15 text-primary"
          : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest",
        className,
      )}
    >
      {icon}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-4 bg-outline-variant/20 mx-1" />;
}

/* ── 색상 팔레트 ── */

const TEXT_COLORS = [
  { label: "기본", value: "" },
  { label: "빨강", value: "#ef4444" },
  { label: "주황", value: "#f97316" },
  { label: "노랑", value: "#eab308" },
  { label: "초록", value: "#22c55e" },
  { label: "파랑", value: "#3b82f6" },
  { label: "보라", value: "#a855f7" },
];

function ColorPicker({
  editor,
  onClose,
}: {
  editor: Editor;
  onClose: () => void;
}) {
  return (
    <div className="absolute top-full left-0 mt-1 z-50 bg-surface-container border border-outline-variant/15 rounded-lg shadow-xl p-2 flex gap-1">
      {TEXT_COLORS.map((c) => (
        <button
          key={c.value || "default"}
          type="button"
          title={c.label}
          onClick={() => {
            if (c.value) {
              editor.chain().focus().setColor(c.value).run();
            } else {
              editor.chain().focus().unsetColor().run();
            }
            onClose();
          }}
          className={cn(
            "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
            c.value
              ? "border-transparent"
              : "border-outline-variant/30 bg-on-surface",
          )}
          style={c.value ? { backgroundColor: c.value } : undefined}
        />
      ))}
    </div>
  );
}

/* ── 링크 입력 ── */

function LinkInput({
  editor,
  onClose,
}: {
  editor: Editor;
  onClose: () => void;
}) {
  const [url, setUrl] = useState(
    editor.getAttributes("link").href || "",
  );

  return (
    <div className="absolute top-full left-0 mt-1 z-50 bg-surface-container border border-outline-variant/15 rounded-lg shadow-xl p-3 flex gap-2 min-w-[300px]">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://..."
        className="flex-1 bg-surface-container-highest rounded-md px-3 py-1.5 text-xs text-on-surface border-none focus:outline-none focus:ring-1 focus:ring-primary/50"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (url) {
              editor
                .chain()
                .focus()
                .extendMarkRange("link")
                .setLink({ href: url })
                .run();
            }
            onClose();
          }
          if (e.key === "Escape") onClose();
        }}
      />
      <button
        type="button"
        onClick={() => {
          if (url) {
            editor
              .chain()
              .focus()
              .extendMarkRange("link")
              .setLink({ href: url })
              .run();
          } else {
            editor.chain().focus().unsetLink().run();
          }
          onClose();
        }}
        className="px-3 py-1.5 rounded-md bg-primary text-on-primary text-xs font-bold"
      >
        적용
      </button>
      {editor.isActive("link") && (
        <button
          type="button"
          onClick={() => {
            editor.chain().focus().unsetLink().run();
            onClose();
          }}
          className="px-3 py-1.5 rounded-md bg-error/10 text-error text-xs font-bold"
        >
          제거
        </button>
      )}
    </div>
  );
}

/* ── 테이블 삽입 ── */

function TableInsert({
  editor,
  onClose,
}: {
  editor: Editor;
  onClose: () => void;
}) {
  return (
    <div className="absolute top-full left-0 mt-1 z-50 bg-surface-container border border-outline-variant/15 rounded-lg shadow-xl p-3 space-y-2 min-w-[160px]">
      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
        테이블 삽입
      </p>
      {[
        { label: "2 x 2", rows: 2, cols: 2 },
        { label: "3 x 3", rows: 3, cols: 3 },
        { label: "3 x 4", rows: 3, cols: 4 },
        { label: "4 x 4", rows: 4, cols: 4 },
      ].map((opt) => (
        <button
          key={opt.label}
          type="button"
          onClick={() => {
            editor
              .chain()
              .focus()
              .insertTable({
                rows: opt.rows,
                cols: opt.cols,
                withHeaderRow: true,
              })
              .run();
            onClose();
          }}
          className="block w-full text-left px-3 py-1.5 rounded-md text-xs text-on-surface hover:bg-surface-container-highest transition-colors"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ── 메인 툴바 ── */

function EditorToolbar({ editor }: { editor: Editor }) {
  const [showColor, setShowColor] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [showTable, setShowTable] = useState(false);

  const closeAll = useCallback(() => {
    setShowColor(false);
    setShowLink(false);
    setShowTable(false);
  }, []);

  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-outline-variant/10 bg-surface-container-high/50 flex-wrap">
      {/* 텍스트 서식 */}
      <Btn
        icon={<IconBold size={16} />}
        label="굵게 (Ctrl+B)"
        isActive={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <Btn
        icon={<IconItalic size={16} />}
        label="기울임 (Ctrl+I)"
        isActive={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <Btn
        icon={<IconUnderline size={16} />}
        label="밑줄 (Ctrl+U)"
        isActive={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />
      <Btn
        icon={<IconStrikethrough size={16} />}
        label="취소선"
        isActive={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      />
      <Btn
        icon={<IconHighlight size={16} />}
        label="하이라이트"
        isActive={editor.isActive("highlight")}
        onClick={() => editor.chain().focus().toggleHighlight().run()}
      />

      <Sep />

      {/* 색상 */}
      <div className="relative">
        <Btn
          icon={<IconPalette size={16} />}
          label="글자 색상"
          onClick={() => {
            setShowColor(!showColor);
            setShowLink(false);
            setShowTable(false);
          }}
        />
        {showColor && <ColorPicker editor={editor} onClose={closeAll} />}
      </div>

      <Sep />

      {/* 제목 H2 / H3 */}
      <Btn
        icon={<IconH1 size={16} />}
        label="큰 제목"
        isActive={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <Btn
        icon={<IconH2 size={16} />}
        label="작은 제목"
        isActive={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      />

      <Sep />

      {/* 정렬 */}
      <Btn
        icon={<IconAlignLeft size={16} />}
        label="왼쪽 정렬"
        isActive={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      />
      <Btn
        icon={<IconAlignCenter size={16} />}
        label="가운데 정렬"
        isActive={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      />
      <Btn
        icon={<IconAlignRight size={16} />}
        label="오른쪽 정렬"
        isActive={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      />

      <Sep />

      {/* 목록 */}
      <Btn
        icon={<IconList size={16} />}
        label="목록"
        isActive={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <Btn
        icon={<IconListNumbers size={16} />}
        label="번호 목록"
        isActive={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <Btn
        icon={<IconListCheck size={16} />}
        label="체크리스트"
        isActive={editor.isActive("taskList")}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
      />

      <Sep />

      {/* 블록 */}
      <Btn
        icon={<IconBlockquote size={16} />}
        label="인용"
        isActive={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />
      <Btn
        icon={<IconCode size={16} />}
        label="코드 블록"
        isActive={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      />
      <Btn
        icon={<IconSeparator size={16} />}
        label="구분선"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      />

      {/* 링크 */}
      <div className="relative">
        <Btn
          icon={<IconLink size={16} />}
          label="링크"
          isActive={editor.isActive("link")}
          onClick={() => {
            setShowLink(!showLink);
            setShowColor(false);
            setShowTable(false);
          }}
        />
        {showLink && <LinkInput editor={editor} onClose={closeAll} />}
      </div>

      {/* 테이블 */}
      <div className="relative">
        <Btn
          icon={<IconTable size={16} />}
          label="테이블"
          onClick={() => {
            setShowTable(!showTable);
            setShowColor(false);
            setShowLink(false);
          }}
        />
        {showTable && <TableInsert editor={editor} onClose={closeAll} />}
      </div>

      <Sep />

      {/* 위첨자/아래첨자 */}
      <Btn
        icon={<IconSuperscript size={16} />}
        label="위 첨자"
        isActive={editor.isActive("superscript")}
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
      />
      <Btn
        icon={<IconSubscript size={16} />}
        label="아래 첨자"
        isActive={editor.isActive("subscript")}
        onClick={() => editor.chain().focus().toggleSubscript().run()}
      />

      <Sep />

      {/* Undo / Redo */}
      <Btn
        icon={<IconArrowBackUp size={16} />}
        label="실행 취소 (Ctrl+Z)"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      />
      <Btn
        icon={<IconArrowForwardUp size={16} />}
        label="다시 실행 (Ctrl+Y)"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      />
    </div>
  );
}

/* ── 에디터 본체 ── */

export default function TiptapEditor({
  content,
  onUpdate,
  disabled,
}: {
  content: string;
  onUpdate: (html: string) => void;
  disabled?: boolean;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Placeholder.configure({
        placeholder: "작업 내용을 입력하세요...",
      }),
      Highlight.configure({ multicolor: false }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-2 cursor-pointer",
        },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Subscript,
      Superscript,
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor: e }) => {
      onUpdate(e.getHTML());
    },
    editorProps: {
      attributes: {
        class: "tiptap min-h-[360px] p-5 text-sm text-on-surface leading-relaxed focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (editor && editor.isEditable === disabled) {
      editor.setEditable(!disabled);
    }
  }, [editor, disabled]);

  if (!editor) return null;

  return (
    <div className="rounded-lg border border-outline-variant/15 bg-surface-container-highest overflow-hidden">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
