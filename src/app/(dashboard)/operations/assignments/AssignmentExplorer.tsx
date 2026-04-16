"use client";

import { useState } from "react";
import type { OperatorSummary } from "@/lib/sharepoint";
import LeftPanel from "./LeftPanel";
import OperatorDetail from "./OperatorDetail";
import UniversityDetail from "./UniversityDetail";

export interface UniversityData {
  universityName: string;
  category?: string;
  region?: string;
  salesperson?: string;
  changed?: string;
  remark?: string;
  main?: {
    opSusi: string;
    opJungsi: string;
    devSusi: string;
    devJungsi: string;
    jaewoe?: string;
    foreigner?: string;
    pyeonip?: string;
    devJaewoe?: string;
    devForeigner?: string;
    devPyeonip?: string;
  };
  grad?: { operator: string; developer: string };
  pims?: { operatorFull: string; operatorReception: string };
  score?: { operator: string; developer: string };
  app?: { operator: string; developer: string };
}

export type PanelMode = "operator" | "university";

interface AssignmentExplorerProps {
  universities: UniversityData[];
  operatorSummary: OperatorSummary[];
}

export default function AssignmentExplorer({
  universities,
  operatorSummary,
}: AssignmentExplorerProps) {
  const [mode, setMode] = useState<PanelMode>("operator");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  function handleSelect(newMode: PanelMode, id: string) {
    setMode(newMode);
    setSelectedId(id);
  }

  const selectedUniv =
    selectedId && mode === "university"
      ? (universities.find((u) => u.universityName === selectedId) ?? null)
      : null;

  return (
    <div
      className="flex gap-0 border border-black/[0.04]/15 rounded-[20px] overflow-hidden bg-[var(--color-surface)]"
      style={{ height: "calc(100vh - 220px)" }}
    >
      <div className="w-[300px] shrink-0 border-r border-black/[0.04]/10 overflow-hidden flex flex-col">
        <LeftPanel
          mode={mode}
          onModeChange={setMode}
          search={search}
          onSearchChange={setSearch}
          universities={universities}
          operatorSummary={operatorSummary}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {!selectedId && (
          <div className="flex items-center justify-center h-full text-[var(--color-text-muted)]">
            <div className="text-center">
              <p className="text-sm font-bold">운영자 또는 대학을 선택하세요</p>
              <p className="text-xs mt-1">
                왼쪽 패널에서 항목을 클릭하면 상세 정보가 표시됩니다.
              </p>
            </div>
          </div>
        )}

        {selectedId && mode === "operator" && (
          <OperatorDetail
            operatorName={selectedId}
            universities={universities}
            summary={operatorSummary.find((o) => o.name === selectedId) ?? null}
            onSelectUniversity={(name: string) =>
              handleSelect("university", name)
            }
          />
        )}

        {selectedId && mode === "university" && selectedUniv && (
          <UniversityDetail
            university={selectedUniv}
            onSelectOperator={(name: string) => handleSelect("operator", name)}
          />
        )}
      </div>
    </div>
  );
}
