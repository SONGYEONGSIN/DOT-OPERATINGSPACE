"use client";

import { Suspense, useState } from "react";
import { cn } from "@/lib/cn";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthCard() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  return (
    <div className="max-w-md mx-auto relative z-10">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black tracking-tighter mb-2 text-[var(--color-text)]">
          시작할 준비가 되셨나요?
        </h2>
        <p className="text-[var(--color-text-muted)] text-sm">
          지금 Orchestrator System의 파트너가 되어 보안 수준을 높이세요.
        </p>
      </div>

      {/* Card */}
      <div className="bg-[var(--color-surface)] rounded-[20px] overflow-hidden shadow-neu-strong">
        {/* Tabs */}
        <div className="flex border-b border-black/[0.04]">
          <button
            onClick={() => setActiveTab("login")}
            className={cn(
              "flex-1 py-4 text-sm font-bold border-b-2 transition-colors",
              activeTab === "login"
                ? "border-[var(--color-primary)] text-[var(--color-text)] shadow-neu-inset-soft"
                : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
            )}
          >
            로그인
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={cn(
              "flex-1 py-4 text-sm font-bold border-b-2 transition-colors",
              activeTab === "register"
                ? "border-[var(--color-primary)] text-[var(--color-text)] shadow-neu-inset-soft"
                : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
            )}
          >
            계정 생성
          </button>
        </div>

        {/* Form Body */}
        <div className="p-8">
          <Suspense
            fallback={
              <div className="py-8 text-center text-[var(--color-text-muted)] text-sm">
                로딩 중...
              </div>
            }
          >
            {activeTab === "login" ? <LoginForm /> : <RegisterForm />}
          </Suspense>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-[var(--color-text-muted)]">
        도움이 필요하신가요?{" "}
        <a href="#" className="text-[var(--color-primary)] hover:underline">
          기술 지원 센터
        </a>
        에 문의하세요.
      </p>
    </div>
  );
}
