import * as XLSX from "xlsx";

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
      cache: "no-store",
    },
  );

  const data = await res.json();
  if (data.error) {
    console.error("Graph token error:", data.error_description);
    return null;
  }
  return data.access_token;
}

function excelDateToDate(serial: number): Date {
  const utcDays = Math.floor(serial - 25569);
  return new Date(utcDays * 86400 * 1000);
}

function formatExcelDate(serial: number | null | undefined): string | null {
  if (!serial || typeof serial !== "number") return null;
  const d = excelDateToDate(serial);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export interface ReceivableItem {
  invoiceDate: string | null;
  salesType: string | null;
  university: string | null;
  detail: string | null;
  operator: string | null;
  amount: number;
  schoolContact: string | null;
  mailSentDate: string | null;
  expectedPayDate: string | null;
  memo: string | null;
  daysElapsed: number;
}

// ── 계약서 관리 ──

export interface ContractItem {
  numbering: string;
  category: string; // 4년제, 전문대, 초중고, 대학원, 기타
  serviceYn: string;
  region: string | null;
  universityName: string;
  exclusiveType: string | null; // 단독여부
  salesperson: string | null;
  operator: string | null;
  contractStatus: string | null; // 계약완료(영업), 계약완료(운영) 등
  multiYear: string | null;
  contractPeriod: string | null;
  chargeMethod: string | null; // 청구, 학생부담
  fee: number;
  remark: string | null;
  incompletionReason: string | null;
  hasScan: boolean; // 스캔본 업로드 여부
  hasOriginal: boolean; // 원본 보유 여부
}

export async function fetchContracts(): Promise<{
  items: ContractItem[];
} | null> {
  const token = await getGraphToken();
  if (!token) return null;

  const driveId = process.env.SHAREPOINT_CONTRACTS_DRIVE_ID;
  const itemId = process.env.SHAREPOINT_CONTRACTS_ITEM_ID;

  if (!driveId || !itemId) return null;

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/content`,
    {
      headers: { Authorization: `Bearer ${token}` },
      redirect: "follow",
      cache: "no-store",
    },
  );

  if (!res.ok) {
    console.error("SharePoint contracts download error:", res.status);
    return null;
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const wb = XLSX.read(buffer);

  const items: ContractItem[] = [];

  // 4년제 시트
  const sheet4 = wb.Sheets["4년제"];
  if (sheet4) {
    const rows = XLSX.utils.sheet_to_json<any[]>(sheet4, { header: 1 });
    for (let i = 2; i < rows.length; i++) {
      const row = rows[i];
      if (!Array.isArray(row)) continue;
      const numbering = row[2] ? String(row[2]).trim() : "";
      const name = row[5] ? String(row[5]).trim() : "";
      if (!numbering || !name) continue;
      items.push({
        numbering,
        category: "4년제",
        serviceYn: row[3] ? String(row[3]).trim() : "",
        region: row[4] ? String(row[4]).trim() : null,
        universityName: name,
        exclusiveType: row[7]
          ? String(row[7]).trim()
          : row[6]
            ? String(row[6]).trim()
            : null,
        salesperson: row[8] ? String(row[8]).trim() : null,
        operator: row[9] ? String(row[9]).trim() : null,
        contractStatus: row[10] ? String(row[10]).trim() : null,
        multiYear: row[11] ? String(row[11]).trim() : null,
        contractPeriod: row[12] ? String(row[12]).trim() : null,
        chargeMethod: row[32] ? String(row[32]).trim() : null,
        fee: Number(row[33]) || 0,
        remark: row[36] ? String(row[36]).trim() : null,
        incompletionReason: row[37] ? String(row[37]).trim() : null,
        hasScan: String(row[0] ?? "").includes("○"),
        hasOriginal: String(row[1] ?? "").includes("○"),
      });
    }
  }

  // 전문대 시트
  const sheetJunmun = wb.Sheets["전문대"];
  if (sheetJunmun) {
    const rows = XLSX.utils.sheet_to_json<any[]>(sheetJunmun, { header: 1 });
    for (let i = 3; i < rows.length; i++) {
      const row = rows[i];
      if (!Array.isArray(row)) continue;
      const numbering = row[2] ? String(row[2]).trim() : "";
      const name = row[5] ? String(row[5]).trim() : "";
      if (!numbering || !name) continue;
      items.push({
        numbering,
        category: "전문대",
        serviceYn: row[3] ? String(row[3]).trim() : "",
        region: row[4] ? String(row[4]).trim() : null,
        universityName: name,
        exclusiveType: row[6] ? String(row[6]).trim() : null,
        salesperson: row[7] ? String(row[7]).trim() : null,
        operator: row[8] ? String(row[8]).trim() : null,
        contractStatus: row[9] ? String(row[9]).trim() : null,
        multiYear: null,
        contractPeriod: null,
        chargeMethod: row[31] ? String(row[31]).trim() : null,
        fee: Number(row[32]) || 0,
        remark: row[35] ? String(row[35]).trim() : null,
        incompletionReason: row[36] ? String(row[36]).trim() : null,
        hasScan: String(row[0] ?? "").includes("○"),
        hasOriginal: String(row[1] ?? "").includes("○"),
      });
    }
  }

  // 초중고 시트
  const sheetK12 = wb.Sheets["초중고"];
  if (sheetK12) {
    const rows = XLSX.utils.sheet_to_json<any[]>(sheetK12, { header: 1 });
    for (let i = 2; i < rows.length; i++) {
      const row = rows[i];
      if (!Array.isArray(row)) continue;
      const numbering = row[1] ? String(row[1]).trim() : "";
      const name = row[4] ? String(row[4]).trim() : "";
      if (!numbering || !name) continue;
      items.push({
        numbering,
        category: "초중고",
        serviceYn: row[3] ? String(row[3]).trim() : "",
        region: null,
        universityName: name,
        exclusiveType: null,
        salesperson: null,
        operator: row[5] ? String(row[5]).trim() : null,
        contractStatus: row[6] ? String(row[6]).trim() : null,
        multiYear: null,
        contractPeriod: null,
        chargeMethod: row[7] ? String(row[7]).trim() : null,
        fee: Number(row[8]) || 0,
        remark: row[13] ? String(row[13]).trim() : null,
        incompletionReason: row[14] ? String(row[14]).trim() : null,
        hasScan: String(row[0] ?? "").includes("○"),
        hasOriginal: false,
      });
    }
  }

  // 대학원 시트
  const sheetGrad = wb.Sheets["대학원"];
  if (sheetGrad) {
    const rows = XLSX.utils.sheet_to_json<any[]>(sheetGrad, { header: 1 });
    for (let i = 2; i < rows.length; i++) {
      const row = rows[i];
      if (!Array.isArray(row)) continue;
      const numbering = row[1] ? String(row[1]).trim() : "";
      const name = row[3] ? String(row[3]).trim() : "";
      if (!numbering || !name) continue;
      items.push({
        numbering,
        category: "대학원",
        serviceYn: row[2] ? String(row[2]).trim() : "",
        region: null,
        universityName: name,
        exclusiveType: null,
        salesperson: null,
        operator: row[5] ? String(row[5]).trim() : null,
        contractStatus: row[6] ? String(row[6]).trim() : null,
        multiYear: null,
        contractPeriod: row[11] ? String(row[11]).trim() : null,
        chargeMethod: row[12] ? String(row[12]).trim() : null,
        fee: Number(row[13]) || 0,
        remark: row[15] ? String(row[15]).trim() : null,
        incompletionReason: row[16] ? String(row[16]).trim() : null,
        hasScan: String(row[0] ?? "").includes("○"),
        hasOriginal: false,
      });
    }
  }

  // 기타 시트
  const sheetEtc = wb.Sheets["기타(전문학교,모의논술,공공 등)"];
  if (sheetEtc) {
    const rows = XLSX.utils.sheet_to_json<any[]>(sheetEtc, { header: 1 });
    for (let i = 2; i < rows.length; i++) {
      const row = rows[i];
      if (!Array.isArray(row)) continue;
      const numbering = row[0] ? String(row[0]).trim() : "";
      const name = row[4] ? String(row[4]).trim() : "";
      if (!numbering || !name) continue;
      items.push({
        numbering,
        category: "기타",
        serviceYn: row[2] ? String(row[2]).trim() : "",
        region: null,
        universityName: name,
        exclusiveType: null,
        salesperson: null,
        operator: row[5] ? String(row[5]).trim() : null,
        contractStatus: row[6] ? String(row[6]).trim() : null,
        multiYear: null,
        contractPeriod: null,
        chargeMethod: row[7] ? String(row[7]).trim() : null,
        fee: Number(row[8]) || 0,
        remark: row[12] ? String(row[12]).trim() : null,
        incompletionReason: null,
        hasScan: String(row[1] ?? "").includes("○"),
        hasOriginal: false,
      });
    }
  }

  return { items };
}

export async function fetchReceivables(): Promise<{
  items: ReceivableItem[];
  sheetName: string;
  totalAmount: number;
} | null> {
  const token = await getGraphToken();
  if (!token) return null;

  const driveId = process.env.SHAREPOINT_RECEIVABLES_DRIVE_ID;
  const itemId = process.env.SHAREPOINT_RECEIVABLES_ITEM_ID;

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/content`,
    {
      headers: { Authorization: `Bearer ${token}` },
      redirect: "follow",
      cache: "no-store",
    },
  );

  if (!res.ok) {
    console.error("SharePoint download error:", res.status);
    return null;
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const wb = XLSX.read(buffer);

  // 첫 번째 시트 사용
  const latestSheet = wb.SheetNames[0];

  const ws = wb.Sheets[latestSheet];
  const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });

  // 헤더 행 찾기 (청구일자 포함)
  let headerIdx = -1;
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const row = rows[i];
    if (
      Array.isArray(row) &&
      row.some((cell) => String(cell).includes("청구일자"))
    ) {
      headerIdx = i;
      break;
    }
  }

  if (headerIdx === -1)
    return { items: [], sheetName: latestSheet, totalAmount: 0 };

  const items: ReceivableItem[] = [];
  const now = new Date();

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!Array.isArray(row)) continue;

    // 소계/합계 행 건너뛰기
    const col1 = String(row[1] ?? "");
    if (
      col1.includes("소 계") ||
      col1.includes("합   계") ||
      col1.includes("합계")
    )
      continue;

    const invoiceDateRaw = row[1];
    const amount = Number(row[6]) || 0;
    if (!invoiceDateRaw || amount === 0) continue;

    const invoiceDate =
      typeof invoiceDateRaw === "number"
        ? formatExcelDate(invoiceDateRaw)
        : String(invoiceDateRaw);
    const invoiceDateObj =
      typeof invoiceDateRaw === "number"
        ? excelDateToDate(invoiceDateRaw)
        : new Date();
    const daysElapsed = Math.floor(
      (now.getTime() - invoiceDateObj.getTime()) / (1000 * 60 * 60 * 24),
    );

    items.push({
      invoiceDate,
      salesType: row[2] ? String(row[2]) : null,
      university: row[3] ? String(row[3]) : null,
      detail: row[4] ? String(row[4]) : null,
      operator: row[5] ? String(row[5]).trim() : null,
      amount,
      schoolContact: row[7] ? String(row[7]) : null,
      mailSentDate:
        typeof row[8] === "number"
          ? formatExcelDate(row[8])
          : row[8]
            ? String(row[8])
            : null,
      expectedPayDate:
        typeof row[9] === "number"
          ? formatExcelDate(row[9])
          : row[9]
            ? String(row[9])
            : null,
      memo: row[10] ? String(row[10]) : null,
      daysElapsed: Math.max(0, daysElapsed),
    });
  }

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  return { items, sheetName: latestSheet, totalAmount };
}

