"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ── 개인 온보딩 ──

export async function toggleOnboardingItem(itemKey: string, itemLabel: string, done: boolean, targetEmail?: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "인증 정보를 확인할 수 없습니다." };

  const email = targetEmail || user.email;

  if (done) {
    await supabase
      .from("onboarding_progress")
      .upsert({ user_email: email, item_key: itemKey, completed_at: new Date().toISOString() }, { onConflict: "user_email,item_key" });

    await supabase.from("onboarding_logs").insert({
      user_email: email,
      action: "complete",
      item_key: itemKey,
      item_label: itemLabel,
      memo: targetEmail ? `관리자(${user.email})가 처리` : null,
    });
  } else {
    await supabase
      .from("onboarding_progress")
      .delete()
      .eq("user_email", email)
      .eq("item_key", itemKey);

    await supabase.from("onboarding_logs").insert({
      user_email: email,
      action: "undo",
      item_key: itemKey,
      item_label: itemLabel,
      memo: targetEmail ? `관리자(${user.email})가 취소` : null,
    });
  }

  revalidatePath("/support/onboarding");
  return { success: true };
}

export async function addOnboardingMemo(memo: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "인증 정보를 확인할 수 없습니다." };
  if (!memo.trim()) return { error: "메모를 입력해주세요." };

  await supabase.from("onboarding_logs").insert({
    user_email: user.email,
    action: "memo",
    memo: memo.trim(),
  });

  revalidatePath("/support/onboarding");
  return { success: true };
}

export async function addOnboardingMemoForOperator(targetEmail: string, memo: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "인증 정보를 확인할 수 없습니다." };
  if (!memo.trim()) return { error: "메모를 입력해주세요." };

  await supabase.from("onboarding_logs").insert({
    user_email: targetEmail,
    action: "memo",
    memo: `${memo.trim()} (by ${user.email})`,
  });

  revalidatePath("/support/onboarding");
  return { success: true };
}

export interface OnboardingProgressItem {
  item_key: string;
  completed_at: string;
}

export async function getOnboardingProgress(): Promise<OnboardingProgressItem[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return [];

  const { data } = await supabase
    .from("onboarding_progress")
    .select("item_key, completed_at")
    .eq("user_email", user.email);

  return data ?? [];
}

export interface OnboardingLog {
  id: number;
  user_email: string;
  action: string;
  item_key: string | null;
  item_label: string | null;
  memo: string | null;
  created_at: string;
}

export async function getOnboardingLogs(): Promise<OnboardingLog[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return [];

  const { data } = await supabase
    .from("onboarding_logs")
    .select("id, user_email, action, item_key, item_label, memo, created_at")
    .eq("user_email", user.email)
    .order("created_at", { ascending: false })
    .limit(50);

  return data ?? [];
}

// ── 관리자: 전체 운영자 온보딩 ──

export interface OperatorOnboarding {
  email: string;
  name: string;
  team: string;
  completedCount: number;
  totalCount: number;
  lastActivity: string | null;
}

export async function getAllOnboardingStatus(totalItemCount: number): Promise<OperatorOnboarding[]> {
  const supabase = createClient();

  // 활성 프로필 조회
  const { data: profiles } = await supabase
    .from("profiles")
    .select("email, name, team")
    .eq("status", "active")
    .order("name");

  if (!profiles) return [];

  // 전체 온보딩 진행 현황
  const { data: allProgress } = await supabase
    .from("onboarding_progress")
    .select("user_email, item_key");

  // 최근 활동
  const { data: recentLogs } = await supabase
    .from("onboarding_logs")
    .select("user_email, created_at")
    .order("created_at", { ascending: false });

  const progressByUser = new Map<string, number>();
  (allProgress ?? []).forEach((p) => {
    progressByUser.set(p.user_email, (progressByUser.get(p.user_email) ?? 0) + 1);
  });

  const lastActivityByUser = new Map<string, string>();
  (recentLogs ?? []).forEach((l) => {
    if (!lastActivityByUser.has(l.user_email)) {
      lastActivityByUser.set(l.user_email, l.created_at);
    }
  });

  return profiles.map((p) => ({
    email: p.email,
    name: p.name,
    team: p.team,
    completedCount: progressByUser.get(p.email) ?? 0,
    totalCount: totalItemCount,
    lastActivity: lastActivityByUser.get(p.email) ?? null,
  }));
}

