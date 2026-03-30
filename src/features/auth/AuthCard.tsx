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
        <h2 className="text-3xl font-black tracking-tighter mb-2">
          시작할 준비가 되셨나요?
        </h2>
        <p className="text-on-surface-variant text-sm">
          지금 DOT.의 파트너가 되어 보안 수준을 높이세요.
        </p>
      </div>

      {/* Card */}
      <div className="bg-surface-container rounded-xl border border-outline-variant/15 overflow-hidden shadow-2xl">
        {/* Tabs */}
        <div className="flex border-b border-outline-variant/15">
          <button
            onClick={() => setActiveTab("login")}
            className={cn(
              "flex-1 py-4 text-sm font-bold border-b-2 transition-colors",
              activeTab === "login"
                ? "border-primary text-on-surface bg-surface-container-high"
                : "border-transparent text-on-surface-variant hover:text-on-surface",
            )}
          >
            로그인
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={cn(
              "flex-1 py-4 text-sm font-bold border-b-2 transition-colors",
              activeTab === "register"
                ? "border-primary text-on-surface bg-surface-container-high"
                : "border-transparent text-on-surface-variant hover:text-on-surface",
            )}
          >
            계정 생성
          </button>
        </div>

        {/* Form Body */}
        <div className="p-8">
          <Suspense fallback={<div className="py-8 text-center text-on-surface-variant text-sm">로딩 중...</div>}>
            {activeTab === "login" ? <LoginForm /> : <RegisterForm />}
          </Suspense>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-on-surface-variant">
        도움이 필요하신가요?{" "}
        <a href="#" className="text-primary hover:underline">
          기술 지원 센터
        </a>
        에 문의하세요.
      </p>
    </div>
  );
}
