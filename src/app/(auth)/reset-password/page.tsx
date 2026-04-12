"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { IconLock } from "@tabler/icons-react";
import { BrandLogo, SubmitButton, ThemeToggle } from "@/components/common";
import { resetPassword, type AuthState } from "@/features/auth/actions";

const initialState: AuthState = {};

export default function ResetPasswordPage() {
  const [state, formAction] = useFormState(resetPassword, initialState);

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
          <div className="bg-surface-container rounded-xl border border-outline-variant/15 overflow-hidden shadow-2xl">
            <div className="p-8">
              <div className="text-center mb-8">
                <IconLock size={36} className="text-primary mb-4 mx-auto block" />
                <h1 className="text-2xl font-black tracking-tighter mb-2">
                  새 비밀번호 설정
                </h1>
                <p className="text-sm text-on-surface-variant">
                  새로운 비밀번호를 입력해 주세요.
                </p>
              </div>

              <form action={formAction}>
                {state.error && (
                  <div className="mb-6 p-3 rounded-lg bg-error-container/20 border border-error/30 text-error text-xs font-medium">
                    {state.error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">
                      새 비밀번호
                    </label>
                    <input
                      name="password"
                      type="password"
                      placeholder="6자 이상 입력"
                      className={cn(
                        "w-full bg-surface-container-highest border-none rounded-lg",
                        "px-4 py-3 text-on-surface placeholder:text-outline",
                        "focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all",
                        state.fieldErrors?.password && "ring-1 ring-error/50",
                      )}
                    />
                    {state.fieldErrors?.password && (
                      <p className="mt-1 text-xs text-error">
                        {state.fieldErrors.password}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">
                      비밀번호 확인
                    </label>
                    <input
                      name="confirmPassword"
                      type="password"
                      placeholder="비밀번호 재입력"
                      className={cn(
                        "w-full bg-surface-container-highest border-none rounded-lg",
                        "px-4 py-3 text-on-surface placeholder:text-outline",
                        "focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all",
                        state.fieldErrors?.confirmPassword &&
                          "ring-1 ring-error/50",
                      )}
                    />
                    {state.fieldErrors?.confirmPassword && (
                      <p className="mt-1 text-xs text-error">
                        {state.fieldErrors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <SubmitButton loadingText="변경 중..." className="mt-2">
                    비밀번호 변경
                  </SubmitButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
