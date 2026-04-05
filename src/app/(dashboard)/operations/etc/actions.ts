"use server";

import { revalidatePath } from "next/cache";

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

function toExcelDate(dateStr: string): number {
  const d = dateStr ? new Date(dateStr) : new Date();
  return Math.floor((d.getTime() / 86400000) + 25569);
}

export interface ActionResult {
  success?: boolean;
  error?: string;
}

// ── 공문 등록 ──
export async function createDocument(
  type: "발신" | "수신", docNumber: string, date: string, sender: string, title: string, writer: string, receiver: string,
): Promise<ActionResult> {
  if (!docNumber.trim() || !title.trim()) return { error: "문서번호와 제목을 입력해주세요." };
  const token = await getGraphToken();
  if (!token) return { error: "인증에 실패했습니다." };

  const driveId = process.env.SHAREPOINT_CONTRACTS_DRIVE_ID;
  const itemId = process.env.SHAREPOINT_DOCUMENTS_ITEM_ID;
  const sheetName = type === "발신" ? "(발신)2026년" : "(수신)2026년";

  const rangeRes = await fetch(`https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/workbook/worksheets/${encodeURIComponent(sheetName)}/usedRange`, { headers: { Authorization: `Bearer ${token}` } });
  const rangeData = await rangeRes.json();
  const rowCount = rangeData.values?.length ?? 5;
  const nextRow = rowCount + 1;
  const lastNo = rangeData.values?.[rowCount - 1]?.[0];
  const newNo = typeof lastNo === "number" ? lastNo + 1 : 1;

  const endCol = type === "수신" ? "H" : "G";
  const values = type === "수신"
    ? [[newNo, docNumber.trim(), toExcelDate(date), sender.trim(), title.trim(), null, receiver.trim(), writer.trim()]]
    : [[newNo, docNumber.trim(), toExcelDate(date), sender.trim(), title.trim(), null, writer.trim()]];

  const updateRes = await fetch(`https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/workbook/worksheets/${encodeURIComponent(sheetName)}/range(address='A${nextRow}:${endCol}${nextRow}')`, {
    method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ values }),
  });
  if (!updateRes.ok) return { error: "엑셀에 저장하지 못했습니다." };
  revalidatePath("/operations/etc");
  return { success: true };
}

// ── 공문 수정 ──
export async function updateDocument(
  type: "발신" | "수신", originalDocNumber: string, docNumber: string, date: string, sender: string, title: string, fileLinkVal: string, writer: string, receiver: string,
): Promise<ActionResult> {
  if (!docNumber.trim() || !title.trim()) return { error: "문서번호와 제목을 입력해주세요." };
  const token = await getGraphToken();
  if (!token) return { error: "인증에 실패했습니다." };

  const driveId = process.env.SHAREPOINT_CONTRACTS_DRIVE_ID;
  const itemId = process.env.SHAREPOINT_DOCUMENTS_ITEM_ID;
  const sheetName = type === "발신" ? "(발신)2026년" : "(수신)2026년";

  const rangeRes = await fetch(`https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/workbook/worksheets/${encodeURIComponent(sheetName)}/usedRange`, { headers: { Authorization: `Bearer ${token}` } });
  const rangeData = await rangeRes.json();
  const rows = rangeData.values as any[][];
  if (!rows) return { error: "데이터를 읽을 수 없습니다." };

  let targetRow = -1;
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][1] ?? "").trim() === originalDocNumber.trim()) { targetRow = i + 1; break; }
  }
  if (targetRow === -1) return { error: "해당 문서를 찾을 수 없습니다." };

  const endCol = type === "수신" ? "H" : "G";
  const fileVal = fileLinkVal.trim() || null;
  const values = type === "수신"
    ? [[null, docNumber.trim(), toExcelDate(date), sender.trim(), title.trim(), fileVal, receiver.trim(), writer.trim()]]
    : [[null, docNumber.trim(), toExcelDate(date), sender.trim(), title.trim(), fileVal, writer.trim()]];

  const updateRes = await fetch(`https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/workbook/worksheets/${encodeURIComponent(sheetName)}/range(address='A${targetRow}:${endCol}${targetRow}')`, {
    method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ values }),
  });
  if (!updateRes.ok) return { error: "수정에 실패했습니다." };
  revalidatePath("/operations/etc");
  return { success: true };
}