export async function getOperatorProgress(email: string): Promise<OnboardingProgressItem[]> {
  const supabase = createClient();

  const { data } = await supabase
    .from("onboarding_progress")
    .select("item_key, completed_at")
    .eq("user_email", email);

  return data ?? [];
}

export async function getOperatorLogs(email: string): Promise<OnboardingLog[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("onboarding_logs")
    .select("id, user_email, action, item_key, item_label, memo, created_at")
    .eq("user_email", email)
    .order("created_at", { ascending: false })
    .limit(30);
  return data ?? [];
}

export async function getAllOnboardingLogs(): Promise<OnboardingLog[]> {
  const supabase = createClient();

  const { data } = await supabase
    .from("onboarding_logs")
    .select("id, user_email, action, item_key, item_label, memo, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return data ?? [];
}

// ── 온보딩 대상자 관리 ──

export interface OnboardingTarget {
  id: number;
  user_email: string;
  added_by: string;
  mentor: string | null;
  start_date: string | null;
  note: string | null;
  created_at: string;
  // joined from profiles
  name?: string;
  team?: string;
}

export async function getOnboardingTargets(): Promise<OnboardingTarget[]> {
  const supabase = createClient();

  const { data: targets } = await supabase
    .from("onboarding_targets")
    .select("*")
    .order("created_at", { ascending: false });

  if (!targets || targets.length === 0) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("email, name, team");

  const profileMap = new Map((profiles ?? []).map((p) => [p.email, p]));

  return targets.map((t) => {
    const profile = profileMap.get(t.user_email);
    return { ...t, name: profile?.name, team: profile?.team };
  });
}

export async function addOnboardingTarget(email: string, mentor: string, startDate: string, note: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "인증 정보를 확인할 수 없습니다." };

  const { error } = await supabase.from("onboarding_targets").insert({
    user_email: email,
    added_by: user.email,
    mentor: mentor || null,
    start_date: startDate || null,
    note: note || null,
  });

  if (error) {
    if (error.code === "23505") return { error: "이미 등록된 대상자입니다." };
    return { error: "등록에 실패했습니다." };
  }

  revalidatePath("/support/onboarding");
  return { success: true };
}

export async function removeOnboardingTarget(email: string) {
  const supabase = createClient();

  await supabase.from("onboarding_targets").delete().eq("user_email", email);
  await supabase.from("onboarding_progress").delete().eq("user_email", email);
  await supabase.from("onboarding_logs").delete().eq("user_email", email);

  revalidatePath("/support/onboarding");
  return { success: true };
}

// ── 교육자료 (SharePoint 매뉴얼 폴더) ──

export interface MaterialFile {
  name: string;
  webUrl: string;
  size: number;
  folder?: string;
  type: string;
}

export async function getTrainingMaterials(): Promise<MaterialFile[]> {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.AZURE_AD_CLIENT_ID!,
    client_secret: process.env.AZURE_AD_CLIENT_SECRET!,
    scope: "https://graph.microsoft.com/.default",
  });
  const tokenRes = await fetch(
    `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/v2.0/token`,
    { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() },
  );
  const tokenData = await tokenRes.json();
  if (tokenData.error) return [];
  const token = tokenData.access_token;

  const driveId = process.env.SHAREPOINT_DRIVE_ID;
  const manualFolderId = "01TGOQVTUKW6DM6CB3T5DIJOFQFXSGUV6F"; // 05. 매뉴얼

  const allFiles: MaterialFile[] = [];

  // 루트 파일만 (하위 폴더 제외)
  const res = await fetch(
    `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${manualFolderId}/children?$top=200`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const data = await res.json();
  for (const item of data.value || []) {
    if (item.folder) continue;
    const ext = item.name.includes(".") ? item.name.slice(item.name.lastIndexOf(".") + 1).toLowerCase() : "";
    const allowedTypes = ["doc", "docx", "ppt", "pptx", "xls", "xlsx", "pdf", "hwp"];
    if (allowedTypes.includes(ext)) {
      allFiles.push({
        name: item.name,
        webUrl: item.webUrl ?? "",
        size: item.size ?? 0,
        folder: "매뉴얼",
        type: ext,
      });
    }
  }
  return allFiles;
}
