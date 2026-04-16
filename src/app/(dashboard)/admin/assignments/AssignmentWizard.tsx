"use client";

import { useState, useCallback, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { IconCheck } from "@tabler/icons-react";
import { applyAssignments } from "./actions";
import type { AssignmentPreview } from "./actions";
import { ALL_OPERATORS, OPERATOR_GROUPS } from "./constants";
import type { OperatorBaseStats } from "@/lib/sharepoint";
import WizardStep1 from "./WizardStep1";
import WizardStep2 from "./WizardStep2";
import WizardStep3 from "./WizardStep3";
import WizardStep4 from "./WizardStep4";

interface University {
  universityName: string;
  category: string;
  region: string;
  currentOperator: string;
}

interface AssignmentWizardProps {
  year: number;
  assignType: string;
  secondAssignType?: string;
  typeLabel: string;
  universities: University[];
  universities2?: University[];
  existingResults: {
    university_name: string;
    assignment_type: string;
    assigned_to: string;
  }[];
  baseStats: OperatorBaseStats[];
  directAssign?: boolean;
}

const DEFAULT_MAX: Record<number, number> = {
  1: 13,
  2: 14,
  3: 15,
  4: 16,
  5: 17,
  6: 18,
};

function getOperatorGroup(name: string): number {
  for (const g of OPERATOR_GROUPS) {
    if ((g.operators as readonly string[]).includes(name)) return g.group;
  }
  return 6;
}

export default function AssignmentWizard({
  year,
  assignType,
  secondAssignType,
  typeLabel,
  universities,
  universities2,
  existingResults,
  baseStats,
  directAssign,
}: AssignmentWizardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Phase 4 (directAssign): skip steps 1-2, start at 3
  const startStep = directAssign ? 3 : 1;
  const [step, setStep] = useState(startStep);
  const [applied, setApplied] = useState(false);

  // PIMS tab: switch between assignType and secondAssignType
  const [pimsTab, setPimsTab] = useState<"full" | "select">("full");
  const activeAssignType =
    secondAssignType && pimsTab === "select" ? secondAssignType : assignType;

  const [maxes, setMaxes] = useState<Record<string, number>>(() => {
    const m: Record<string, number> = {};
    ALL_OPERATORS.forEach((op) => {
      m[op] = DEFAULT_MAX[getOperatorGroup(op)];
    });
    return m;
  });

  // Build original maps for both assign types (PIMS has two)
  const originalMap = useMemo(() => {
    const map = new Map<string, string>();
    existingResults.forEach((r) => {
      map.set(`${r.university_name}__${r.assignment_type}`, r.assigned_to);
    });
    // For PIMS: also populate from universities2 current operators
    if (secondAssignType && universities2) {
      universities2.forEach((u) => {
        if (u.currentOperator) {
          const key = `${u.universityName}__${secondAssignType}`;
          if (!map.has(key)) {
            map.set(key, u.currentOperator);
          }
        }
      });
    }
    // Populate primary type from universities current operators
    universities.forEach((u) => {
      if (u.currentOperator) {
        const key = `${u.universityName}__${assignType}`;
        if (!map.has(key)) {
          map.set(key, u.currentOperator);
        }
      }
    });
    return map;
  }, [
    existingResults,
    assignType,
    secondAssignType,
    universities,
    universities2,
  ]);

  const [assignmentMap, setAssignmentMap] = useState<Map<string, string>>(
    new Map(originalMap),
  );
  const [simRan, setSimRan] = useState(false);

  const runSimulation = useCallback(() => {
    const newMap = new Map(assignmentMap);
    const loads: Record<string, number> = {};
    ALL_OPERATORS.forEach((op) => {
      loads[op] = 0;
    });

    for (const [key, op] of newMap.entries()) {
      if (key.endsWith(`__${assignType}`)) {
        loads[op] = (loads[op] ?? 0) + 1;
      }
    }

    const unassigned = universities.filter(
      (u) => !newMap.has(`${u.universityName}__${assignType}`),
    );

    for (const uni of unassigned) {
      const candidates = ALL_OPERATORS.map((op) => ({
        name: op,
        remaining: (maxes[op] ?? 15) - (loads[op] ?? 0),
        current: loads[op] ?? 0,
      }))
        .filter((c) => c.remaining > 0)
        .sort((a, b) => b.remaining - a.remaining || a.current - b.current);

      if (candidates.length > 0) {
        const chosen = candidates[0];
        newMap.set(`${uni.universityName}__${assignType}`, chosen.name);
        loads[chosen.name] = (loads[chosen.name] ?? 0) + 1;
      }
    }

    setAssignmentMap(newMap);
    setSimRan(true);
  }, [universities, assignmentMap, assignType, maxes]);

  // Compute stats for active assign type
  const computeStats = useCallback(
    (aType: string, univs: University[]) => {
      const loads: Record<string, number> = {};
      ALL_OPERATORS.forEach((op) => {
        loads[op] = 0;
      });
      let assignedCount = 0;
      for (const [key, op] of assignmentMap.entries()) {
        if (key.endsWith(`__${aType}`)) {
          loads[op] = (loads[op] ?? 0) + 1;
          assignedCount++;
        }
      }
      const origCount = [...originalMap.entries()].filter(([k]) =>
        k.endsWith(`__${aType}`),
      ).length;
      const newCount = assignedCount - origCount;
      let manualChangeCount = 0;
      for (const [key, op] of assignmentMap.entries()) {
        if (!key.endsWith(`__${aType}`)) continue;
        const orig = originalMap.get(key);
        if (orig && orig !== op) manualChangeCount++;
      }
      return {
        assignedCount,
        newCount,
        failedCount: univs.length - assignedCount,
        operatorLoads: loads,
        manualChangeCount,
      };
    },
    [assignmentMap, originalMap],
  );

  const simStats = useMemo(
    () => computeStats(assignType, universities),
    [computeStats, assignType, universities],
  );

  function handleAssignChange(univName: string, operator: string) {
    const newMap = new Map(assignmentMap);
    newMap.set(`${univName}__${activeAssignType}`, operator);
    setAssignmentMap(newMap);
  }

  function handleApply() {
    const assignments: AssignmentPreview[] = [];

    // Collect changes for primary type
    for (const [key, op] of assignmentMap.entries()) {
      if (!key.endsWith(`__${assignType}`)) continue;
      if (originalMap.get(key) === op) continue;
      const univName = key.replace(`__${assignType}`, "");
      const uni = universities.find((u) => u.universityName === univName);
      assignments.push({
        universityName: univName,
        category: uni?.category ?? "",
        region: uni?.region ?? "",
        assignmentType: assignType,
        assignedTo: op,
      });
    }

    // Collect changes for second type (PIMS)
    if (secondAssignType && universities2) {
      for (const [key, op] of assignmentMap.entries()) {
        if (!key.endsWith(`__${secondAssignType}`)) continue;
        if (originalMap.get(key) === op) continue;
        const univName = key.replace(`__${secondAssignType}`, "");
        const uni = universities2.find((u) => u.universityName === univName);
        assignments.push({
          universityName: univName,
          category: uni?.category ?? "",
          region: uni?.region ?? "",
          assignmentType: secondAssignType,
          assignedTo: op,
        });
      }
    }

    if (assignments.length === 0) {
      setApplied(true);
      return;
    }
    startTransition(async () => {
      await applyAssignments(year, assignments);
      setApplied(true);
      router.refresh();
    });
  }

  function resetDefaults() {
    const m: Record<string, number> = {};
    ALL_OPERATORS.forEach((op) => {
      m[op] = DEFAULT_MAX[getOperatorGroup(op)];
    });
    setMaxes(m);
  }

  // Step labels differ for directAssign
  const stepLabels = directAssign
    ? ["용량 설정", "시뮬레이션", "배정", "적용"]
    : ["용량 설정", "시뮬레이션", "결과 조정", "적용"];

  // Active universities and stats depend on PIMS tab
  const activeUnivs =
    secondAssignType && pimsTab === "select"
      ? (universities2 ?? universities)
      : universities;
  const activeStats = useMemo(
    () => computeStats(activeAssignType, activeUnivs),
    [computeStats, activeAssignType, activeUnivs],
  );

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="bg-[var(--color-surface)] rounded-[20px] border border-black/[0.04]/15 p-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-4 left-[10%] right-[10%] h-px bg-outline-variant/20" />

          {stepLabels.map((label, i) => {
            const stepNum = i + 1;
            const isDone = step > stepNum;
            const isActive = step === stepNum;
            const isSkipped = directAssign && stepNum <= 2;
            return (
              <div
                key={label}
                className="flex flex-col items-center relative z-10 flex-1"
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 transition-all",
                    isSkipped
                      ? "bg-[var(--color-surface)] text-[var(--color-text-muted)]/30"
                      : isDone
                        ? "bg-primary text-on-primary"
                        : isActive
                          ? "bg-primary text-on-primary shadow-glow"
                          : "bg-[var(--color-surface)] text-[var(--color-text-muted)]",
                  )}
                >
                  {isDone || isSkipped ? <IconCheck size={14} /> : stepNum}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest",
                    isSkipped
                      ? "text-[var(--color-text-muted)]/30"
                      : isActive
                        ? "text-primary"
                        : isDone
                          ? "text-[var(--color-text)]"
                          : "text-[var(--color-text-muted)]",
                  )}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      {step === 1 && !directAssign && (
        <WizardStep1
          assignType={assignType}
          typeLabel={typeLabel}
          maxes={maxes}
          universities={universities}
          onMaxChange={(op, v) => setMaxes((prev) => ({ ...prev, [op]: v }))}
          onResetDefaults={resetDefaults}
          onBack={() => router.push("/admin/assignments")}
          onNext={() => setStep(2)}
          baseStats={baseStats}
        />
      )}
      {step === 2 && !directAssign && (
        <WizardStep2
          typeLabel={typeLabel}
          totalUniversities={universities.length}
          simResult={
            simRan
              ? {
                  assignedCount: simStats.assignedCount,
                  newCount: simStats.newCount,
                  failedCount: simStats.failedCount,
                  operatorLoads: simStats.operatorLoads,
                  maxes,
                }
              : null
          }
          isRunning={false}
          onRun={runSimulation}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <WizardStep3
          universities={activeUnivs}
          assignType={activeAssignType}
          typeLabel={typeLabel}
          assignmentMap={assignmentMap}
          originalMap={originalMap}
          maxes={maxes}
          onAssignChange={handleAssignChange}
          onMaxChange={(op, v) => setMaxes((prev) => ({ ...prev, [op]: v }))}
          onRerun={runSimulation}
          onBack={
            directAssign
              ? () => router.push("/admin/assignments")
              : () => setStep(2)
          }
          onNext={() => setStep(4)}
          pimsTab={secondAssignType ? pimsTab : undefined}
          onPimsTabChange={secondAssignType ? setPimsTab : undefined}
        />
      )}
      {step === 4 && (
        <WizardStep4
          typeLabel={secondAssignType ? `${typeLabel} (통합)` : typeLabel}
          totalUniversities={universities.length}
          assignedCount={activeStats.assignedCount}
          newCount={activeStats.newCount}
          manualChangeCount={activeStats.manualChangeCount}
          operatorLoads={activeStats.operatorLoads}
          maxes={maxes}
          isApplying={isPending}
          applied={applied}
          onApply={handleApply}
          onBack={() => setStep(3)}
          onDone={() => router.push("/admin/assignments")}
        />
      )}
    </div>
  );
}
