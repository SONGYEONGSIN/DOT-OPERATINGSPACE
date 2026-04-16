"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconSend } from "@tabler/icons-react";
import { addOnboardingMemo } from "./actions";

export default function OnboardingMemo() {
  const router = useRouter();
  const [memo, setMemo] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!memo.trim()) return;
    startTransition(async () => {
      await addOnboardingMemo(memo);
      setMemo("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="메모를 남겨보세요... (질문, 어려운 점, 느낀 점 등)"
        className="flex-1 bg-[var(--color-surface)] border-none rounded-[14px] px-4 py-2.5 text-sm text-[var(--color-text)] placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none"
      />
      <button
        type="submit"
        disabled={isPending || !memo.trim()}
        className="p-2.5 rounded-[14px] bg-primary text-on-primary hover:bg-primary/90 transition-colors disabled:opacity-40"
      >
        <IconSend size={16} />
      </button>
    </form>
  );
}
