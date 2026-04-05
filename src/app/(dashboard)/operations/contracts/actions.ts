"use server";

import { revalidatePath } from "next/cache";
import { sendMail } from "@/lib/mail";
import { createClient } from "@/lib/supabase/server";

async function getGraphToken(): Promise<string | null> {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.AZURE_AD_CLIENT_ID!,
    client_secret: process.env.AZURE_AD_CLIENT_SECRET!,
    scope: "https://graph.microsoft.com/.default",
  });
  const res = await fetch(
    `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/v2.0/token`,
    { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() },
  );
  const data = await res.json();
  return data.error ? null : data.access_token;
}

export interface ActionResult {
  success?: boolean;
  error?: string;
}

// ── 스캔본 업로드 ──
export async function uploadContractScan(formData: FormData): Promise<ActionResult> {
  const file = formData.get("file") as File;
  const clientFileName = formData.get("fileName") as string | null;
  const numbering = formData.get("numbering") as string;

  if (!file) return { error: "파일을 선택해주세요." };

  const token = await getGraphToken();
  if (!token) return { error: "인증에 실패했습니다." };

  const driveId = process.env.SHAREPOINT_CONTRACTS_DRIVE_ID;
  // 운영부/01. 계약서/2026년/00.스캔본
  const folderId = "01TGOQVTVDB2S52DQSDNHZILBHFNGB6MF5";

  const fileName = clientFileName || file.name;
  const buffer = Buffer.from(await file.arrayBuffer());

  // 임시 파일명으로 업로드
  const ext = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".")) : "";
  const tempName = `upload_${Date.now()}${ext}`;

  const uploadRes = await fetch(
    `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${folderId}:/${tempName}:/content`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": file.type || "application/octet-stream" },
      body: buffer,
    },
  );

  if (!uploadRes.ok) {
    console.error("Scan upload error:", await uploadRes.text());
    return { error: "파일 업로드에 실패했습니다." };
  }

  const uploadData = await uploadRes.json();
  const uploadedItemId = uploadData.id as string;

  // 원본 파일명으로 리네임
  const safeName = fileName.replace(/["*:<>?/\\|~#%&{}]/g, "").trim();
  if (uploadedItemId && safeName) {
    const renameRes = await fetch(
      `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${uploadedItemId}`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: safeName }),
      },
    );
    if (!renameRes.ok) {
      console.error("Rename error:", await renameRes.text());
    }
  }

  revalidatePath("/operations/contracts");
  return { success: true };
}

// ── 미완료 계약 알림 메일 발송 ──
export async function sendContractReminder(
  incompleteList: { universityName: string; numbering: string; category: string }[],
  operatorEmail: string,
  operatorName: string,
): Promise<ActionResult> {
  if (!operatorEmail) return { error: "이메일 주소가 없습니다." };
  if (incompleteList.length === 0) return { error: "미완료 건이 없습니다." };

  const rows = incompleteList.map((c) =>
    `<tr><td style="padding:8px;border-bottom:1px solid #e9ecef">${c.numbering}</td><td style="padding:8px;border-bottom:1px solid #e9ecef">${c.category}</td><td style="padding:8px;border-bottom:1px solid #e9ecef;font-weight:600">${c.universityName}</td></tr>`
  ).join("");

  const html = `
    <div style="font-family:'Pretendard',sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f8f9fa;border-radius:12px;">
      <div style="background:#fff;border-radius:8px;padding:32px;border:1px solid #e9ecef;">
        <h2 style="margin:0 0 8px;font-size:20px;color:#212529;">계약 미완료 안내</h2>
        <p style="margin:0 0 24px;font-size:14px;color:#868e96;">${operatorName}님, 아래 대학의 계약이 아직 완료되지 않았습니다.</p>

        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr style="background:#f1f3f5;">
              <th style="padding:10px 8px;text-align:left;font-size:12px;color:#868e96;">번호</th>
              <th style="padding:10px 8px;text-align:left;font-size:12px;color:#868e96;">구분</th>
              <th style="padding:10px 8px;text-align:left;font-size:12px;color:#868e96;">대학명</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <div style="margin-top:24px;padding:16px;background:#fff3bf;border-radius:8px;font-size:13px;color:#664d03;">
          총 <strong>${incompleteList.length}건</strong>의 계약이 미완료 상태입니다.<br/>
          빠른 확인 및 처리를 부탁드립니다.
        </div>

        <p style="margin-top:24px;font-size:12px;color:#868e96;">
          DOT. OperatingSpace에서 자동 발송된 메일입니다.
        </p>
      </div>
    </div>
  `;

  try {
    await sendMail({
      to: operatorEmail,
      subject: `[계약 미완료 안내] ${incompleteList.length}건 확인 필요 - ${operatorName}`,
      html,
    });
  } catch (err) {
    console.error("Contract reminder mail error:", err);
    return { error: "메일 발송에 실패했습니다." };
  }

  return { success: true };
}

// ── 이전 계약서 검색 (대학명 기반) ──
export async function searchPreviousContracts(universityName: string): Promise<{ name: string; webUrl: string }[]> {
  const [y2025, y2024] = await Promise.all([
    getPreviousContracts("2025"),
    getPreviousContracts("2024"),
  ]);
  const allFiles = [...y2025, ...y2024];

  const uniName = universityName.replace(/\s/g, "").replace(/\(.*?\)/g, "");
  const coreName = uniName
    .replace(/(대학교|대학원|대학|초등학교|중학교|고등학교|학교)$/g, "")
    .replace(/^(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)/, "");

  const filtered = allFiles.filter((f) => {
    const fn = f.name.replace(/\s/g, "");
    return fn.includes(uniName) || fn.includes(coreName);
  });

  console.log(`[이전계약서] 대학명: ${universityName}, coreName: ${coreName}, 전체: ${allFiles.length}, 매칭: ${filtered.length}건`);
  return filtered;
}

// ── 이전 계약서 폴더 목록 조회 ──
async function getPreviousContracts(year: string): Promise<{ name: string; webUrl: string }[]> {
  const token = await getGraphToken();
  if (!token) return [];

  const driveId = process.env.SHAREPOINT_CONTRACTS_DRIVE_ID;
  // 01. 계약서 폴더 ID
  const contractsFolderId = "01TGOQVTQK4DS52MJMJVFIWDVTXGIE7YU5";

  // 해당 연도 폴더 찾기
  const res = await fetch(
    `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${contractsFolderId}/children`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const data = await res.json();
  console.log("[이전계약서] 01.계약서 하위 폴더:", (data.value || []).map((f: any) => f.name));
  const yearFolder = (data.value || []).find((f: any) => f.name.includes(year));
  if (!yearFolder) {
    console.log(`[이전계약서] ${year} 폴더를 찾을 수 없습니다.`);
    return [];
  }

  // 연도 폴더 내 모든 파일을 재귀적으로 수집 (하위 폴더 포함)
  const allFiles: { name: string; webUrl: string }[] = [];

  async function collectFiles(folderId: string) {
    const r = await fetch(
      `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${folderId}/children`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const d = await r.json();
    for (const item of d.value || []) {
      if (item.folder) {
        // 하위 폴더면 재귀 탐색
        await collectFiles(item.id);
      } else {
        allFiles.push({ name: item.name, webUrl: item.webUrl ?? "" });
      }
    }
  }

  await collectFiles(yearFolder.id);
  console.log(`[이전계약서] ${year} 전체 파일 수:`, allFiles.length);

  return allFiles;
}
