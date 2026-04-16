"use client";

import { useState } from "react";
import { IconDownload, IconPlus, IconTrash } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { Card } from "@/components/common";
import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType } from "docx";
import { saveAs } from "file-saver";

const inputClass = "w-full bg-[var(--color-surface)] border-none rounded-[14px] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none";
const labelClass = "block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2";

interface QuotationItem {
  category: string;
  detail: string;
  note: string;
  amount: string;
}

export default function QuotationForm() {
  const [recipient, setRecipient] = useState("");
  const [quotationName, setQuotationName] = useState("");
  const [quotationNo, setQuotationNo] = useState("");
  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().slice(0, 10));
  const [validPeriod, setValidPeriod] = useState("견적일로부터 30일 이내");
  const [paymentTerms, setPaymentTerms] = useState("계약서 항목에 따름");
  const [manager, setManager] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [items, setItems] = useState<QuotationItem[]>([
    { category: "인터넷 원서접수\n수수료", detail: "접수페이지", note: "접수페이지 제공(사진 업로드 가능)", amount: "" },
    { category: "", detail: "결제수수료", note: "평균 결제 수수료율 적용", amount: "" },
    { category: "", detail: "보안 컨설팅비", note: "보안관제 호스팅 서비스", amount: "" },
    { category: "", detail: "시스템 사용료", note: "접수/관리 시스템 사용료", amount: "" },
    { category: "", detail: "고객센터 운영비", note: "상시 3명 운영", amount: "" },
    { category: "", detail: "운영 인건비", note: "운영 및 개발 담당자 등 3명 기준 인건비", amount: "" },
  ]);

  function addItem() {
    setItems([...items, { category: "", detail: "", note: "", amount: "" }]);
  }

  function removeItem(idx: number) {
    setItems(items.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, field: keyof QuotationItem, value: string) {
    setItems(items.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  }

  const totalAmount = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  async function generateDocx() {
    const fileName = `견적서_${recipient || "대학명"}_${quotationDate.replace(/-/g, "")}.docx`;

    const headerRows = [
      ["수     신", recipient || "-", "법 인 명", "주식회사 진학어플라이"],
      ["견 적 명", quotationName || "-", "대표이사", "신  원  근  (인)"],
      ["견적번호", quotationNo || "-", "등록번호", "101-86-62676"],
      ["견적비용", totalAmount > 0 ? `${totalAmount.toLocaleString()}원` : "-", "주 소 지", "서울 종로구 경희궁길34 진학기획빌딩"],
      ["견적일자", quotationDate || "-", "담 당 자", manager || "-"],
      ["유효기간", validPeriod, "전화번호", "02-2013-0000"],
      ["결제조건", paymentTerms, "이 메 일", managerEmail || "-"],
    ];

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [new TextRun({ text: "견 적 서", bold: true, size: 36, font: "맑은 고딕" })],
          }),
          // 상단 정보 테이블
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: headerRows.map((row) => new TableRow({
              children: [
                makeCell(row[0], true, 15), makeCell(row[1], false, 35),
                makeCell(row[2], true, 15), makeCell(row[3], false, 35),
              ],
            })),
          }),
          new Paragraph({ spacing: { before: 300 }, children: [] }),
          // 상세 내역 테이블
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  makeCell("구  분", true, 20), makeCell("상 세 내 역", true, 30),
                  makeCell("비  고", true, 35), makeCell("비  용", true, 15),
                ],
              }),
              ...items.map((item) => new TableRow({
                children: [
                  makeCell(item.category, false, 20), makeCell(item.detail, false, 30),
                  makeCell(item.note, false, 35), makeCell(item.amount ? `${Number(item.amount).toLocaleString()}원` : "", false, 15),
                ],
              })),
              new TableRow({
                children: [
                  makeCell("총     계", true, 20), makeCell("", false, 30),
                  makeCell("", false, 35), makeCell(totalAmount > 0 ? `${totalAmount.toLocaleString()}원` : "-", true, 15),
                ],
              }),
            ],
          }),
          new Paragraph({ spacing: { before: 600 }, children: [] }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "주식회사 진학어플라이", bold: true, size: 24, font: "맑은 고딕" })],
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, fileName);
  }

  return (
    <Card className="p-6 space-y-5">
      <h3 className="text-base font-bold text-[var(--color-text)]">견적서 작성</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>수신 (대학명)</label>
          <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="예: 건국대학교" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>견적명</label>
          <input type="text" value={quotationName} onChange={(e) => setQuotationName(e.target.value)} placeholder="예: 2027학년도 인터넷 원서접수 수수료" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>견적번호</label>
          <input type="text" value={quotationNo} onChange={(e) => setQuotationNo(e.target.value)} placeholder="예: 운영2603-0101" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>견적일자</label>
          <input type="date" value={quotationDate} onChange={(e) => setQuotationDate(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>담당자</label>
          <input type="text" value={manager} onChange={(e) => setManager(e.target.value)} placeholder="담당자 이름" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>담당자 이메일</label>
          <input type="text" value={managerEmail} onChange={(e) => setManagerEmail(e.target.value)} placeholder="이메일" className={inputClass} />
        </div>
      </div>

      {/* 상세 내역 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className={labelClass}>상세 내역</label>
          <button type="button" onClick={addItem} className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors">
            <IconPlus size={12} />
            항목 추가
          </button>
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest px-1">
            <span className="col-span-2">구분</span>
            <span className="col-span-3">상세내역</span>
            <span className="col-span-4">비고</span>
            <span className="col-span-2 text-right">비용(원)</span>
            <span className="col-span-1"></span>
          </div>
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2">
              <input type="text" value={item.category} onChange={(e) => updateItem(idx, "category", e.target.value)} placeholder="구분" className={cn(inputClass, "col-span-2 text-xs")} />
              <input type="text" value={item.detail} onChange={(e) => updateItem(idx, "detail", e.target.value)} placeholder="상세내역" className={cn(inputClass, "col-span-3 text-xs")} />
              <input type="text" value={item.note} onChange={(e) => updateItem(idx, "note", e.target.value)} placeholder="비고" className={cn(inputClass, "col-span-4 text-xs")} />
              <input type="text" value={item.amount} onChange={(e) => updateItem(idx, "amount", e.target.value)} placeholder="0" className={cn(inputClass, "col-span-2 text-xs text-right tabular-nums")} />
              <button type="button" onClick={() => removeItem(idx)} className="col-span-1 flex items-center justify-center text-[var(--color-text-muted)] hover:text-error transition-colors">
                <IconTrash size={14} />
              </button>
            </div>
          ))}
          <div className="flex items-center justify-end gap-2 px-1 pt-2 border-t border-black/[0.04]/10">
            <span className="text-xs font-bold text-[var(--color-text-muted)]">총계</span>
            <span className="text-sm font-black text-[var(--color-text)] tabular-nums">{totalAmount.toLocaleString()}원</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={generateDocx} className="flex items-center gap-2 px-5 py-3 rounded-[14px] bg-primary text-on-primary text-sm font-bold hover:bg-primary/90 transition-colors">
          <IconDownload size={16} />
          Word 다운로드
        </button>
      </div>
    </Card>
  );
}

function makeCell(text: string, bold: boolean, widthPct: number) {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    children: [new Paragraph({ children: [new TextRun({ text: text || "", bold, size: 20, font: "맑은 고딕" })] })],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
    },
  });
}
