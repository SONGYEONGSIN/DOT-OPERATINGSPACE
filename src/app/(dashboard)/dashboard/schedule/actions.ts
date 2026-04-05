"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ScheduleResult {
  success?: boolean;
  error?: string;
}

export async function createSchedule(
  title: string,
  startDate: string,
  endDate: string,
  category: string,
  description: string,
): Promise<ScheduleResult> {
  if (!title.trim()) return { error: "일정 제목을 입력해주세요." };
  if (!startDate || !endDate) return { error: "시작일과 종료일을 입력해주세요." };
  if (new Date(endDate) < new Date(startDate)) return { error: "종료일이 시작일보다 빠릅니다." };

  const supabase = createClient();
  const { error } = await supabase.from("schedules").insert({
    title: title.trim(),
    start_date: startDate,
    end_date: endDate,
    category,
    description: description.trim() || null,
  });

  if (error) return { error: "일정 등록에 실패했습니다." };

  revalidatePath("/dashboard/schedule");
  return { success: true };
}

export async function deleteSchedule(id: number): Promise<ScheduleResult> {
  const supabase = createClient();
  const { error } = await supabase.from("schedules").delete().eq("id", id);

  if (error) return { error: "일정 삭제에 실패했습니다." };

  revalidatePath("/dashboard/schedule");
  return { success: true };
}