// ── 공문 파일 업로드 ──
export async function uploadDocumentFile(formData: FormData): Promise<ActionResult> {
  const file = formData.get("file") as File;
  const type = formData.get("type") as string;
  const docNumber = formData.get("docNumber") as string;

  if (!file) return { error: "파일을 선택해주세요." };

  const token = await getGraphToken();
  if (!token) return { error: "인증에 실패했습니다." };

  const driveId = process.env.SHAREPOINT_CONTRACTS_DRIVE_ID;

  // 폴더 ID (발신: 2026년(2027학년도), 수신: 2026년도)
  const folderId = type === "발신"
    ? "01TGOQVTW77IAUZFO6PRHZN7CSPDEA4LEY"
    : "01TGOQVTW4ILXC7KV4P5CIKJRB7YICDBDP";

  const fileName = file.name;
  const buffer = Buffer.from(await file.arrayBuffer());

  // 1단계: 임시 ASCII 파일명으로 업로드
  const tempExt = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".")) : "";
  const tempName = `upload_${Date.now()}${tempExt}`;

  const uploadRes = await fetch(
    `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${folderId}:/${tempName}:/content`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": file.type || "application/octet-stream",
    },
    body: buffer,
  });

  if (!uploadRes.ok) {
    console.error("SharePoint upload error:", await uploadRes.text());
    return { error: "파일 업로드에 실패했습니다." };
  }

  const uploadData = await uploadRes.json();
  const uploadedItemId = uploadData.id as string;

  // 2단계: 원본 파일명으로 리네임 (NFD→NFC 변환 + SharePoint 불법 문자 제거)
  // 클라이언트에서 NFC로 보내도 FormData 전송 과정에서 NFD로 변환될 수 있음
  // formData에 별도 필드로 NFC 파일명을 전달받음
  const clientFileName = formData.get("fileName") as string | null;
  const safeName = (clientFileName || fileName).replace(/["*:<>?/\\|~#%&{}]/g, "").trim();
  let webUrl = uploadData.webUrl as string;
  if (uploadedItemId) {
    const renameRes = await fetch(
      `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${uploadedItemId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: safeName }),
    });
    if (renameRes.ok) {
      const renameData = await renameRes.json();
      webUrl = renameData.webUrl ?? webUrl;
    } else {
      console.error("Rename error:", await renameRes.text());
    }
  }

  // 엑셀의 파일확인 열에 링크 업데이트
  if (webUrl && docNumber) {
    const itemId = process.env.SHAREPOINT_DOCUMENTS_ITEM_ID;
    const sheetName = type === "발신" ? "(발신)2026년" : "(수신)2026년";

    const rangeRes = await fetch(`https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/workbook/worksheets/${encodeURIComponent(sheetName)}/usedRange`, { headers: { Authorization: `Bearer ${token}` } });
    const rangeData = await rangeRes.json();
    const rows = rangeData.values as any[][];

    if (rows) {
      let targetRow = -1;
      for (let i = 0; i < rows.length; i++) {
        if (String(rows[i][1] ?? "").trim() === docNumber.trim()) { targetRow = i + 1; break; }
      }
      if (targetRow > 0) {
        // HYPERLINK 수식으로 텍스트 "링크" + 실제 URL 적용
        await fetch(`https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/workbook/worksheets/${encodeURIComponent(sheetName)}/range(address='F${targetRow}')`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ formulas: [[`=HYPERLINK("${webUrl}","링크")`]] }),
        });
      }
    }
  }

  revalidatePath("/operations/etc");
  return { success: true };
}

// ── 우편물 등록 ──
export async function createMailRecord(
  sendDate: string, recipient: string, recipientPerson: string, manager: string, checker: string, trackingNumber: string, remark: string,
): Promise<ActionResult> {
  if (!recipient.trim()) return { error: "수신처를 입력해주세요." };
  const token = await getGraphToken();
  if (!token) return { error: "인증에 실패했습니다." };

  const driveId = process.env.SHAREPOINT_CONTRACTS_DRIVE_ID;
  const itemId = process.env.SHAREPOINT_MAIL_ITEM_ID;
  const sheetName = "2025년도 우편물발송(04월~)";

  const rangeRes = await fetch(`https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/workbook/worksheets/${encodeURIComponent(sheetName)}/usedRange`, { headers: { Authorization: `Bearer ${token}` } });
  const rangeData = await rangeRes.json();
  const rowCount = rangeData.values?.length ?? 1;
  const nextRow = rowCount + 1;
  const lastNo = rangeData.values?.[rowCount - 1]?.[0];
  const newNo = typeof lastNo === "number" ? lastNo + 1 : 1;

  const values = [[newNo, toExcelDate(sendDate), recipient.trim(), recipientPerson.trim() || null, manager.trim() || null, checker.trim() || null, trackingNumber.trim() || null, remark.trim() || null]];

  const updateRes = await fetch(`https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/workbook/worksheets/${encodeURIComponent(sheetName)}/range(address='A${nextRow}:H${nextRow}')`, {
    method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ values }),
  });
  if (!updateRes.ok) return { error: "엑셀에 저장하지 못했습니다." };
  revalidatePath("/operations/etc");
  return { success: true };
}

// ── 우편물 수정 ──
export async function updateMailRecord(
  originalTrackingNumber: string, originalRecipient: string, sendDate: string, recipient: string, recipientPerson: string, manager: string, checker: string, trackingNumber: string, remark: string,
): Promise<ActionResult> {
  if (!recipient.trim()) return { error: "수신처를 입력해주세요." };
  const token = await getGraphToken();
  if (!token) return { error: "인증에 실패했습니다." };

  const driveId = process.env.SHAREPOINT_CONTRACTS_DRIVE_ID;
  const itemId = process.env.SHAREPOINT_MAIL_ITEM_ID;
  const sheetName = "2025년도 우편물발송(04월~)";

  const rangeRes = await fetch(`https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/workbook/worksheets/${encodeURIComponent(sheetName)}/usedRange`, { headers: { Authorization: `Bearer ${token}` } });
  const rangeData = await rangeRes.json();
  const rows = rangeData.values as any[][];
  if (!rows) return { error: "데이터를 읽을 수 없습니다." };

  let targetRow = -1;
  for (let i = 0; i < rows.length; i++) {
    const rowRecipient = String(rows[i][2] ?? "").trim();
    const rowTracking = String(rows[i][6] ?? "").trim();
    if (rowRecipient === originalRecipient.trim() && rowTracking === (originalTrackingNumber || "").trim()) {
      targetRow = i + 1; break;
    }
  }
  if (targetRow === -1) return { error: "해당 데이터를 찾을 수 없습니다." };

  const values = [[null, toExcelDate(sendDate), recipient.trim(), recipientPerson.trim() || "", manager.trim() || "", checker.trim() || "", trackingNumber.trim() || "", remark.trim() || ""]];

  const updateRes = await fetch(`https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/workbook/worksheets/${encodeURIComponent(sheetName)}/range(address='A${targetRow}:H${targetRow}')`, {
    method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ values }),
  });
  if (!updateRes.ok) return { error: "수정에 실패했습니다." };
  revalidatePath("/operations/etc");
  return { success: true };
}
