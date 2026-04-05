"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface TaskResult {
  success?: boolean;
  error?: string;
}

// ── 활동 로그 기록 ──
async function logActivity(project: string, taskId: number | null, action: string, actor: string, detail: string | null) {
  const supabase = createClient();
  await supabase.from("project_logs").insert({ project, task_id: taskId, action, actor, detail });
}

// ── 작업 생성 ──
export async function createTask(
  project: string,
  title: string,
  description: string,
  priority: string,
  assignee: string,
  dueDate: string,
  year: number = 2026,
  requester: string = "",
): Promise<TaskResult> {
  if (!title.trim()) return { error: "제목을 입력해주세요." };

  const supabase = createClient();

  const { count } = await supabase
    .from("project_tasks")
    .select("id", { count: "exact", head: true })
    .eq("project", project)
    .eq("status", "request");

  const { data: inserted, error } = await supabase.from("project_tasks").insert({
    project,
    title: title.trim(),
    description: description.trim() || null,
    priority,
    status: "request",
    assignee: assignee || null,
    requester: requester || null,
    due_date: dueDate || null,
    year,
    sort_order: (count ?? 0) + 1,
  }).select("id").single();

  if (error) return { error: "등록에 실패했습니다." };

  await logActivity(project, inserted?.id ?? null, "created", requester || assignee || "시스템", `작업 생성: ${title.trim()}`);

  revalidatePath(`/projects/${project}`);
  return { success: true };
}

// ── 요청 등록 (다른 팀원이 요청) ──
export async function createRequest(
  project: string,
  title: string,
  description: string,
  priority: string,
  requester: string,
  year: number = 2026,
): Promise<TaskResult> {
  if (!title.trim()) return { error: "요청 제목을 입력해주세요." };
  if (!requester.trim()) return { error: "요청자를 선택해주세요." };

  const supabase = createClient();

  const { count } = await supabase
    .from("project_tasks")
    .select("id", { count: "exact", head: true })
    .eq("project", project)
    .eq("status", "request");

  const { data: inserted, error } = await supabase.from("project_tasks").insert({
    project,
    title: title.trim(),
    description: description.trim() || null,
    priority,
    status: "request",
    assignee: null,
    requester: requester.trim(),
    due_date: null,
    year,
    sort_order: (count ?? 0) + 1,
  }).select("id").single();

  if (error) return { error: "요청 등록에 실패했습니다." };

  await logActivity(project, inserted?.id ?? null, "requested", requester.trim(), `요청 등록: ${title.trim()}`);

  revalidatePath(`/projects/${project}`);
  return { success: true };
}

// ── 작업 수정 ──
export async function updateTask(
  id: number,
  project: string,
  title: string,
  description: string,
  priority: string,
  status: string,
  assignee: string,
  dueDate: string,
  actor: string = "시스템",
): Promise<TaskResult> {
  if (!title.trim()) return { error: "제목을 입력해주세요." };

  const supabase = createClient();

  // 기존 상태 조회 (변경 로그용)
  const { data: prev } = await supabase.from("project_tasks").select("status, assignee").eq("id", id).single();

  const { error } = await supabase
    .from("project_tasks")
    .update({
      title: title.trim(),
      description: description.trim() || null,
      priority,
      status,
      assignee: assignee || null,
      due_date: dueDate || null,
    })
    .eq("id", id);

  if (error) return { error: "수정에 실패했습니다." };

  // 상태 변경 로그
  if (prev && prev.status !== status) {
    await logActivity(project, id, "status_changed", actor, `상태 변경: ${prev.status} → ${status}`);
  }
  // 담당자 변경 로그
  if (prev && prev.assignee !== (assignee || null)) {
    await logActivity(project, id, "assigned", actor, `담당자 변경: ${prev.assignee ?? "미배정"} → ${assignee || "미배정"}`);
  }

  revalidatePath(`/projects/${project}`);
  return { success: true };
}

// ── 상태 변경 (드래그앤드롭) ──
export async function updateTaskStatus(
  id: number,
  status: string,
  sortOrder: number,
  project: string,
): Promise<TaskResult> {
  const supabase = createClient();

  const { data: prev } = await supabase.from("project_tasks").select("status, title").eq("id", id).single();

  const { error } = await supabase
    .from("project_tasks")
    .update({ status, sort_order: sortOrder })
    .eq("id", id);

  if (error) return { error: "업데이트에 실패했습니다." };

  if (prev && prev.status !== status) {
    await logActivity(project, id, "status_changed", "시스템", `${prev.title}: ${prev.status} → ${status}`);
  }

  revalidatePath(`/projects/${project}`);
  return { success: true };
}

// ── 삭제 ──
export async function deleteTask(id: number, project: string): Promise<TaskResult> {
  const supabase = createClient();

  const { data: prev } = await supabase.from("project_tasks").select("title").eq("id", id).single();

  const { error } = await supabase.from("project_tasks").delete().eq("id", id);
  if (error) return { error: "삭제에 실패했습니다." };

  await logActivity(project, null, "deleted", "시스템", `작업 삭제: ${prev?.title ?? ""}`);

  revalidatePath(`/projects/${project}`);
  return { success: true };
}
