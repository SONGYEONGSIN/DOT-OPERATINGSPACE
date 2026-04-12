"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { IconArrowLeft, IconLock, IconMail } from "@tabler/icons-react";
import { BrandLogo, SubmitButton, ThemeToggle } from "@/components/common";
import { forgotPassword, type AuthState } from "@/features/auth/actions";

const initialState: AuthState = {};

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState(forgotPassword, initialState);

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      {/* NavBar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/15 shadow-glow-strong">
        <div className="flex justify-between items-center h-16 px-6 w-full max-w-[1920px] mx-auto">
          <Link
            href="/login"
            className="flex items-center gap-2 text-xl font-black text-on-surface tracking-tighter uppercase"
          >
            <BrandLogo size="small" />
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <main className="pt-16 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Back */}
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors mb-8"
          >
            <IconArrowLeft size={18} />
            로그인으로 돌아가기
          </Link>

          <div className="bg-surface-container rounded-xl border border-outline-variant/15 overflow-hidden shadow-2xl">
            <div className="p-8">
              <div className="text-center mb-8">
                <IconLock size={36} className="text-primary mb-4 mx-auto block" />
                <h1 className="text-2xl font-black tracking-tighter mb-2">
                  비밀번호 찾기
                </h1>
                <p className="text-sm text-on-surface-variant">
                  등록된 이메일로 비밀번호 재설정 링크를 보내드립니다.
                </p>
              </div>

              {state.success ? (
                <div className="text-center py-4">
                  <IconMail size={48} className="text-primary mb-4 mx-auto block" />
                  <h3 className="text-lg font-bold mb-2">이메일 발송 완료</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                    {state.success}
                  </p>
                  <Link
                    href="/login"
                    className="inline-block bg-primary text-on-primary px-6 py-3 rounded-lg font-bold active:scale-95 transition-transform"
                  >
                    로그인으로 돌아가기
                  </Link>
                </div>
              ) : (
                <form action={formAction}>
                  {state.error && (
                    <div className="mb-6 p-3 rounded-lg bg-error-container/20 border border-error/30 text-error text-xs font-medium">
                      {state.error}
                    </div>
                  )}

                  <div className="mb-6">
                    <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">
                      워크스페이스 이메일
                    </label>
                    <input
                      name="email"
                      type="email"
                      placeholder="name@jinhakapply.com"
                      className={cn(
                        "w-full bg-surface-container-highest border-none rounded-lg",
                        "px-4 py-3 text-on-surface placeholder:text-outline",
                        "focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all",
                        state.fieldErrors?.email && "ring-1 ring-error/50",
                      )}
                    />
                    {state.fieldErrors?.email && (
                      <p className="mt-1 text-xs text-error">
                        {state.fieldErrors.email}
                      </p>
                    )}
                  </div>

                  <SubmitButton loadingText="발송 중...">
                    재설정 링크 발송
                  </SubmitButton>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
