"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconChevronDown, IconCircleCheck, IconSend, IconNote, IconCheck, IconPlus, IconTrash, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { toggleOnboardingItem, addOnboardingMemoForOperator, addOnboardingTarget, removeOnboardingTarget } from "./actions";
import type { OnboardingProgressItem, OnboardingLog, OnboardingTarget } from "./actions";

interface Step {
  step: number;
  title: string;
  items: { key: string; label: string }[];
}

interface Profile { email: string; name: string }

interface OperatorManageProps {
  targets: OnboardingTarget[];
  steps: Step[];
  totalItemCount: number;
  operatorProgressMap: Record<string, OnboardingProgressItem[]>;
  operatorLogsMap: Record<string, OnboardingLog[]>;
  availableProfiles: Profile[];
}

export default function OperatorManage({ targets, steps, totalItemCount, operatorProgressMap, operatorLogsMap, availableProfiles }: OperatorManageProps) {
  const router = useRouter();
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [memo, setMemo] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addMentor, setAddMentor] = useState("");
  const [addStartDate, setAddStartDate] = useState("");
  const [addNote, setAddNote] = useState("");
  const [addError, setAddError] = useState("");

  const progress = selectedEmail ? operatorProgressMap[selectedEmail] ?? [] : [];
  const progressSet = new Set(progress.map((p) => p.item_key));

  function handleToggle(key: string, label: string, done: boolean) {
    if (!selectedEmail) return;
    startTransition(async () => {
      await toggleOnboardingItem(key, label, !done, selectedEmail);
      router.refresh();
    });
  }

  function handleAdd() {
    if (!addEmail) { setAddError("대상자를 선택해주세요."); return; }
    setAddError("");
    startTransition(async () => {
      const result = await addOnboardingTarget(addEmail, addMentor, addStartDate, addNote);
      if (result.error) setAddError(result.error);
      else { setShowAdd(false); setAddEmail(""); setAddMentor(""); setAddStartDate(""); setAddNote(""); router.refresh(); }
    });
  }

  function handleRemove(email: string) {
    if (!confirm("온보딩 대상에서 제거하시겠습니까? 진행 기록도 함께 삭제됩니다.")) return;
    startTransition(async () => {
      await removeOnboardingTarget(email);
      if (selectedEmail === email) setSelectedEmail(null);
      router.refresh();
    });
  }

  const targetEmails = new Set(targets.map((t) => t.user_email));
  const filteredProfiles = availableProfiles.filter((p) => !targetEmails.has(p.email));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--color-text-muted)]">온보딩 대상자 <span className="font-bold text-[var(--color-text)]">{targets.length}</span>명</p>
        <button type="button" onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-[14px] bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-colors">
          <IconPlus size={14} />
          대상자 추가
        </button>
      </div>

      {showAdd && (
        <div className="rounded-[20px] border border-black/[0.04]/15 bg-[var(--color-surface)] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[var(--color-text)]">온보딩 대상자 추가</h4>
            <button type="button" onClick={() => setShowAdd(false)} className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"><IconX size={16} /></button>
          </div>
          {addError && <p className="text-xs text-error font-medium">{addError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-1">대상자</label>
              <select value={addEmail} onChange={(e) => setAddEmail(e.target.value)} className="w-full bg-[var(--color-surface)] border-none rounded-[14px] px-3 py-2.5 text-sm text-[var(--color-text)] focus:ring-1 focus:ring-primary/50 focus:outline-none appearance-none cursor-pointer">
                <option value="">선택</option>
                {filteredProfiles.map((p) => <option key={p.email} value={p.email}>{p.name} ({p.email})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-1">사수 (멘토)</label>
              <input type="text" value={addMentor} onChange={(e) => setAddMentor(e.target.value)} placeholder="사수 이름" className="w-full bg-[var(--color-surface)] border-none rounded-[14px] px-3 py-2.5 text-sm text-[var(--color-text)] placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-1">교육 시작일</label>
              <input type="date" value={addStartDate} onChange={(e) => setAddStartDate(e.target.value)} className="w-full bg-[var(--color-surface)] border-none rounded-[14px] px-3 py-2.5 text-sm text-[var(--color-text)] focus:ring-1 focus:ring-primary/50 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-1">메모</label>
              <input type="text" value={addNote} onChange={(e) => setAddNote(e.target.value)} placeholder="비고" className="w-full bg-[var(--color-surface)] border-none rounded-[14px] px-3 py-2.5 text-sm text-[var(--color-text)] placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={handleAdd} disabled={isPending} className={cn("px-4 py-2.5 rounded-[14px] bg-primary text-on-primary text-xs font-bold", isPending && "opacity-60")}>{isPending ? "등록 중..." : "등록"}</button>
          </div>
        </div>
      )}

      {targets.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">등록된 온보딩 대상자가 없습니다.</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">&quot;대상자 추가&quot; 버튼으로 등록해주세요.</p>
        </div>
      ) : (
        <div className="rounded-[20px] border border-black/[0.04]/15 overflow-hidden">
          {targets.map((target, idx) => {
            const prog = operatorProgressMap[target.user_email] ?? [];
            const done = prog.length;
            const pct = totalItemCount > 0 ? Math.round((done / totalItemCount) * 100) : 0;
            const isSelected = selectedEmail === target.user_email;

            return (
              <div key={target.user_email}>
                <button type="button" onClick={() => { setSelectedEmail(isSelected ? null : target.user_email); setExpandedStep(null); }}
                  className={cn("w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors", idx > 0 && "border-t border-black/[0.04]/10", isSelected ? "bg-primary/5" : "hover:bg-[var(--color-surface)]/30")}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[var(--color-text)]">{target.name ?? target.user_email}</span>
                      {target.team && <span className="text-[10px] text-[var(--color-text-muted)]">{target.team}</span>}
                      {pct === 100 && <IconCircleCheck size={14} className="text-primary" />}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-[10px] text-[var(--color-text-muted)]">
                      {target.mentor && <span>사수: {target.mentor}</span>}
                      {target.start_date && <span>시작: {target.start_date}</span>}
                      {target.note && <span>{target.note}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2 w-28">
                      <div className="flex-1 h-1.5 bg-[var(--color-surface)] rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", pct === 100 ? "bg-primary" : pct > 0 ? "bg-tertiary" : "")} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] font-bold tabular-nums text-[var(--color-text-muted)] w-8 text-right">{pct}%</span>
                    </div>
                    <span className="text-[10px] font-bold tabular-nums text-[var(--color-text-muted)]">{done}/{totalItemCount}</span>
                    <IconChevronDown size={14} className={cn("text-[var(--color-text-muted)] transition-transform", isSelected && "rotate-180")} />
                  </div>
                </button>

                {isSelected && (
                  <div className="border-t border-black/[0.04]/10 bg-[var(--color-surface)]/30">
                    <div className="divide-y divide-outline-variant/5">
                      {steps.map((step) => {
                        const stepDone = step.items.filter((i) => progressSet.has(i.key)).length;
                        const isExp = expandedStep === step.step;
                        return (
                          <div key={step.step}>
                            <button type="button" onClick={() => setExpandedStep(isExp ? null : step.step)} className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-[var(--color-surface)]/50 transition-colors">
                              <div className="flex items-center gap-3">
                                <span className={cn("text-xs font-bold tabular-nums", stepDone === step.items.length ? "text-primary" : "text-[var(--color-text-muted)]")}>{stepDone}/{step.items.length}</span>
                                <span className="text-xs font-medium text-[var(--color-text)]">{step.title}</span>
                              </div>
                              <IconChevronDown size={14} className={cn("text-[var(--color-text-muted)] transition-transform", isExp && "rotate-180")} />
                            </button>
                            {isExp && (
                              <div className="px-5 pb-3 space-y-1.5">
                                {step.items.map((item) => {
                                  const itemDone = progressSet.has(item.key);
                                  return (
                                    <button key={item.key} type="button" disabled={isPending} onClick={() => handleToggle(item.key, item.label, itemDone)} className="w-full flex items-center gap-2.5 text-left group py-0.5">
                                      <div className={cn("w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors", itemDone ? "bg-primary border-primary" : "border-black/[0.04] group-hover:border-primary/50")}>
                                        {itemDone && <IconCheck size={10} className="text-on-primary" />}
                                      </div>
                                      <span className={cn("text-xs", itemDone ? "text-[var(--color-text-muted)] line-through" : "text-[var(--color-text)]")}>{item.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="px-5 py-4 border-t border-black/[0.04]/10">
                      <form onSubmit={(e) => { e.preventDefault(); if (!memo.trim() || !selectedEmail) return; startTransition(async () => { await addOnboardingMemoForOperator(selectedEmail, memo); setMemo(""); router.refresh(); }); }} className="flex items-center gap-2 mb-3">
                        <input type="text" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="메모 (교육 피드백, 특이사항 등)" className="flex-1 bg-[var(--color-surface)] border-none rounded-[14px] px-3 py-2 text-xs text-[var(--color-text)] placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none" />
                        <button type="submit" disabled={isPending || !memo.trim()} className="p-2 rounded-[14px] bg-primary text-on-primary hover:bg-primary/90 transition-colors disabled:opacity-40"><IconSend size={12} /></button>
                      </form>
                      {(() => {
                        const logs = selectedEmail ? (operatorLogsMap[selectedEmail] ?? []) : [];
                        if (logs.length === 0) return null;
                        return (
                          <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {logs.map((log: OnboardingLog) => {
                              const time = new Date(log.created_at);
                              const timeStr = time.toLocaleDateString("ko-KR", { month: "short", day: "numeric" }) + " " + time.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
                              return (
                                <div key={log.id} className="flex items-start gap-2">
                                  <div className={cn("w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5", log.action === "complete" ? "bg-primary/10" : log.action === "memo" ? "bg-tertiary/10" : "bg-[var(--color-surface)]")}>
                                    {log.action === "complete" ? <IconCircleCheck size={10} className="text-primary" /> : log.action === "memo" ? <IconNote size={10} className="text-tertiary" /> : <IconCheck size={10} className="text-[var(--color-text-muted)]" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    {log.action === "memo" ? <p className="text-[11px] text-[var(--color-text)]">{log.memo}</p> : <p className="text-[11px] text-[var(--color-text)]"><span className="font-medium">{log.item_label}</span> <span className="text-[var(--color-text-muted)]">{log.action === "complete" ? "완료" : "취소"}</span></p>}
                                    <p className="text-[9px] text-[var(--color-text-muted)] tabular-nums">{timeStr}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="px-5 py-3 border-t border-black/[0.04]/10 flex justify-end">
                      <button type="button" onClick={() => handleRemove(target.user_email)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[14px] text-xs font-medium text-error hover:bg-error/10 transition-colors">
                        <IconTrash size={12} />
                        대상자 제거
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
