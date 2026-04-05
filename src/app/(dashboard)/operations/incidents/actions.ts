"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface IncidentResult {
  success?: boolean;
  error?: string;
}

export async function createIncident(
  title: string,
  incidentDate: string,
  university: string,
  service: string,
  reporter: string,
  severity: string,
  background: string,
  cause: string,
  resolution: string,
  prevention: string,
): Promise<IncidentResult> {
  if (!title.trim()) return { error: "제목을 입력해주세요." };
  if (!reporter.trim()) return { error: "보고자를 선택해주세요." };

  const supabase = createClient();

  const { error } = await supabase.from("incident_reports").insert({
    title: title.trim(),
    incident_date: incidentDate || new Date().toISOString(),
    university: university.trim() || null,
    service: service.trim() || null,
    reporter: reporter.trim(),
    severity,
    status: "접수",
    background: background.trim() || null,
    cause: cause.trim() || null,
    resolution: resolution.trim() || null,
    prevention: prevention.trim() || null,
  });

  if (error) return { error: "등록에 실패했습니다." };

  revalidatePath("/operations/incidents");
  return { success: true };
}

export async function updateIncident(
  id: number,
  title: string,
  severity: string,
  status: string,
  background: string,
  cause: string,
  resolution: string,
  prevention: string,
): Promise<IncidentResult> {
  if (!title.trim()) return { error: "제목을 입력해주세요." };

  const supabase = createClient();

  const { error } = await supabase.from("incident_reports").update({
    title: title.trim(),
    severity,
    status,
    background: background.trim() || null,
    cause: cause.trim() || null,
    resolution: resolution.trim() || null,
    prevention: prevention.trim() || null,
  }).eq("id", id);

  if (error) return { error: "수정에 실패했습니다." };

  revalidatePath("/operations/incidents");
  return { success: true };
}
