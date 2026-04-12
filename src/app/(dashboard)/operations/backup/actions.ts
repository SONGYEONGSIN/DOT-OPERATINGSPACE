"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendMail } from "@/lib/mail";

export interface BackupResult {
  success?: boolean;
  error?: string;
}

export async function createBackupRequest(
  operatorName: string,
  operatorTeam: string,
  leaveType: string,
  startDate: string,
  endDate: string,
  opsBackupName: string,
  devBackupName: string,
  opsBackupContent: string,
  devBackupContent: string,
): Promise<BackupResult> {
  if (!operatorName) return { error: "운영자를 선택해주세요." };
  if (!leaveType) return { error: "휴가 유형을 선택해주세요." };
  if (!startDate || !endDate) return { error: "기간을 입력해주세요." };
  if (!opsBackupName) return { error: "운영 백업자를 선택해주세요." };

  const supabase = createClient();
  const { error } = await supabase.from("backup_requests").insert({
    operator_name: operatorName,
    operator_team: operatorTeam,
    leave_type: leaveType,
    start_date: startDate,
    end_date: endDate,
    ops_backup_name: opsBackupName,
    dev_backup_name: devBackupName || null,
    ops_backup_content: opsBackupContent || "",
    dev_backup_content: devBackupContent || "",
    status: opsBackupContent ? "작성 완료" : "작성 전",
  });

  if (error) return { error: "등록에 실패했습니다." };

  revalidatePath("/operations/backup");
  return { success: true };
}

export async function updateBackupRequest(
  id: number,
  opsBackupContent: string,
  devBackupContent: string,
  status: string,
): Promise<BackupResult> {
  const supabase = createClient();
  const { error } = await supabase
    .from("backup_requests")
    .update({
      ops_backup_content: opsBackupContent,
      dev_backup_content: devBackupContent,
      status,
    })
    .eq("id", id);

  if (error) return { error: "수정에 실패했습니다." };

  // 작성 완료 시 알림 발송
  if (status === "작성 완료") {
    await sendBackupNotification(id);
  }

  revalidatePath("/operations/backup");
  return { success: true };
}

export async function deleteBackupRequest(id: number): Promise<BackupResult> {
  const supabase = createClient();
  const { error } = await supabase.from("backup_requests").delete().eq("id", id);

  if (error) return { error: "삭제에 실패했습니다." };

  revalidatePath("/operations/backup");
  return { success: true };
}

async function sendBackupNotification(id: number) {
  const supabase = createClient();

  const { data: req } = await supabase
    .from("backup_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (!req) return;

  // 전체 프로필 조회
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("email, name, team")
    .eq("status", "active");

  const profileList = allProfiles ?? [];

  // 수신자: 백업자
  const backupNames = [req.ops_backup_name, req.dev_backup_name].filter(Boolean);
  const toEmails = profileList
    .filter((p) => backupNames.includes(p.name))
    .map((p) => p.email)
    .filter(Boolean);

  if (toEmails.length === 0) return;

  // 참조(CC): 같은 팀 다른 팀원
  const ccEmails = profileList
    .filter((p) => p.team === req.operator_team && !backupNames.includes(p.name) && p.name !== req.operator_name)
    .map((p) => p.email)
    .filter(Boolean);

  // 숨은참조(BCC): 고객센터 직원 (다른 팀 전체)
  const bccEmails = profileList
    .filter((p) => p.team !== req.operator_team && !backupNames.includes(p.name))
    .map((p) => p.email)
    .filter(Boolean);

  try {
    await sendMail({
      to: toEmails,
      cc: ccEmails.length > 0 ? ccEmails : undefined,
      bcc: bccEmails.length > 0 ? bccEmails : undefined,
      subject: `[백업요청] ${req.operator_name} ${req.leave_type} (${req.start_date} ~ ${req.end_date})`,
      html: `
        <div style="font-family:'Pretendard',-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <h2 style="color:#4a7a00;font-size:18px;margin:0 0 16px;">업무 백업 요청</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
            <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;font-size:13px;width:100px;">운영자</td><td style="padding:8px 12px;font-size:13px;">${req.operator_name} (${req.operator_team})</td></tr>
            <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;font-size:13px;">유형</td><td style="padding:8px 12px;font-size:13px;">${req.leave_type}</td></tr>
            <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;font-size:13px;">기간</td><td style="padding:8px 12px;font-size:13px;">${req.start_date} ~ ${req.end_date}</td></tr>
            <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;font-size:13px;">운영 백업자</td><td style="padding:8px 12px;font-size:13px;">${req.ops_backup_name}</td></tr>
            ${req.dev_backup_name ? `<tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;font-size:13px;">개발 백업자</td><td style="padding:8px 12px;font-size:13px;">${req.dev_backup_name}</td></tr>` : ""}
          </table>
          ${req.ops_backup_content ? `<h3 style="font-size:14px;margin:16px 0 8px;">운영 백업 내용</h3><div style="font-size:13px;line-height:1.6;padding:12px;background:#fafafa;border-radius:8px;">${req.ops_backup_content}</div>` : ""}
          ${req.dev_backup_content ? `<h3 style="font-size:14px;margin:16px 0 8px;">개발 백업 내용</h3><div style="font-size:13px;line-height:1.6;padding:12px;background:#fafafa;border-radius:8px;">${req.dev_backup_content}</div>` : ""}
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
          <p style="font-size:11px;color:#aaa;">Orchestrator System 내부운영관리시스템</p>
        </div>
      `,
    });

    await supabase
      .from("backup_requests")
      .update({ last_notified_at: new Date().toISOString() })
      .eq("id", id);
  } catch (e) {
    console.error("백업 알림 발송 실패:", e);
  }
}
