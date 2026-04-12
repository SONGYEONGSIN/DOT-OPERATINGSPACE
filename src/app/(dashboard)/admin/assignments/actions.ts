"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { OPERATOR_GROUPS } from "./constants";

export interface CapacitySetting {
  id?: number;
  year: number;
  operator_name: string;
  role: string;
  seniority: string;
  max_susi: number;
  max_jungsi: number;
  max_jaewoe: number;
  max_foreigner: number;
  max_k12: number;
  max_grad: number;
  max_pims: number;
  max_score: number;
  note: string | null;
}

export async function getCapacitySettings(year: number): Promise<CapacitySetting[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("assignment_capacity")
    .select("*")
    .eq("year", year)
    .eq("role", "operator")
    .order("operator_name");
  return data ?? [];
}

export async function saveCapacitySetting(setting: CapacitySetting) {
  const supabase = createClient();

  const { error } = await supabase
    .from("assignment_capacity")
    .upsert({
      year: setting.year,
      operator_name: setting.operator_name,
      role: setting.role || "operator",
      seniority: setting.seniority,
      max_susi: setting.max_susi,
      max_jungsi: setting.max_jungsi,
      max_jaewoe: setting.max_jaewoe,
      max_foreigner: setting.max_foreigner,
      max_k12: setting.max_k12,
      max_grad: setting.max_grad,
      max_pims: setting.max_pims,
      max_score: setting.max_score,
      note: setting.note,
      updated_at: new Date().toISOString(),
    }, { onConflict: "year,operator_name,role" });

  if (error) return { error: error.message };
  revalidatePath("/admin/assignments");
  return { success: true };
}

export async function initDefaultCapacity(year: number) {
  const supabase = createClient();

  // 기본 용량: 그룹별 차등
  const defaults: Record<number, { susi: number; jungsi: number; etc: number }> = {
    1: { susi: 13, jungsi: 13, etc: 3 },
    2: { susi: 14, jungsi: 14, etc: 3 },
    3: { susi: 15, jungsi: 15, etc: 3 },
    4: { susi: 16, jungsi: 16, etc: 3 },
    5: { susi: 17, jungsi: 17, etc: 3 },
    6: { susi: 18, jungsi: 18, etc: 4 },
  };

  const records = OPERATOR_GROUPS.flatMap((g) =>
    g.operators.map((op) => {
      const d = defaults[g.group];
      return {
        year,
        operator_name: op,
        role: "operator",
        seniority: g.label,
        max_susi: d.susi,
        max_jungsi: d.jungsi,
        max_jaewoe: d.etc,
        max_foreigner: d.etc,
        max_k12: d.etc,
        max_grad: d.etc,
        max_pims: 5,
        max_score: d.etc,
      };
    })
  );

  await supabase.from("assignment_capacity").upsert(records, { onConflict: "year,operator_name,role" });
  revalidatePath("/admin/assignments");
  return { success: true };
}

// ── 자동 배정 ──

export interface AssignmentPreview {
  universityName: string;
  category: string;
  region: string;
  assignmentType: string;
  assignedTo: string;
}

export interface AutoAssignResult {
  assignments: AssignmentPreview[];
  unassigned: { universityName: string; category: string; region: string; assignmentType: string; reason: string }[];
  operatorLoads: Record<string, Record<string, number>>;
}

