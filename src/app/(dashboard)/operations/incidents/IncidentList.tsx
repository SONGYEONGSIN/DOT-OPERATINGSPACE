"use client";

import { useState } from "react";
import { StatusBadge, UserAvatar } from "@/components/common";
import IncidentDetail from "./IncidentDetail";

interface Incident {
  id: number;
  title: string;
  incident_date: string;
  university: string | null;
  category: string | null;
  department: string | null;
  reporter: string;
  assignee: string | null;
  severity: string;
  status: string;
  background: string | null;
  cause: string | null;
  resolution: string | null;
  prevention: string | null;
  created_at: string;
}

interface IncidentListProps {
  incidents: Incident[];
  profiles: { name: string }[];
}

const statusVariant: Record<string, "success" | "warning" | "info" | "neutral" | "error"> = {
  "처리완료": "success",
  "할 일": "neutral",
  "진행 중": "info",
  "보류": "warning",
  "처리예정": "info",
  "테스트": "neutral",
  "거절": "error",
};

export default function IncidentList({ incidents, profiles }: IncidentListProps) {
  const [selected, setSelected] = useState<Incident | null>(null);

  return (
    <>
      <table className="w-full">
        <thead>
          <tr className="bg-[var(--color-surface)]/50">
            <th className="text-left text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-5 py-3 w-[8%]">분류</th>
            <th className="text-left text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-5 py-3">요약</th>
            <th className="text-left text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-5 py-3 w-[12%]">대학교</th>
            <th className="text-left text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-5 py-3 w-[8%]">담당자</th>
            <th className="text-left text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-5 py-3 w-[8%]">보고자</th>
            <th className="text-left text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-5 py-3 w-[8%]">상태</th>
            <th className="text-left text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-5 py-3 w-[8%]">날짜</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((inc) => (
            <tr
              key={inc.id}
              onClick={() => setSelected(inc)}
              className="border-t border-black/[0.04]/5 cursor-pointer hover:bg-[var(--color-surface)]/30 transition-colors"
            >
              <td className="px-5 py-3">
                <span className="text-xs font-medium text-[var(--color-text-muted)] bg-[var(--color-surface)] rounded-md px-2 py-0.5">
                  {inc.category ?? "-"}
                </span>
              </td>
              <td className="px-5 py-3">
                <span className="text-sm font-semibold text-[var(--color-text)]">{inc.title}</span>
              </td>
              <td className="px-5 py-3">
                <span className="text-xs text-[var(--color-text-muted)]">{inc.university ?? "-"}</span>
              </td>
              <td className="px-5 py-3">
                {inc.assignee ? (
                  <div className="flex items-center gap-1.5">
                    <UserAvatar name={inc.assignee} size="sm" className="!w-5 !h-5" />
                    <span className="text-xs text-[var(--color-text)]">{inc.assignee}</span>
                  </div>
                ) : (
                  <span className="text-xs text-[var(--color-text-muted)]">-</span>
                )}
              </td>
              <td className="px-5 py-3">
                <div className="flex items-center gap-1.5">
                  <UserAvatar name={inc.reporter} size="sm" className="!w-5 !h-5" />
                  <span className="text-xs text-[var(--color-text)]">{inc.reporter}</span>
                </div>
              </td>
              <td className="px-5 py-3">
                <StatusBadge variant={statusVariant[inc.status] ?? "neutral"}>{inc.status}</StatusBadge>
              </td>
              <td className="px-5 py-3">
                <span className="text-xs text-[var(--color-text-muted)] tabular-nums">
                  {new Date(inc.incident_date).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" })}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <IncidentDetail incident={selected} profiles={profiles} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
