"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

interface SaveWorkLogResult {
  success?: boolean;
  error?: string;
}

export async function saveWorkLog(
  serviceId: number,
  category: string,
  content: string,
  author: string,
): Promise<SaveWorkLogResult> {
  const supabase = createClient();

  const { data: existing } = await supabase
    .from("service_work_logs")
    .select("id")
    .eq("service_id", serviceId)
    .eq("category", category)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("service_work_logs")
      .update({ content, author, updated_at: new Date().toISOString() })
      .eq("id", existing.id);

    if (error) {
      return { error: error.message };
    }
  } else {
    const { error } = await supabase.from("service_work_logs").insert({
      service_id: serviceId,
      category,
      content,
      author,
    });

    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath(`/operations/services/${serviceId}`);
  return { success: true };
}

export async function deleteWorkLog(logId: number): Promise<SaveWorkLogResult> {
  const supabase = createClient();

  const { data: log } = await supabase
    .from("service_work_logs")
    .select("service_id")
    .eq("id", logId)
    .single();

  if (!log) {
    return { error: "작업이력을 찾을 수 없습니다." };
  }

  const { error } = await supabase
    .from("service_work_logs")
    .delete()
    .eq("id", logId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/operations/services/${log.service_id}`);
  return { success: true };
}
