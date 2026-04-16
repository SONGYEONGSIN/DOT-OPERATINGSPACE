"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { IconSearch, IconArrowRight, IconAlertCircle, IconCircleCheck, IconLoader2 } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { StepTimeline, UserAvatar, Card } from "@/components/common";
import { executeHandover } from "./actions";
import type { Service, Profile } from "./types";

interface HandoverFlowProps {
  services: Service[];
  profiles: Profile[];
  operatorCounts: Record<string, number>;
  onComplete: () => void;
}

type Step = 0 | 1 | 2 | 3;

function stripYear(name: string) {
  return name.replace(/\d{4}학년도\s*|\d{4}-(?=\d학기)/g, "");
}

export default function HandoverFlow({
  services,
  profiles,
  operatorCounts,
  onComplete,
}: HandoverFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [toPerson, setToPerson] = useState("");
  const [memo, setMemo] = useState("");
  const [search, setSearch] = useState("");
  const [fromFilter, setFromFilter] = useState("");
  const [receptionFilter, setReceptionFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [profileSearch, setProfileSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string; count?: number } | null>(null);

  const reset = useCallback(() => {
    setStep(0);
    setSelectedIds(new Set());
    setToPerson("");
    setMemo("");
    setSearch("");
    setFromFilter("");
    setReceptionFilter("");
    setCategoryFilter("");
    setProfileSearch("");
    setResult(null);
  }, []);

  const steps = [
    { label: "서비스 선택", status: step > 0 ? "completed" : step === 0 ? "active" : "pending" },
    { label: "인수자 선택", status: step > 1 ? "completed" : step === 1 ? "active" : "pending" },
    { label: "확인", status: step > 2 ? "completed" : step === 2 ? "active" : "pending" },
    { label: "완료", status: step === 3 ? "active" : "pending" },
  ] as const;

  // Step 0: 필터링
  const uniqueOperators = [...new Set(services.map((s) => s.operator).filter(Boolean))] as string[];
  const uniqueReceptionTypes = [...new Set(services.map((s) => s.reception_type).filter(Boolean))] as string[];
  const uniqueCategories = [...new Set(services.map((s) => s.category).filter(Boolean))] as string[];

  const filteredServices = services.filter((s) => {
    if (fromFilter && s.operator !== fromFilter) return false;
    if (receptionFilter && s.reception_type !== receptionFilter) return false;
    if (categoryFilter && s.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (s.university_name ?? "").toLowerCase().includes(q) ||
        (s.service_name ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const allFilteredSelected = filteredServices.length > 0 && filteredServices.every((s) => selectedIds.has(s.id));

  function toggleAll() {
    if (allFilteredSelected) {
      const next = new Set(selectedIds);
      filteredServices.forEach((s) => next.delete(s.id));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      filteredServices.forEach((s) => next.add(s.id));
      setSelectedIds(next);
    }
  }

  function toggleService(id: number) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  // Step 1: 프로필
  const activeProfiles = profiles
    .filter((p) => p.status === "active")
    .filter((p) => {
      if (!profileSearch) return true;
      return p.name.includes(profileSearch) || p.team.includes(profileSearch);
    });

  // Step 2: 선택된 서비스
  const selectedServices = services.filter((s) => selectedIds.has(s.id));

  function handleExecute() {
    startTransition(async () => {
      const res = await executeHandover([...selectedIds], "operator", toPerson, memo);
      if (res.success) {
        setResult({ success: true, count: res.updatedCount });
        setStep(3);
        router.refresh();
      } else {
        setResult({ error: res.error });
      }
    });
  }

  function handleCancel() {
    reset();
    onComplete();
  }

  return (
    <div className="space-y-6">
      {/* 스텝 타임라인 */}
      <Card className="px-6 py-4">
        <StepTimeline steps={steps as any} />
      </Card>

      {/* ── Step 0: 서비스 선택 ── */}
      {step === 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 relative min-w-[200px]">
              <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="대학명 또는 서비스명 검색..."
                className="search-input w-full pl-9 pr-4 py-2.5 rounded-[14px] text-sm text-[var(--color-text)] focus:outline-none"
              />
            </div>
            <select
              value={fromFilter}
              onChange={(e) => setFromFilter(e.target.value)}
              className="search-input rounded-[14px] px-4 py-2.5 text-sm text-[var(--color-text)] focus:outline-none appearance-none min-w-[120px]"
            >
              <option value="">전체 운영자</option>
              {uniqueOperators.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select
              value={receptionFilter}
              onChange={(e) => setReceptionFilter(e.target.value)}
              className="search-input rounded-[14px] px-4 py-2.5 text-sm text-[var(--color-text)] focus:outline-none appearance-none min-w-[120px]"
            >
              <option value="">전체 접수구분</option>
              {uniqueReceptionTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="search-input rounded-[14px] px-4 py-2.5 text-sm text-[var(--color-text)] focus:outline-none appearance-none min-w-[100px]"
            >
              <option value="">전체 카테고리</option>
              {uniqueCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-[var(--color-text-muted)] tabular-nums">
              총{" "}
              <span className="font-bold text-[var(--color-text)]">{filteredServices.length.toLocaleString()}</span>
              건{selectedIds.size > 0 && (
                <> · <span className="font-bold text-primary">{selectedIds.size}</span>건 선택됨</>
              )}
            </div>
            <Card className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--color-surface)]/50">
                  <th className="w-10 px-3 py-2.5">
                    <input type="checkbox" checked={allFilteredSelected} onChange={toggleAll} className="accent-primary w-4 h-4" />
                  </th>
                  <th className="text-left text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-3">대학명</th>
                  <th className="text-left text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-3">서비스명</th>
                  <th className="text-left text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-3 w-[100px]">현재 운영자</th>
                  <th className="text-left text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-3 w-[90px]">접수구분</th>
                  <th className="text-left text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-3 w-[80px]">카테고리</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.slice(0, 100).map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => toggleService(s.id)}
                    className={cn(
                      "border-t border-black/[0.04]/5 cursor-pointer transition-colors",
                      selectedIds.has(s.id) ? "bg-primary/5" : "hover:bg-[var(--color-surface)]/30",
                    )}
                  >
                    <td className="px-3 py-2">
                      <input type="checkbox" checked={selectedIds.has(s.id)} onChange={() => toggleService(s.id)} className="accent-primary w-4 h-4" />
                    </td>
                    <td className="px-3 py-2 text-sm text-[var(--color-text)]">{s.university_name ?? "-"}</td>
                    <td className="px-3 py-2 text-sm text-[var(--color-text-muted)]">{stripYear(s.service_name ?? "-")}</td>
                    <td className="px-3 py-2 text-xs text-[var(--color-text-muted)]">{s.operator ?? "미배정"}</td>
                    <td className="px-3 py-2 text-xs text-[var(--color-text-muted)]">{s.reception_type ?? "-"}</td>
                    <td className="px-3 py-2 text-xs text-[var(--color-text-muted)]">{s.category ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredServices.length > 100 && (
              <div className="px-4 py-2 text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)]/30 text-center">
                검색/필터를 사용하여 범위를 좁혀주세요 (총 {filteredServices.length}건)
              </div>
            )}
            {filteredServices.length === 0 && (
              <div className="px-4 py-8 text-sm text-[var(--color-text-muted)] text-center">
                조건에 맞는 서비스가 없습니다.
              </div>
            )}
            </Card>
          </div>
        </div>
      )}

      {/* ── Step 1: 인수자 선택 ── */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="relative">
            <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={profileSearch}
              onChange={(e) => setProfileSearch(e.target.value)}
              placeholder="이름 또는 팀 검색..."
              className="search-input w-full pl-9 pr-4 py-2.5 rounded-[14px] text-sm text-[var(--color-text)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {activeProfiles.map((p) => {
              const isSelected = toPerson === p.name;
              const currentCount = operatorCounts[p.name] ?? 0;

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setToPerson(p.name)}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-[20px] border-2 transition-all text-left",
                    isSelected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-black/[0.04]/10 bg-[var(--color-surface)]/30 hover:border-black/[0.04]/30",
                  )}
                >
                  <UserAvatar name={p.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[var(--color-text)] truncate">{p.name}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">{p.team} · {p.role === "admin" ? "관리자" : "운영자"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-[var(--color-text)] tabular-nums">{currentCount}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">현재 담당</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Step 2: 확인 ── */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-primary tabular-nums">{selectedIds.size}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">선택 서비스</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-sm font-bold text-[var(--color-text)]">운영자</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">인수인계 유형</p>
            </Card>
            <Card className="p-4 text-center flex flex-col items-center justify-center">
              <div className="flex items-center gap-2">
                <UserAvatar name={toPerson} size="sm" />
                <p className="text-sm font-bold text-[var(--color-text)]">{toPerson}</p>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">인수자</p>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--color-surface)]/50">
                  <th className="text-left text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-3">대학명</th>
                  <th className="text-left text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-3">서비스명</th>
                  <th className="text-left text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-3 w-[200px]">변경 내용</th>
                </tr>
              </thead>
              <tbody>
                {selectedServices.slice(0, 20).map((s) => (
                  <tr key={s.id} className="border-t border-black/[0.04]/5">
                    <td className="px-4 py-2 text-sm text-[var(--color-text)]">{s.university_name ?? "-"}</td>
                    <td className="px-4 py-2 text-sm text-[var(--color-text-muted)]">{stripYear(s.service_name ?? "-")}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[var(--color-text-muted)]">{s.operator ?? "미배정"}</span>
                        <IconArrowRight size={14} className="text-primary" />
                        <span className="font-bold text-primary">{toPerson}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {selectedServices.length > 20 && (
              <div className="px-4 py-2 text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)]/30 text-center">
                외 {selectedServices.length - 20}건
              </div>
            )}
          </Card>

          <div>
            <label className="block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2">
              인수인계 사유 / 메모 (선택)
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="인수인계 사유를 입력하세요..."
              rows={6}
              className="w-full p-4 bg-[var(--color-surface)] rounded-[14px] text-sm text-[var(--color-text)] border-none placeholder:text-[var(--color-text-muted)]/50 resize-none overflow-y-auto max-h-[200px] focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>

          {result?.error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-[14px] bg-error/10 text-error text-xs font-medium">
              <IconAlertCircle size={16} />
              {result.error}
            </div>
          )}
        </div>
      )}

      {/* ── Step 3: 완료 ── */}
      {step === 3 && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <IconCircleCheck size={30} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">인수인계 완료</h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-1">
              <span className="font-bold text-primary">{result?.count}건</span>의 서비스가
              <span className="font-bold text-[var(--color-text)]"> {toPerson}</span>에게 인수인계되었습니다.
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">이력은 하단 인수인계 이력에서 확인할 수 있습니다.</p>
          </div>
        </Card>
      )}

      {/* 하단 네비게이션 */}
      <div className="flex items-center justify-between">
        <div />

        <div className="flex items-center gap-3">
          {step < 3 && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-[14px] bg-[var(--color-surface)] text-[var(--color-text-muted)] text-sm font-bold transition-colors hover:bg-[var(--color-surface)]"
            >
              취소
            </button>
          )}
          {step > 0 && step < 3 && (
            <button
              type="button"
              onClick={() => setStep((step - 1) as Step)}
              className="px-5 py-2.5 rounded-[14px] bg-[var(--color-surface)] text-[var(--color-text-muted)] text-sm font-bold transition-colors hover:bg-[var(--color-surface)]"
            >
              이전
            </button>
          )}
          {step === 0 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={selectedIds.size === 0}
              className="px-5 py-2.5 rounded-[14px] bg-primary text-on-primary text-sm font-bold transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              다음: 인수자 선택
            </button>
          )}
          {step === 1 && (
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!toPerson}
              className="px-5 py-2.5 rounded-[14px] bg-primary text-on-primary text-sm font-bold transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              다음: 확인
            </button>
          )}
          {step === 2 && (
            <button
              type="button"
              onClick={handleExecute}
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-[14px] bg-primary text-on-primary text-sm font-bold transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {isPending && <IconLoader2 size={16} className="animate-spin" />}
              인수인계 실행
            </button>
          )}
          {step === 3 && (
            <button
              type="button"
              onClick={() => { reset(); onComplete(); }}
              className="px-5 py-2.5 rounded-[14px] bg-primary text-on-primary text-sm font-bold transition-colors hover:bg-primary/90"
            >
              현황으로 돌아가기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
