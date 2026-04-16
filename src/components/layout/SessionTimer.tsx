"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/cn";

const SESSION_DURATION = 15 * 60; // 15분 (초)
const WARNING_THRESHOLD = 3 * 60; // 3분 남았을 때 경고

export default function SessionTimer() {
  const [remaining, setRemaining] = useState(SESSION_DURATION);
  const [showExtendModal, setShowExtendModal] = useState(false);

  const resetTimer = useCallback(() => {
    setRemaining(SESSION_DURATION);
    setShowExtendModal(false);
  }, []);

  // 사용자 활동 감지 시 타이머 리셋
  useEffect(() => {
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    let timeout: NodeJS.Timeout;

    function handleActivity() {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        resetTimer();
      }, 300);
    }

    events.forEach((e) => window.addEventListener(e, handleActivity));
    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity));
      clearTimeout(timeout);
    };
  }, [resetTimer]);

  // 카운트다운
  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          // 세션 만료 → 로그인 페이지로 이동
          window.location.href = "/login";
          return 0;
        }
        // 1분 남았을 때 연장 모달 표시
        if (prev === 60) {
          setShowExtendModal(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isWarning = remaining <= WARNING_THRESHOLD;

  return (
    <>
      <span
        className={cn(
          "flex items-center h-9 text-sm font-bold tabular-nums transition-colors",
          isWarning ? "text-error" : "text-[var(--color-text-muted)]",
        )}
        title="세션 남은 시간 (활동 시 자동 갱신)"
      >
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>

      {showExtendModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-[var(--color-surface)]est/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-[var(--color-surface)] rounded-[20px] border border-black/[0.04]/15 shadow-neu-strong animate-slide-up p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⏱</span>
            </div>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-2">세션 만료 예정</h2>
            <p className="text-sm text-[var(--color-text-muted)] mb-1">
              <span className="font-bold text-error tabular-nums">{remaining}초</span> 후 자동 로그아웃됩니다.
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mb-6">세션을 연장하시겠습니까?</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { window.location.href = "/login"; }}
                className="flex-1 py-3 bg-[var(--color-surface)] text-[var(--color-text-muted)] font-bold rounded-[14px] text-sm hover:bg-[var(--color-surface)] transition-colors"
              >
                로그아웃
              </button>
              <button
                type="button"
                onClick={resetTimer}
                className="flex-1 py-3 bg-primary text-on-primary font-bold rounded-[14px] text-sm hover:bg-primary/90 transition-colors"
              >
                세션 연장
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
