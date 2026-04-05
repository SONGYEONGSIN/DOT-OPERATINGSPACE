"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { IconPlus, IconTrash, IconCircleCheck, IconLoader2 } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { Card, DateRangePicker, UserAvatar } from "@/components/common";
import { createBackupRequest } from "./actions";
import { LEAVE_TYPES } from "./types";

const TiptapEditor = dynamic(
  () => import("@/app/(dashboard)/operations/services/[id]/TiptapEditor"),
  { ssr: false, loading: () => <div className="min-h-[160px] rounded-lg bg-surface-container-highest animate-pulse" /> },
);

interface Profile {
  id: number;
  name: string;
  team: string;
}

interface BackupItem {
  id: number;
  backupPerson: string;
  content: string;
}

let itemIdCounter = 1;

export default function BackupForm({
  profiles,
  onComplete,
}: {
  profiles: Profile[];
  onComplete: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [operatorName, setOperatorName] = useState("");
  const [leaveType, setLeaveType] = useState("연차");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [items, setItems] = useState<BackupItem[]>([
    { id: itemIdCounter++, backupPerson: "", content: "" },
  ]);

  const selectedProfile = profiles.find((p) => p.name === operatorName);
  const otherProfiles = profiles.filter((p) => p.name !== operatorName);

  function addItem() {
    setItems([...items, { id: itemIdCounter++, backupPerson: "", content: "" }]);
  }

  function removeItem(id: number) {
    if (items.length <= 1) return;
    setItems(items.filter((i) => i.id !== id));
  }

  function updateItemPerson(id: number, person: string) {
    setItems(items.map((i) => (i.id === id ? { ...i, backupPerson: person } : i)));
  }

  function updateItemContent(id: number, content: string) {
    setItems(items.map((i) => (i.id === id ? { ...i, content } : i)));
  }

  function handleSubmit() {
    setError("");
    if (!operatorName) { setError("요청자를 선택해주세요."); return; }
    if (!startDate || !endDate) { setError("기간을 선택해주세요."); return; }

    const validItems = items.filter((i) => i.backupPerson);
    if (validItems.length === 0) { setError("백업자를 1명 이상 선택해주세요."); return; }

    const opsBackupName = validItems[0].backupPerson;
    const combinedContent = validItems
      .map((i) => {
        const header = validItems.length > 1 ? `<h3>백업자: ${i.backupPerson}</h3>` : "";
        return header + i.content;
      })
      .join("<hr/>");

    startTransition(async () => {
      const result = await createBackupRequest(
        operatorName,
        selectedProfile?.team ?? "",
        leaveType,
        startDate,
        endDate,
        opsBackupName,
        "",
        combinedContent,
        "",
      );
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        router.refresh();
        setTimeout(() => { setSuccess(false); onComplete(); }, 1500);
      }
    });
  }

  if (success) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <IconCircleCheck size={30} className="text-primary" />
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-2">백업 요청 완료</h3>
          <p className="text-sm text-on-surface-variant">백업 현황에서 확인할 수 있습니다.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-error-container/20 border border-error/30 text-error text-xs font-medium">{error}</div>
      )}

      {/* 기본 정보 */}
      <Card className="p-6">
        <h3 className="text-sm font-bold text-on-surface mb-4">기본 정보</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">요청자</label>
            <select
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/50 focus:outline-none appearance-none"
            >
              <option value="">선택</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.name}>{p.name} ({p.team})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">휴가(외근) 유형</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/50 focus:outline-none appearance-none"
            >
              {LEAVE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.value}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">휴가(외근) 기간</label>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChangeStart={setStartDate}
              onChangeEnd={setEndDate}
              placeholder="시작일 → 종료일 선택"
            />
          </div>
        </div>

        {/* 선택된 요청자 정보 */}
        {selectedProfile && (
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-outline-variant/10">
            <UserAvatar name={selectedProfile.name} size="sm" />
            <div>
              <p className="text-sm font-bold text-on-surface">{selectedProfile.name}</p>
              <p className="text-xs text-on-surface-variant">{selectedProfile.team}</p>
            </div>
            {startDate && endDate && (
              <div className="ml-auto text-right">
                <p className="text-xs text-on-surface-variant">{leaveType}</p>
                <p className="text-xs text-on-surface tabular-nums">{startDate} → {endDate}</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* 백업 항목 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-on-surface">백업 내용</h3>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-primary hover:bg-primary/10 transition-colors"
          >
            <IconPlus size={14} />
            백업 항목 추가
          </button>
        </div>

        {items.map((item, idx) => (
          <Card key={item.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-on-surface-variant">
                {items.length > 1 ? `항목 ${idx + 1}` : ""}
              </span>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                >
                  <IconTrash size={12} />
                  삭제
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">백업자</label>
                <select
                  value={item.backupPerson}
                  onChange={(e) => updateItemPerson(item.id, e.target.value)}
                  className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/50 focus:outline-none appearance-none"
                >
                  <option value="">선택</option>
                  {otherProfiles.map((p) => (
                    <option key={p.id} value={p.name}>{p.name} ({p.team})</option>
                  ))}
                </select>
              </div>

              {item.backupPerson && (
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/5">
                  <UserAvatar name={item.backupPerson} size="sm" />
                  <div>
                    <p className="text-sm font-bold text-on-surface">{item.backupPerson}</p>
                    <p className="text-xs text-on-surface-variant">
                      {otherProfiles.find((p) => p.name === item.backupPerson)?.team}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">백업 내용</label>
                <TiptapEditor
                  key={`form-${item.id}`}
                  content={item.content}
                  onUpdate={(html) => updateItemContent(item.id, html)}
                  disabled={isPending}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 하단 버튼 */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onComplete}
          className="px-6 py-2.5 rounded-lg bg-surface-container-high text-on-surface-variant text-sm font-bold transition-colors hover:bg-surface-container-highest"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-bold transition-colors hover:bg-primary/90",
            isPending && "opacity-60 cursor-not-allowed",
          )}
        >
          {isPending && <IconLoader2 size={16} className="animate-spin" />}
          요청하기
        </button>
      </div>
    </div>
  );
}
