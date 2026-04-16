"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { IconCircleCheck, IconCircle, IconMail } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { SubmitButton } from "@/components/common";
import { register, type AuthState } from "./actions";

const initialState: AuthState = {};

const PASSWORD_RULES = [
  { label: "8자 이상", test: (v: string) => v.length >= 8 },
  { label: "영문 소문자", test: (v: string) => /[a-z]/.test(v) },
  { label: "영문 대문자", test: (v: string) => /[A-Z]/.test(v) },
  { label: "숫자", test: (v: string) => /[0-9]/.test(v) },
  { label: "특수문자", test: (v: string) => /[^a-zA-Z0-9]/.test(v) },
];

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const total = PASSWORD_RULES.length;
  const ratio = passed / total;

  return (
    <div className="mt-3 space-y-2">
      {/* Progress bar */}
      <div className="flex gap-1">
        {PASSWORD_RULES.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              i < passed
                ? ratio <= 0.4
                  ? "bg-error"
                  : ratio <= 0.8
                    ? "bg-tertiary-dim"
                    : "bg-primary"
                : "bg-[var(--color-surface)]",
            )}
          />
        ))}
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <div key={rule.label} className="flex items-center gap-1.5">
              {ok ? (
                <IconCircleCheck size={14} className={cn("transition-colors duration-200", "text-primary")} />
              ) : (
                <IconCircle size={14} className={cn("transition-colors duration-200", "text-[var(--color-text-faint)]")} />
              )}
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors duration-200",
                  ok ? "text-primary" : "text-[var(--color-text-muted)]",
                )}
              >
                {rule.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RegisterForm() {
  const [state, formAction] = useFormState(register, initialState);
  const [password, setPassword] = useState("");

  if (state.success) {
    return (
      <div className="py-8 text-center">
        <IconMail size={48} className="text-primary mb-4 mx-auto block" />
        <h3 className="text-lg font-bold mb-2">이메일을 확인해 주세요</h3>
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
          {state.success}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction}>
      {state.error && (
        <div className="mb-6 p-3 rounded-[14px] bg-error-container/20 border border-error/30 text-error text-xs font-medium">
          {state.error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2">
            이름
          </label>
          <input
            name="name"
            type="text"
            placeholder="홍길동"
            className={cn(
              "w-full bg-[var(--color-surface)] border-none rounded-[14px]",
              "px-4 py-3 text-[var(--color-text)] placeholder:text-outline",
              "focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all",
              state.fieldErrors?.name && "ring-1 ring-error/50",
            )}
          />
          {state.fieldErrors?.name && (
            <p className="mt-1 text-xs text-error">{state.fieldErrors.name}</p>
          )}
        </div>
        <div>
          <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2">
            워크스페이스 이메일
          </label>
          <input
            name="email"
            type="email"
            placeholder="name@jinhakapply.com"
            className={cn(
              "w-full bg-[var(--color-surface)] border-none rounded-[14px]",
              "px-4 py-3 text-[var(--color-text)] placeholder:text-outline",
              "focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all",
              state.fieldErrors?.email && "ring-1 ring-error/50",
            )}
          />
          {state.fieldErrors?.email && (
            <p className="mt-1 text-xs text-error">{state.fieldErrors.email}</p>
          )}
        </div>
        <div>
          <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2">
            비밀번호
          </label>
          <input
            name="password"
            type="password"
            placeholder="영문 대소문자 + 숫자 + 특수문자 8자 이상"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn(
              "w-full bg-[var(--color-surface)] border-none rounded-[14px]",
              "px-4 py-3 text-[var(--color-text)] placeholder:text-outline",
              "focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all",
              state.fieldErrors?.password && "ring-1 ring-error/50",
            )}
          />
          {state.fieldErrors?.password && (
            <p className="mt-1 text-xs text-error">
              {state.fieldErrors.password}
            </p>
          )}
          <PasswordStrength password={password} />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2">
            비밀번호 확인
          </label>
          <input
            name="confirmPassword"
            type="password"
            placeholder="비밀번호 재입력"
            className={cn(
              "w-full bg-[var(--color-surface)] border-none rounded-[14px]",
              "px-4 py-3 text-[var(--color-text)] placeholder:text-outline",
              "focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all",
              state.fieldErrors?.confirmPassword && "ring-1 ring-error/50",
            )}
          />
          {state.fieldErrors?.confirmPassword && (
            <p className="mt-1 text-xs text-error">
              {state.fieldErrors.confirmPassword}
            </p>
          )}
        </div>
        <SubmitButton loadingText="생성 중..." className="mt-4">
          계정 생성
        </SubmitButton>
      </div>
    </form>
  );
}