export async function runAutoAssign(
  year: number,
  universities: { universityName: string; category: string; region: string }[],
  assignmentType: string,
): Promise<AutoAssignResult> {
  const supabase = createClient();

  // 용량 설정 로드
  const { data: capacities } = await supabase
    .from("assignment_capacity")
    .select("*")
    .eq("year", year)
    .eq("role", "operator");

  if (!capacities || capacities.length === 0) {
    return { assignments: [], unassigned: universities.map((u) => ({ ...u, assignmentType, reason: "용량 설정 없음" })), operatorLoads: {} };
  }

  // 기존 배정 로드 (이미 배정된 것 제외)
  const { data: existing } = await supabase
    .from("assignment_results")
    .select("university_name, assignment_type, assigned_to")
    .eq("year", year)
    .eq("role", "operator");

  const existingSet = new Set((existing ?? []).map((e) => `${e.university_name}__${e.assignment_type}`));

  // 현재 배정 수 계산
  const currentLoads: Record<string, Record<string, number>> = {};
  for (const cap of capacities) {
    currentLoads[cap.operator_name] = { susi: 0, jungsi: 0, jaewoe: 0, foreigner: 0, k12: 0, grad: 0, pims: 0, score: 0 };
  }
  for (const e of existing ?? []) {
    if (currentLoads[e.assigned_to]) {
      currentLoads[e.assigned_to][e.assignment_type] = (currentLoads[e.assigned_to][e.assignment_type] ?? 0) + 1;
    }
  }

  // 용량 맵
  const capMap = new Map(capacities.map((c) => [c.operator_name, c]));
  const maxKey = `max_${assignmentType}` as keyof typeof capacities[0];

  // 미배정 대학 필터
  const toAssign = universities.filter((u) => !existingSet.has(`${u.universityName}__${assignmentType}`));

  // 배정 알고리즘: 현재 여유가 가장 많은 운영자에게 우선 배정
  const assignments: AssignmentPreview[] = [];
  const unassigned: AutoAssignResult["unassigned"] = [];

  for (const uni of toAssign) {
    // 여유 용량 계산하여 정렬
    const candidates = capacities
      .map((cap) => {
        const max = (cap[maxKey] as number) ?? 0;
        const current = currentLoads[cap.operator_name]?.[assignmentType] ?? 0;
        const remaining = max - current;
        return { name: cap.operator_name, remaining, current };
      })
      .filter((c) => c.remaining > 0)
      .sort((a, b) => b.remaining - a.remaining || a.current - b.current);

    if (candidates.length === 0) {
      unassigned.push({ ...uni, assignmentType, reason: "모든 운영자 용량 초과" });
      continue;
    }

    const chosen = candidates[0];
    assignments.push({
      universityName: uni.universityName,
      category: uni.category,
      region: uni.region,
      assignmentType,
      assignedTo: chosen.name,
    });

    // 로드 업데이트
    if (currentLoads[chosen.name]) {
      currentLoads[chosen.name][assignmentType] = (currentLoads[chosen.name][assignmentType] ?? 0) + 1;
    }
  }

  return { assignments, unassigned, operatorLoads: currentLoads };
}

export async function applyAssignments(year: number, assignments: AssignmentPreview[]) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const records = assignments.map((a) => ({
    year,
    university_name: a.universityName,
    category: a.category,
    region: a.region,
    assignment_type: a.assignmentType,
    role: "operator",
    assigned_to: a.assignedTo,
    is_manual: false,
  }));

  const { error } = await supabase.from("assignment_results").upsert(records, { onConflict: "year,university_name,assignment_type,role" });

  if (error) return { error: error.message };

  // 로그
  for (const a of assignments) {
    await supabase.from("assignment_logs").insert({
      year,
      university_name: a.universityName,
      assignment_type: a.assignmentType,
      role: "operator",
      to_operator: a.assignedTo,
      reason: "자동 배정",
      changed_by: user?.email ?? "system",
    });
  }

  revalidatePath("/admin/assignments");
  return { success: true };
}

export async function manualAssign(year: number, universityName: string, assignmentType: string, toOperator: string, reason?: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 기존 배정 확인
  const { data: existing } = await supabase
    .from("assignment_results")
    .select("assigned_to")
    .eq("year", year)
    .eq("university_name", universityName)
    .eq("assignment_type", assignmentType)
    .eq("role", "operator")
    .single();

  const fromOperator = existing?.assigned_to ?? null;

  await supabase.from("assignment_results").upsert({
    year,
    university_name: universityName,
    assignment_type: assignmentType,
    role: "operator",
    assigned_to: toOperator,
    is_manual: true,
    updated_at: new Date().toISOString(),
  }, { onConflict: "year,university_name,assignment_type,role" });

  await supabase.from("assignment_logs").insert({
    year,
    university_name: universityName,
    assignment_type: assignmentType,
    role: "operator",
    from_operator: fromOperator,
    to_operator: toOperator,
    reason: reason || "수동 변경",
    changed_by: user?.email ?? "system",
  });

  revalidatePath("/admin/assignments");
  return { success: true };
}

export async function getAssignmentResults(year: number) {
  const supabase = createClient();
  const { data } = await supabase
    .from("assignment_results")
    .select("*")
    .eq("year", year)
    .eq("role", "operator")
    .order("university_name");
  return data ?? [];
}

export async function getAssignmentLogs(year: number) {
  const supabase = createClient();
  const { data } = await supabase
    .from("assignment_logs")
    .select("*")
    .eq("year", year)
    .order("created_at", { ascending: false })
    .limit(50);
  return data ?? [];
}
