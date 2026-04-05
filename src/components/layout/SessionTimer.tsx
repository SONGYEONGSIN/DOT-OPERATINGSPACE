"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/cn";


const SESSION_DURATION = 15 * 60; // 15분 (초)
const WARNING_THRESHOLD = 3 * 60; // 3분 남았을 때 경고

export default function SessionTimer() {
  const [remaining, setRemaining] = useState(SESSION_DURATION);

  const resetTimer = useCallback(() => {
    setRemaining(SESSION_DURATION);
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
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isWarning = remaining <= WARNING_THRESHOLD;

  return (
    <span
      className={cn(
        "flex items-center h-9 text-sm font-bold tabular-nums transition-colors",
        isWarning ? "text-error" : "text-on-surface-variant",
      )}
      title="세션 남은 시간 (활동 시 자동 갱신)"
    >
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </span>
  );
}
