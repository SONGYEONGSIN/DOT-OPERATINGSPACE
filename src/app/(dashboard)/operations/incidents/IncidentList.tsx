"use client";

import { useState } from "react";
import { StatusBadge, UserAvatar } from "@/components/common";
import IncidentDetail from "./IncidentDetail";

interface Incident {
  id: number;
  title: string;
  incident_date: string;
  university: string | null;
  service: string | null;
  reporter: string;
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
}

const severityVariant: Record<string, "success" | "warning" | "error" | "neutral"> = {
  낮음: "neutral",
  보통: "warning",
  높음: "error",
  긴급: "error",
};

const statusVariant: Record<string, "success" | "warning" | "info" | "neutral"> = {
  접수: "neutral",
  조사중: "warning",
  처리중: "info",
  완료: "success",
};

export default function IncidentList({ incidents }: IncidentListProps) {
  const [selected, setSelected] = useState<Incident | null>(null);

  return (
    <>
      <table className="w-full">
        <thead>
          <tr className="bg-surface-container-high/50">
            <th className="text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider px-5 py-3 w-[10%]">일시</th>
            <th className="text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider px-5 py-3">제목</th>
            <th className="text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider px-5 py-3 w-[12%]">관련 대학</th>
            <th className="text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider px-5 py-3 w-[8%]">보고자</th>
            <th className="text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider px-5 py-3 w-[8%]">중요도</th>
            <th className="text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider px-5 py-3 w-[8%]">상태</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((inc) => (
            <tr
              key={inc.id}
              onClick={() => setSelected(inc)}
              className="border-t border-outline-variant/5 cursor-pointer hover:bg-surface-container-high/30 transition-colors"
            >
              <td className="px-5 py-3">
                <span className="text-xs text-on-surface-variant tabular-nums">
                  {new Date(inc.incident_date).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" })}
                </span>
              </td>
              <td className="px-5 py-3">
                <span className="text-sm font-semibold text-on-surface">{inc.title}</span>
              </td>
              <td className="px-5 py-3">
                <span className="text-xs text-on-surface-variant">{inc.university ?? "-"}</span>
              </td>
              <td className="px-5 py-3">
                <div className="flex items-center gap-1.5">
                  <UserAvatar name={inc.reporter} size="sm" className="!w-5 !h-5" />
                  <span className="text-xs text-on-surface">{inc.reporter}</span>
                </div>
              </td>
              <td className="px-5 py-3">
                <StatusBadge variant={severityVariant[inc.severity] ?? "neutral"}>{inc.severity}</StatusBadge>
              </td>
              <td className="px-5 py-3">
                <StatusBadge variant={statusVariant[inc.status] ?? "neutral"}>{inc.status}</StatusBadge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <IncidentDetail incident={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