// ── 공문 관리대장 ──

export interface DocumentItem {
  no: number | null;
  docNumber: string;
  date: string | null;
  sender: string;
  title: string;
  fileLink: string | null;
  writer: string | null;
  receiver: string | null; // 수신 공문에만
  type: "발신" | "수신";
  year: string;
}

export async function fetchDocuments(): Promise<{
  items: DocumentItem[];
} | null> {
  const token = await getGraphToken();
  if (!token) return null;

  const driveId = process.env.SHAREPOINT_CONTRACTS_DRIVE_ID;
  const itemId = process.env.SHAREPOINT_DOCUMENTS_ITEM_ID;
  if (!driveId || !itemId) return null;

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/content`,
    {
      headers: { Authorization: `Bearer ${token}` },
      redirect: "follow",
      cache: "no-store",
    },
  );
  if (!res.ok) return null;

  const buffer = Buffer.from(await res.arrayBuffer());
  const wb = XLSX.read(buffer);

  const items: DocumentItem[] = [];

  const targetSheets = [
    "(발신)2026년",
    "(수신)2026년",
    "(발신)2025년",
    "(수신)2025년",
  ];
  for (const sheetName of targetSheets) {
    if (!wb.Sheets[sheetName]) continue;
    const isSend = sheetName.includes("발신");
    const isRecv = sheetName.includes("수신");

    const yearMatch = sheetName.match(/(\d{4})/);
    const year = yearMatch ? yearMatch[1] : "";

    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });

    // 셀에서 하이퍼링크 URL 추출 헬퍼
    function getCellLink(col: string, rowIdx: number): string | null {
      const cell = ws[`${col}${rowIdx + 1}`]; // XLSX는 1-based
      if (!cell) return null;
      if (cell.l?.Target) return String(cell.l.Target);
      if (cell.l?.Rel?.Target) return String(cell.l.Rel.Target);
      return null;
    }

    for (let i = 5; i < rows.length; i++) {
      const row = rows[i];
      if (!Array.isArray(row)) continue;
      const docNumber = row[1] ? String(row[1]).trim() : "";
      const title = row[4] ? String(row[4]).trim() : "";
      if (!docNumber || !title) continue;

      const dateRaw = row[2];
      const dateStr =
        typeof dateRaw === "number"
          ? formatExcelDate(dateRaw)
          : dateRaw
            ? String(dateRaw)
            : null;

      // F열 하이퍼링크 추출
      const hyperlink = getCellLink("F", i);
      const fileLinkValue =
        hyperlink ?? (row[5] ? String(row[5]).trim() : null);

      if (isRecv) {
        items.push({
          no: typeof row[0] === "number" ? row[0] : null,
          docNumber,
          date: dateStr,
          sender: row[3] ? String(row[3]).trim() : "",
          title,
          fileLink: fileLinkValue,
          receiver: row[6] ? String(row[6]).trim() : null,
          writer: row[7] ? String(row[7]).trim() : null,
          type: "수신",
          year,
        });
      } else {
        items.push({
          no: typeof row[0] === "number" ? row[0] : null,
          docNumber,
          date: dateStr,
          sender: row[3] ? String(row[3]).trim() : "",
          title,
          fileLink: fileLinkValue,
          writer: row[6] ? String(row[6]).trim() : null,
          receiver: null,
          type: "발신",
          year,
        });
      }
    }
  }

  items.reverse();
  return { items };
}

// ── 우편물 관리대장 ──

export interface MailItem {
  no: number | null;
  sendDate: string | null;
  recipient: string;
  recipientPerson: string;
  manager: string;
  checker: string | null;
  trackingNumber: string | null;
  remark: string | null;
  year: string;
}

export async function fetchMailRecords(): Promise<{
  items: MailItem[];
} | null> {
  const token = await getGraphToken();
  if (!token) return null;

  const driveId = process.env.SHAREPOINT_CONTRACTS_DRIVE_ID;
  const itemId = process.env.SHAREPOINT_MAIL_ITEM_ID;
  if (!driveId || !itemId) return null;

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/content`,
    {
      headers: { Authorization: `Bearer ${token}` },
      redirect: "follow",
      cache: "no-store",
    },
  );
  if (!res.ok) return null;

  const buffer = Buffer.from(await res.arrayBuffer());
  const wb = XLSX.read(buffer);

  const items: MailItem[] = [];

  // 2025년도 우편물발송 시트만 조회
  {
    const sheetName = "2025년도 우편물발송(04월~)";
    const year = "2025";

    const rows = XLSX.utils.sheet_to_json<any[]>(wb.Sheets[sheetName], {
      header: 1,
    });

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!Array.isArray(row)) continue;
      const recipient = row[2] ? String(row[2]).trim() : "";
      if (!recipient) continue;

      const dateRaw = row[1];
      const dateStr =
        typeof dateRaw === "number"
          ? formatExcelDate(dateRaw)
          : dateRaw
            ? String(dateRaw)
            : null;

      items.push({
        no: typeof row[0] === "number" ? row[0] : null,
        sendDate: dateStr,
        recipient,
        recipientPerson: row[3] ? String(row[3]).trim() : "",
        manager: row[4] ? String(row[4]).trim() : "",
        checker: row[5] ? String(row[5]).trim() : null,
        trackingNumber: row[6] ? String(row[6]).trim() : null,
        remark: row[7] ? String(row[7]).trim() : null,
        year,
      });
    }
  }

  items.reverse();

  return { items };
}

