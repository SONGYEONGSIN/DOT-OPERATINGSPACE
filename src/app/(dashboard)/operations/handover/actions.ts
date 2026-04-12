"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendMail } from "@/lib/mail";

export interface HandoverResult {
  success?: boolean;
  error?: string;
  updatedCount?: number;
}

function stripYear(name: string) {
  return name.replace(/\d{4}학년도\s*|\d{4}-(?=\d학기)/g, "");
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** 인수인계 PDF용 HTML 생성 */
function buildHandoverHtml(
  services: {
    university_name: string | null;
    service_name: string | null;
    operator: string | null;
    category: string | null;
    reception_type: string | null;
  }[],
  workLogs: { service_id: number; category: string; content: string }[],
  toPerson: string,
  memo: string,
): string {
  const now = formatDate(new Date());

  // 서비스별 작업이력 매핑
  const logMap = new Map<number, { category: string; content: string }[]>();
  for (const log of workLogs) {
    const arr = logMap.get(log.service_id) ?? [];
    arr.push(log);
    logMap.set(log.service_id, arr);
  }

  const serviceRows = (services as (typeof services[number] & { id: number })[])
    .map((s) => {
      const logs = logMap.get(s.id) ?? [];
      const logHtml = logs.length > 0
        ? logs.map((l) => `
          <div style="margin-bottom:8px;">
            <span style="display:inline-block;background:#f0f0f0;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:bold;margin-bottom:4px;">${l.category}</span>
            <div style="font-size:12px;line-height:1.6;padding-left:4px;">${l.content}</div>
          </div>
        `).join("")
        : '<p style="color:#999;font-size:12px;">작성된 작업이력 없음</p>';

      return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:13px;vertical-align:top;">${s.university_name ?? "-"}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:13px;vertical-align:top;">${stripYear(s.service_name ?? "-")}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:13px;vertical-align:top;">${s.reception_type ?? "-"}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:13px;vertical-align:top;">${s.category ?? "-"}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:13px;vertical-align:top;">${s.operator ?? "미배정"}</td>
        </tr>
        <tr>
          <td colspan="5" style="padding:8px 16px 16px;border-bottom:2px solid #ddd;background:#fafafa;">
            ${logHtml}
          </td>
        </tr>
      `;
    })
    .join("");

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: 'Pretendard', -apple-system, sans-serif; margin:0; padding:0; color:#1a1a1a; }
    .container { max-width:800px; margin:0 auto; padding:40px 30px; }
    .header { text-align:center; margin-bottom:32px; padding-bottom:20px; border-bottom:3px solid #4a7a00; }
    .header h1 { font-size:22px; font-weight:800; color:#4a7a00; margin:0 0 4px; }
    .header p { font-size:12px; color:#888; margin:0; }
    .info-grid { display:flex; gap:16px; margin-bottom:24px; }
    .info-card { flex:1; background:#f8f8f8; border-radius:8px; padding:14px 16px; }
    .info-card .label { font-size:10px; font-weight:bold; color:#888; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px; }
    .info-card .value { font-size:15px; font-weight:700; color:#1a1a1a; }
    .memo-box { background:#fffde7; border:1px solid #ffe082; border-radius:8px; padding:14px 16px; margin-bottom:24px; }
    .memo-box .label { font-size:10px; font-weight:bold; color:#888; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px; }
    .memo-box p { font-size:13px; margin:0; line-height:1.6; }
    table { width:100%; border-collapse:collapse; }
    th { background:#4a7a00; color:#fff; padding:10px 12px; text-align:left; font-size:11px; font-weight:bold; text-transform:uppercase; letter-spacing:0.5px; }
    .footer { text-align:center; margin-top:32px; padding-top:16px; border-top:1px solid #eee; font-size:11px; color:#aaa; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Orchestrator System</h1>
      <p>인수인계 보고서</p>
    </div>

    <div class="info-grid">
      <div class="info-card">
        <div class="label">인수자</div>
        <div class="value">${toPerson}</div>
      </div>
      <div class="info-card">
        <div class="label">서비스 수</div>
        <div class="value">${services.length}건</div>
      </div>
      <div class="info-card">
        <div class="label">발송일시</div>
        <div class="value">${now}</div>
      </div>
    </div>

    ${memo ? `
    <div class="memo-box">
      <div class="label">인수인계 사유 / 메모</div>
      <p>${memo}</p>
    </div>
    ` : ""}

    <table>
      <thead>
        <tr>
          <th>대학명</th>
          <th>서비스명</th>
          <th>접수구분</th>
          <th>카테고리</th>
          <th>운영자</th>
        </tr>
      </thead>
      <tbody>
        ${serviceRows}
      </tbody>
    </table>

    <div class="footer">
      Orchestrator System &mdash; 내부운영관리시스템<br/>
      이 문서는 자동 생성되었습니다.
    </div>
  </div>
</body>
</html>`;
}

export async function executeHandover(
  serviceIds: number[],
  field: "operator" | "developer",
  toPerson: string,
  memo: string,
): Promise<HandoverResult> {
  if (serviceIds.length === 0) return { error: "서비스를 선택해주세요." };
  if (!toPerson) return { error: "인수자를 선택해주세요." };

  const supabase = createClient();

  // 현재 담당자 및 서비스 정보 조회
  const { data: currentServices, error: fetchError } = await supabase
    .from("services")
    .select("id, operator, developer, university_name, service_name, category, reception_type")
    .in("id", serviceIds);

  if (fetchError || !currentServices) {
    return { error: "서비스 정보를 불러오지 못했습니다." };
  }

  // handover_logs 이력 기록
  const logs = currentServices.map((s) => ({
    service_id: s.id,
    field,
    from_person: field === "operator" ? s.operator : s.developer,
    to_person: toPerson,
    memo: memo || null,
    executed_by: "관리자",
  }));

  const { error: logError } = await supabase.from("handover_logs").insert(logs);

  // 작업이력 조회 (인수인계 서비스의 work_logs)
  const { data: workLogs } = await supabase
    .from("service_work_logs")
    .select("service_id, category, content")
    .in("service_id", serviceIds);

  // 인수자 이메일 조회
  const { data: recipientProfile } = await supabase
    .from("profiles")
    .select("email")
    .eq("name", toPerson)
    .single();

  // PDF HTML 생성 및 이메일 발송
  if (recipientProfile?.email) {
    try {
      const pdfHtml = buildHandoverHtml(
        currentServices as any,
        workLogs ?? [],
        toPerson,
        memo,
      );

      // 이메일 본문
      const emailBody = `
        <div style="font-family:'Pretendard',-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <h2 style="color:#4a7a00;font-size:18px;margin:0 0 16px;">인수인계 알림</h2>
          <p style="font-size:14px;color:#333;line-height:1.6;">
            <strong>${toPerson}</strong>님에게 <strong>${currentServices.length}건</strong>의 서비스가 인수인계되었습니다.
          </p>
          ${memo ? `<p style="font-size:13px;color:#666;background:#f5f5f5;padding:12px;border-radius:8px;margin:16px 0;">메모: ${memo}</p>` : ""}
          <p style="font-size:13px;color:#666;">상세 내용은 첨부된 인수인계 보고서를 확인해주세요.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
          <p style="font-size:11px;color:#aaa;">Orchestrator System 내부운영관리시스템</p>
        </div>
      `;

      await sendMail({
        to: recipientProfile.email,
        subject: `[인수인계] ${currentServices.length}건의 서비스가 인수인계되었습니다`,
        html: emailBody,
        attachments: [
          {
            filename: `인수인계_보고서_${new Date().toISOString().slice(0, 10)}.html`,
            content: pdfHtml,
            contentType: "text/html",
          },
        ],
      });
    } catch (e) {
      console.error("이메일 발송 실패:", e);
    }
  }

  revalidatePath("/operations/handover");
  revalidatePath("/operations/services");

  return { success: true, updatedCount: serviceIds.length, error: logError ? "인수인계는 완료되었으나 이력 기록에 실패했습니다." : undefined };
}
