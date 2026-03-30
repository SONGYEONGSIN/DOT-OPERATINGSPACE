"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./schemas";

export type AuthState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};

export async function login(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    });
    return { fieldErrors };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다" };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function register(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    });
    return { fieldErrors };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.name },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "이미 등록된 이메일입니다" };
    }
    return { error: "계정 생성에 실패했습니다. 다시 시도해 주세요" };
  }

  return { success: "인증 메일을 발송했습니다. 이메일을 확인해 주세요." };
}

export async function forgotPassword(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const raw = { email: formData.get("email") as string };

  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    });
    return { fieldErrors };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL ? "" : "http://localhost:3003"}/reset-password`,
    },
  );

  if (error) {
    return { error: "비밀번호 재설정 메일 발송에 실패했습니다" };
  }

  return { success: "비밀번호 재설정 링크를 이메일로 발송했습니다." };
}

export async function resetPassword(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const raw = {
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    });
    return { fieldErrors };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: "비밀번호 변경에 실패했습니다. 다시 시도해 주세요" };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