// ── 대학배정 ──

export interface OperatorSummary {
  name: string;
  susi4: number;
  susiJunmun: number;
  susiPoly: number;
  susiTotal: number;
  jungsi4: number;
  jungsiJunmun: number;
  jungsiPoly: number;
  jungsiTotal: number;
  etcGeneral: number;
  etcJaewoe: number;
  etcForeign: number;
  etcJunmun: number;
  etcK12: number;
  etcGrad: number;
  etcPimsFull: number;
  etcPimsSelect: number;
  etcScore: number;
  etcMock: number;
  etcApp: number;
}

export interface AssignmentItem {
  category: string;
  region: string;
  universityName: string;
  univId: number | null;
  salesperson: string;
  exclusiveSusi: string;
  exclusiveJungsi: string;
  changed: string;
  op2027: {
    jaewoe: string;
    susi: string;
    jungsi: string;
    pyeonip: string;
    foreigner: string;
    backup: string;
  };
  dev2027: {
    jaewoe: string;
    susi: string;
    jungsi: string;
    pyeonip: string;
    foreigner: string;
    backup: string;
  };
  op2026: {
    jaewoe: string;
    susi: string;
    jungsi: string;
    pyeonip: string;
    foreigner: string;
    backup: string;
  };
  dev2026: {
    jaewoe: string;
    susi: string;
    jungsi: string;
    pyeonip: string;
    foreigner: string;
    backup: string;
  };
  remark: string;
}

