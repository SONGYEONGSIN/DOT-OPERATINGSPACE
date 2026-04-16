"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useFormState } from "react-dom";
import { IconLoader2 } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { SubmitButton } from "@/components/common";
import { createClient } from "@/lib/supabase/client";
import { login, type AuthState } from "./actions";

const initialState: AuthState = {};

const OAUTH_ERRORS: Record<string, string> = {
  unauthorized_domain: "@jinhakapply.com 도메인만 로그인 가능합니다",
  auth_failed: "인증에 실패했습니다. 다시 시도해 주세요",
};

export default function LoginForm() {
  const [state, formAction] = useFormState(login, initialState);
  const [oauthLoading, setOauthLoading] = useState(false);
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");

  async function handleMicrosoftLogin() {
    setOauthLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        scopes: "openid profile email",
        redirectTo: `${window.location.origin}/callback`,
      },
    });
    if (error) setOauthLoading(false);
  }

  return (
    <form action={formAction}>
      {(state.error || oauthError) && (
        <div className="mb-6 p-3 rounded-[14px] bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 text-[var(--color-danger)] text-xs font-medium">
          {state.error || OAUTH_ERRORS[oauthError ?? ""] || oauthError}
        </div>
      )}

      {/* Microsoft OAuth */}
      <button
        type="button"
        onClick={handleMicrosoftLogin}
        disabled={oauthLoading}
        className={cn(
          "w-full mb-8 py-3.5 bg-[var(--color-surface)] text-[var(--color-text)] font-bold rounded-[14px] shadow-neu-soft active:shadow-neu-inset-soft transition-shadow flex items-center justify-center gap-3",
          oauthLoading && "opacity-60 cursor-not-allowed",
        )}
      >
        {oauthLoading ? (
          <>
            <IconLoader2
              size={16}
              className="animate-spin text-[var(--color-text-muted)]"
            />
            연결 중...
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              viewBox="0 0 23 23"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M11.4 24H0V12.6h11.4V24z" fill="#80bb03" />
              <path d="M24 24H12.6V12.6H24V24z" fill="#ffba08" />
              <path d="M11.4 11.4H0V0h11.4v11.4z" fill="#f35325" />
              <path d="M24 11.4H12.6V0H24v11.4z" fill="#05a6f0" />
            </svg>
            Microsoft로 계속하기
          </>
        )}
      </button>

      {/* Divider */}
      <div className="relative flex items-center justify-center mb-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-black/[0.04]" />
        </div>
        <span className="relative px-4 bg-[var(--color-surface)] text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase">
          또는 이메일로 로그인
        </span>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2">
            워크스페이스 이메일
          </label>
          <input
            name="email"
            type="email"
            placeholder="name@company.com"
            className={cn(
              "w-full bg-[var(--color-secondary)] border-none rounded-[14px]",
              "px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] shadow-neu-inset-soft",
              "focus:ring-1 focus:ring-[var(--color-primary)]/50 focus:outline-none transition-all",
              state.fieldErrors?.email &&
                "ring-1 ring-[var(--color-danger)]/50",
            )}
          />
          {state.fieldErrors?.email && (
            <p className="mt-1 text-xs text-[var(--color-danger)]">
              {state.fieldErrors.email}
            </p>
          )}
        </div>
        <div>
          <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2">
            비밀번호
          </label>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            className={cn(
              "w-full bg-[var(--color-secondary)] border-none rounded-[14px]",
              "px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] shadow-neu-inset-soft",
              "focus:ring-1 focus:ring-[var(--color-primary)]/50 focus:outline-none transition-all",
              state.fieldErrors?.password &&
                "ring-1 ring-[var(--color-danger)]/50",
            )}
          />
          {state.fieldErrors?.password && (
            <p className="mt-1 text-xs text-[var(--color-danger)]">
              {state.fieldErrors.password}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded-sm border-none bg-[var(--color-secondary)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] focus:ring-offset-0"
            />
            <span className="text-xs text-[var(--color-text-muted)]">
              로그인 유지
            </span>
          </label>
          <a
            href="/forgot-password"
            className="text-xs text-[var(--color-primary)] font-bold hover:underline"
          >
            비밀번호 찾기
          </a>
        </div>
        <SubmitButton loadingText="접속 중..." className="mt-4">
          시스템 접속
        </SubmitButton>
      </div>
    </form>
  );
}
