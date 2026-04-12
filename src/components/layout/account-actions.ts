"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ActionResult {
  success?: boolean;
  error?: string;
}

export async function updateProfile(name: string, team: string): Promise<ActionResult> {
  if (!name.trim()) return { error: "이름을 입력해주세요." };

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "인증 정보를 확인할 수 없습니다." };

  const { error } = await supabase
    .from("profiles")
    .update({ name: name.trim(), team, updated_at: new Date().toISOString() })
    .eq("email", user.email!);

  if (error) {
    console.error("Profile update error:", error);
    return { error: "계정정보 수정에 실패했습니다." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function resetMyPassword(): Promise<ActionResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "인증 정보를 확인할 수 없습니다." };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3003";
  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${baseUrl}/callback?next=/reset-password`,
  });

  if (error) {
    console.error("Password reset error:", error);
    return { error: "비밀번호 초기화 메일 발송에 실패했습니다." };
  }

  return { success: true };
}