export interface GradAssignment {
  universityName: string;
  univId: number | null;
  serviceType: string;
  serviceYn: string;
  serviceCount: number;
  changed: string;
  operator: string;
  developer: string;
  prevOperator: string;
  prevDeveloper: string;
  remark: string;
  gradNames: string;
}

export interface PimsAssignment {
  category: string;
  region: string;
  universityName: string;
  serviceType: string;
  changed: string;
  operatorFull: string;
  operatorReception: string;
  operatorRefund: string;
  prevOperator: string;
  remark: string;
}

export interface SimpleAssignment {
  universityName: string;
  operator: string;
  developer: string;
  prevOperator: string;
  prevDeveloper: string;
  remark: string;
}

export interface ScoreAssignment {
  universityName: string;
  serviceYn: string;
  changed: string;
  operator: string;
  developer: string;
  susiNaesin: boolean;
  jungsiNaesin: boolean;
  jungsiSuneung: boolean;
  prevOperator: string;
  prevDeveloper: string;
  remark: string;
}

export interface AppAssignment {
  universityName: string;
  univId: number | null;
  receptionOp: string;
  salesperson: string;
  operator: string;
  developer: string;
  prevOperator: string;
  prevDeveloper: string;
  status: string;
  device: string;
  usage: string;
  remark: string;
}

