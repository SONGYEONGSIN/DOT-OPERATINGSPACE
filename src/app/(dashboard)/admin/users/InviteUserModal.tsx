"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconX, IconCircleCheck } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/client";

const TEAMS = ["운영1팀", "운영2팀"] as const;
const ROLES = [
  { value: "operator", label: "운영자" },
  { value: "admin", label: "관리자" },
] as const;

export default function InviteUserModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string).trim();
    const email = (formData.get("email") as string).trim();
    const role = formData.get("role") as string;
    const team = formData.get("team") as string;

    if (!name || !email) {
      setError("이름과 이메일을 입력해 주세요");
      return;
    }

    if (!email.endsWith("@jinhakapply.com") && !email.endsWith("@jinhak.com")) {
      setError("@jinhakapply.com 또는 @jinhak.com 이메일만 등록 가능합니다");
      return;
    }

    const supabase = createClient();
    const { error: dbError } = await supabase.from("profiles").insert({
      name,
      email,
      role,
      team,
      status: "active",
    });

    if (dbError) {
      if (dbError.message.includes("duplicate")) {
        setError("이미 등록된 이메일입니다");
      } else {
        setError("등록에 실패했습니다. 다시 시도해 주세요");
      }
      return;
    }

    setSuccess(true);
    startTransition(() => {
      router.refresh();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[var(--color-surface)]est/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[var(--color-surface)] rounded-[20px] border border-black/[0.04]/15 shadow-neu-strong animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.04]/10">
          <h2 className="text-lg font-bold text-[var(--color-text)]">사용자 초대</h2>
          <button
            onClick={onClose}
            className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors rounded-[14px]"
          >
            <IconX size={20} />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <IconCircleCheck size={48} className="text-primary mb-3" />
            <p className="font-bold text-[var(--color-text)]">등록 완료!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-[14px] bg-error-container/20 border border-error/30 text-error text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2">
                이름
              </label>
              <input
                name="name"
                type="text"
                placeholder="홍길동"
                required
                className="w-full bg-[var(--color-surface)] border-none rounded-[14px] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2">
                이메일
              </label>
              <input
                name="email"
                type="email"
                placeholder="name@jinhakapply.com"
                required
                className="w-full bg-[var(--color-surface)] border-none rounded-[14px] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2">
                역할
              </label>
              <select
                name="role"
                defaultValue="operator"
                className="w-full bg-[var(--color-surface)] border-none rounded-[14px] px-4 py-3 text-sm text-[var(--color-text)] focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all appearance-none"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2">
                팀
              </label>
              <select
                name="team"
                defaultValue="운영1팀"
                className="w-full bg-[var(--color-surface)] border-none rounded-[14px] px-4 py-3 text-sm text-[var(--color-text)] focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all appearance-none"
              >
                {TEAMS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-[var(--color-surface)] text-[var(--color-text-muted)] font-bold rounded-[14px] active:scale-95 transition-transform text-sm"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isPending}
                className={cn(
                  "flex-1 py-3 bg-primary text-on-primary font-bold rounded-[14px] active:scale-95 transition-transform text-sm glow-primary",
                  isPending && "opacity-60 cursor-not-allowed",
                )}
              >
                {isPending ? "등록 중..." : "초대하기"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
