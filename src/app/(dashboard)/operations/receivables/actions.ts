"use server";

import { revalidatePath } from "next/cache";
import { sendMail } from "@/lib/mail";

async function getGraphToken(): Promise<string | null> {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.AZURE_AD_CLIENT_ID!,
    client_secret: process.env.AZURE_AD_CLIENT_SECRET!,
    scope: "https://graph.microsoft.com/.default",
  });

  const res = await fetch(
    `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    },
  );

  const data = await res.json();
  return data.error ? null : data.access_token;
}

export interface UpdateResult {
  success?: boolean;
  error?: string;
}

export async function updateReceivableCell(
  university: string,
  amount: number,
  schoolContact: string,
  memo: string,
): Promise<UpdateResult> {
  const token = await getGraphToken();
  if (!token) return { error: "인증에 실패했습니다." };

  const driveId = process.env.SHAREPOINT_RECEIVABLES_DRIVE_ID;
  const itemId = process.env.SHAREPOINT_RECEIVABLES_ITEM_ID;

  // 첫 번째 시트 사용
  const wsRes = await fetch(
    `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/workbook/worksheets`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const wsData = await wsRes.json();
  const sheets = (wsData.value ?? []) as { name: string }[];
  const sheetName = sheets[0]?.name;
  if (!sheetName) return { error: "시트를 찾을 수 없습니다." };

  // 시트 데이터 조회
  const rangeRes = await fetch(
    `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/workbook/worksheets/${encodeURIComponent(sheetName)}/usedRange`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const rangeData = await rangeRes.json();
  const rows = rangeData.values as any[][];
  if (!rows) return { error: "데이터를 읽을 수 없습니다." };

  // 거래처명 + 청구금액으로 행 찾기
  let targetRow = -1;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (String(row[3] ?? "").trim() === university.trim() && Number(row[6]) === amount) {
      targetRow = i + 1; // Excel은 1-based
      break;
    }
  }

  if (targetRow === -1) return { error: "해당 데이터를 찾을 수 없습니다." };

  // H열(학교담당자) 업데이트 (빈 값도 저장하여 삭제 가능)
  const cellAddr = `H${targetRow}`;
  await fetch(
    `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/workbook/worksheets/${encodeURIComponent(sheetName)}/range(address='${cellAddr}')`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [[schoolContact || ""]] }),
    },
  );

  // K열(적요) 업데이트
  const memoAddr = `K${targetRow}`;
  const memoRes = await fetch(
    `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/workbook/worksheets/${encodeURIComponent(sheetName)}/range(address='${memoAddr}')`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [[memo]] }),
    },
  );

  if (!memoRes.ok) {
    const err = await memoRes.text();
    console.error("SharePoint update error:", err);
    return { error: "엑셀 업데이트에 실패했습니다." };
  }

  revalidatePath("/operations/receivables");
  return { success: true };
}

export async function sendDunningMail(
  toEmail: string,
  university: string,
  detail: string,
  amount: number,
  invoiceDate: string | null,
  daysElapsed: number,
  operator: string,
): Promise<UpdateResult> {
  if (!toEmail || !toEmail.includes("@")) {
    return { error: "유효한 이메일 주소가 없습니다." };
  }

  const amountStr = amount.toLocaleString();

  const html = `
    <div style="font-family: 'Pretendard', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f8f9fa; border-radius: 12px;">
      <div style="background: #fff; border-radius: 8px; padding: 32px; border: 1px solid #e9ecef;">
        <h2 style="margin: 0 0 8px; font-size: 20px; color: #212529;">미수금 입금 안내</h2>
        <p style="margin: 0 0 24px; font-size: 14px; color: #868e96;">진학어플라이에서 발송된 미수금 안내 메일입니다.</p>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 12px 8px; color: #868e96; width: 120px;">거래처명</td>
            <td style="padding: 12px 8px; font-weight: 600; color: #212529;">${university}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 12px 8px; color: #868e96;">거래내역</td>
            <td style="padding: 12px 8px; color: #212529;">${detail}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 12px 8px; color: #868e96;">청구일자</td>
            <td style="padding: 12px 8px; color: #212529;">${invoiceDate ?? "-"}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 12px 8px; color: #868e96;">청구금액</td>
            <td style="padding: 12px 8px; font-weight: 700; color: #e03131; font-size: 16px;">${amountStr}원</td>
          </tr>
          <tr>
            <td style="padding: 12px 8px; color: #868e96;">경과일</td>
            <td style="padding: 12px 8px; font-weight: 600; color: ${daysElapsed >= 30 ? "#e03131" : "#212529"};">${daysElapsed}일</td>
          </tr>
        </table>

        <div style="margin-top: 24px; padding: 16px; background: #fff3bf; border-radius: 8px; font-size: 13px; color: #664d03;">
          상기 청구 건에 대한 입금이 확인되지 않았습니다.<br/>
          확인 후 빠른 입금 처리를 부탁드립니다.<br/>
          문의사항이 있으시면 담당자에게 연락해 주세요.
        </div>

        <p style="margin-top: 24px; font-size: 12px; color: #868e96;">
          담당자: ${operator} | 진학어플라이<br/>
          본 메일은 Orchestrator System에서 자동 발송되었습니다.
        </p>
      </div>
    </div>
  `;

  try {
    await sendMail({
      to: toEmail,
      subject: `[입금 안내] ${university} - 미수금 ${amountStr}원 안내`,
      html,
    });
  } catch (err) {
    console.error("Dunning mail error:", err);
    return { error: "메일 발송에 실패했습니다." };
  }

  return { success: true };
}