export interface AssignmentData {
  operatorSummary: OperatorSummary[];
  developerSummary: OperatorSummary[];
  assignments: AssignmentItem[];
  gradAssignments: GradAssignment[];
  pimsAssignments: PimsAssignment[];
  mockAssignments: SimpleAssignment[];
  scoreAssignments: ScoreAssignment[];
  appAssignments: AppAssignment[];
}

export async function fetchAssignments(): Promise<AssignmentData | null> {
  const token = await getGraphToken();
  if (!token) return null;
  const driveId = process.env.SHAREPOINT_DRIVE_ID;
  const itemId = process.env.SHAREPOINT_ASSIGNMENTS_ITEM_ID;
  if (!driveId || !itemId) return null;

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/content`,
    {
      headers: { Authorization: `Bearer ${token}` },
      redirect: "follow",
      cache: "no-store",
    },
  );
  if (!res.ok) return null;

  const buffer = Buffer.from(await res.arrayBuffer());
  const wb = XLSX.read(buffer);
  const st = (v: any) => (v != null ? String(v).trim() : "");
  const nm = (v: any) => (typeof v === "number" ? v : 0);

  // 01. 배정 현황
  const rows01 = XLSX.utils.sheet_to_json<any[]>(wb.Sheets["01. 배정 현황"], {
    header: 1,
  });
  const operatorSummary: OperatorSummary[] = [];
  const developerSummary: OperatorSummary[] = [];
  function parseSummaryRow(row: any[]): OperatorSummary {
    return {
      name: st(row[0]),
      susi4: nm(row[1]),
      susiJunmun: nm(row[2]),
      susiPoly: nm(row[3]),
      susiTotal: nm(row[4]),
      jungsi4: nm(row[7]),
      jungsiJunmun: nm(row[8]),
      jungsiPoly: nm(row[9]),
      jungsiTotal: nm(row[10]),
      etcGeneral: nm(row[19]),
      etcJaewoe: nm(row[20]),
      etcForeign: nm(row[21]),
      etcJunmun: nm(row[22]),
      etcK12: nm(row[23]),
      etcGrad: nm(row[24]),
      etcPimsFull: nm(row[25]),
      etcPimsSelect: nm(row[26]),
      etcScore: nm(row[27]),
      etcMock: nm(row[28]),
      etcApp: nm(row[29]),
    };
  }
  for (let i = 2; i < rows01.length; i++) {
    const row = rows01[i];
    if (!row?.[0] || st(row[0]) === "합계") break;
    operatorSummary.push(parseSummaryRow(row));
  }
  for (let i = 24; i < rows01.length; i++) {
    const row = rows01[i];
    if (!row?.[0] || st(row[0]) === "합계") break;
    developerSummary.push(parseSummaryRow(row));
  }

  // 02. 배정리스트
  const rows02 = XLSX.utils.sheet_to_json<any[]>(wb.Sheets["02. 배정리스트"], {
    header: 1,
  });
  const assignments: AssignmentItem[] = [];
  for (let i = 2; i < rows02.length; i++) {
    const r = rows02[i];
    if (!r?.[3] || !st(r[3])) continue;
    assignments.push({
      category: st(r[1]),
      region: st(r[2]),
      universityName: st(r[3]),
      univId: typeof r[4] === "number" ? r[4] : null,
      salesperson: st(r[5]),
      exclusiveSusi: st(r[6]),
      exclusiveJungsi: st(r[7]),
      changed: st(r[11]),
      op2027: {
        jaewoe: st(r[12]),
        susi: st(r[13]),
        jungsi: st(r[14]),
        pyeonip: st(r[15]),
        foreigner: st(r[16]),
        backup: st(r[17]),
      },
      dev2027: {
        jaewoe: st(r[18]),
        susi: st(r[19]),
        jungsi: st(r[20]),
        pyeonip: st(r[21]),
        foreigner: st(r[22]),
        backup: st(r[23]),
      },
      op2026: {
        jaewoe: st(r[24]),
        susi: st(r[25]),
        jungsi: st(r[26]),
        pyeonip: st(r[27]),
        foreigner: st(r[28]),
        backup: st(r[29]),
      },
      dev2026: {
        jaewoe: st(r[30]),
        susi: st(r[31]),
        jungsi: st(r[32]),
        pyeonip: st(r[33]),
        foreigner: st(r[34]),
        backup: st(r[35]),
      },
      remark: st(r[36]),
    });
  }

  // 03. 대학원
  const rows03 = XLSX.utils.sheet_to_json<any[]>(wb.Sheets["03. 대학원"], {
    header: 1,
  });
  const gradAssignments: GradAssignment[] = [];
  for (let i = 1; i < rows03.length; i++) {
    const r = rows03[i];
    if (!r?.[1]) continue;
    gradAssignments.push({
      universityName: st(r[1]),
      univId: typeof r[2] === "number" ? r[2] : null,
      serviceType: st(r[3]),
      serviceYn: st(r[4]),
      serviceCount: nm(r[5]),
      changed: st(r[6]),
      operator: st(r[7]),
      developer: st(r[8]),
      prevOperator: st(r[9]),
      prevDeveloper: st(r[10]),
      remark: st(r[13]),
      gradNames: st(r[14]),
    });
  }

  // 04. PIMS
  const rows04 = XLSX.utils.sheet_to_json<any[]>(wb.Sheets["04. PIMS"], {
    header: 1,
  });
  const pimsAssignments: PimsAssignment[] = [];
  for (let i = 1; i < rows04.length; i++) {
    const r = rows04[i];
    if (!r?.[3]) continue;
    pimsAssignments.push({
      category: st(r[1]),
      region: st(r[2]),
      universityName: st(r[3]),
      serviceType: st(r[4]),
      changed: st(r[5]),
      operatorFull: st(r[6]),
      operatorReception: st(r[8]),
      operatorRefund: st(r[7]),
      prevOperator: st(r[9]),
      remark: st(r[10]),
    });
  }

  // 05. 모의논술
  const rows05 = XLSX.utils.sheet_to_json<any[]>(wb.Sheets["05. 모의논술"], {
    header: 1,
  });
  const mockAssignments: SimpleAssignment[] = [];
  for (let i = 1; i < rows05.length; i++) {
    const r = rows05[i];
    if (!r?.[1]) continue;
    mockAssignments.push({
      universityName: st(r[1]),
      operator: st(r[2]),
      developer: st(r[3]),
      prevOperator: st(r[4]),
      prevDeveloper: st(r[5]),
      remark: st(r[6]),
    });
  }

  // 06. 성적산출
  const rows06 = XLSX.utils.sheet_to_json<any[]>(wb.Sheets["06. 성적산출"], {
    header: 1,
  });
  const scoreAssignments: ScoreAssignment[] = [];
  for (let i = 1; i < rows06.length; i++) {
    const r = rows06[i];
    if (!r?.[1]) continue;
    scoreAssignments.push({
      universityName: st(r[1]),
      serviceYn: st(r[2]),
      changed: st(r[3]),
      operator: st(r[4]),
      developer: st(r[5]),
      susiNaesin: st(r[6]) === "O",
      jungsiNaesin: st(r[7]) === "O",
      jungsiSuneung: st(r[8]) === "O",
      prevOperator: st(r[9]),
      prevDeveloper: st(r[10]),
      remark: st(r[13]),
    });
  }

  // 07. 상담앱
  const rows07 = XLSX.utils.sheet_to_json<any[]>(wb.Sheets["07. 상담앱"], {
    header: 1,
  });
  const appAssignments: AppAssignment[] = [];
  for (let i = 1; i < rows07.length; i++) {
    const r = rows07[i];
    if (!r?.[1]) continue;
    appAssignments.push({
      universityName: st(r[1]),
      univId: typeof r[0] === "number" ? r[0] : null,
      receptionOp: st(r[3]),
      salesperson: st(r[4]),
      operator: st(r[5]),
      developer: st(r[6]),
      prevOperator: st(r[7]),
      prevDeveloper: st(r[8]),
      status: st(r[9]),
      device: st(r[17]),
      usage: st(r[19]),
      remark: st(r[20]),
    });
  }

  return {
    operatorSummary,
    developerSummary,
    assignments,
    gradAssignments,
    pimsAssignments,
    mockAssignments,
    scoreAssignments,
    appAssignments,
  };
}

// ── 기초자료 ──

export interface BaseDataItem {
  receptionType: string; // 접수구분
  serviceId: number | null; // 서비스ID
  universityName: string; // 대학명
  region: string; // 지역
  serviceName: string; // 서비스명
  developer: string; // 개발자
  operator: string; // 운영자
  universityType: string; // 대학구분
}

export interface OperatorBaseStats {
  name: string;
  totalServices: number;
  byType: Record<string, number>; // receptionType별 건수
  byUnivType: Record<string, number>; // 대학구분별 건수
}

export async function fetchBaseData(): Promise<{
  items: BaseDataItem[];
  operatorStats: OperatorBaseStats[];
} | null> {
  const token = await getGraphToken();
  if (!token) return null;
  const driveId = process.env.SHAREPOINT_DRIVE_ID;
  const itemId = process.env.SHAREPOINT_ASSIGNMENTS_ITEM_ID;
  if (!driveId || !itemId) return null;

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/content`,
    {
      headers: { Authorization: `Bearer ${token}` },
      redirect: "follow",
      cache: "no-store",
    },
  );
  if (!res.ok) return null;

  const buffer = Buffer.from(await res.arrayBuffer());
  const wb = XLSX.read(buffer);
  const st = (v: unknown) => (v != null ? String(v).trim() : "");

  // 기초자료 시트 찾기 (이름에 "기초자료" 포함)
  const baseSheetName = wb.SheetNames.find((n) => n.includes("기초자료"));
  if (!baseSheetName || !wb.Sheets[baseSheetName])
    return { items: [], operatorStats: [] };

  const rows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[baseSheetName], {
    header: 1,
  });
  const items: BaseDataItem[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i] as unknown[];
    if (!r?.[2]) continue; // 대학명 필수
    items.push({
      receptionType: st(r[0]),
      serviceId: typeof r[1] === "number" ? r[1] : null,
      universityName: st(r[2]),
      region: st(r[3]),
      serviceName: st(r[4]),
      developer: st(r[5]),
      operator: st(r[6]),
      universityType: st(r[7]),
    });
  }

  // 운영자별 통계 집계
  const statsMap = new Map<string, OperatorBaseStats>();
  for (const item of items) {
    if (!item.operator) continue;
    let stat = statsMap.get(item.operator);
    if (!stat) {
      stat = {
        name: item.operator,
        totalServices: 0,
        byType: {},
        byUnivType: {},
      };
      statsMap.set(item.operator, stat);
    }
    stat.totalServices++;
    stat.byType[item.receptionType] =
      (stat.byType[item.receptionType] ?? 0) + 1;
    stat.byUnivType[item.universityType] =
      (stat.byUnivType[item.universityType] ?? 0) + 1;
  }

  return {
    items,
    operatorStats: [...statsMap.values()].sort(
      (a, b) => b.totalServices - a.totalServices,
    ),
  };
}
