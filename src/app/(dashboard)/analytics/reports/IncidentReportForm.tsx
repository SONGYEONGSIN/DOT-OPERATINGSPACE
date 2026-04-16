"use client";

import { useState } from "react";
import { IconDownload } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { Card } from "@/components/common";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType } from "docx";
import { saveAs } from "file-saver";

const inputClass = "w-full bg-[var(--color-surface)] border-none rounded-[14px] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none";
const labelClass = "block text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-2";
const textareaClass = "w-full bg-[var(--color-surface)] border-none rounded-[14px] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none resize-none";

export default function IncidentReportForm() {
  const [universityName, setUniversityName] = useState("");
  const [incidentTitle, setIncidentTitle] = useState("");
  const [writeDate, setWriteDate] = useState(new Date().toISOString().slice(0, 10));
  const [writer, setWriter] = useState("");
  const [background, setBackground] = useState("");
  const [cause, setCause] = useState("");
  const [resolution, setResolution] = useState("");
  const [prevention, setPrevention] = useState("");

  async function generateDocx() {
    const today = writeDate.replace(/-/g, "");
    const fileName = `${universityName || "대학명"}_${incidentTitle || "경위서"}_${today}.docx`;

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({ text: "경 위 서", bold: true, size: 36, font: "맑은 고딕" }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              createTableRow("기 관 명", universityName || "-"),
              createTableRow("경 위 명", incidentTitle || "-"),
              createTableRow("작 성 일", writeDate || "-"),
              createTableRow("작 성 자", writer || "-"),
            ],
          }),
          new Paragraph({ spacing: { before: 400 }, children: [] }),
          createSectionHeading("1. 사고 경위"),
          ...textToParagraphs(background),
          createSectionHeading("2. 사고 원인"),
          ...textToParagraphs(cause),
          createSectionHeading("3. 사고 처리"),
          ...textToParagraphs(resolution),
          createSectionHeading("4. 재발 방지 대책"),
          ...textToParagraphs(prevention),
          new Paragraph({ spacing: { before: 600 }, children: [] }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "주식회사 진학어플라이", bold: true, size: 24, font: "맑은 고딕" }),
            ],
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, fileName);
  }

  return (
    <Card className="p-6 space-y-5">
      <h3 className="text-base font-bold text-[var(--color-text)]">경위서 작성</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>기관명 (대학명)</label>
          <input type="text" value={universityName} onChange={(e) => setUniversityName(e.target.value)} placeholder="예: 건국대학교" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>경위명</label>
          <input type="text" value={incidentTitle} onChange={(e) => setIncidentTitle(e.target.value)} placeholder="예: 수시모집 수험번호 설정 오류의 건" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>작성일</label>
          <input type="date" value={writeDate} onChange={(e) => setWriteDate(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>작성자</label>
          <input type="text" value={writer} onChange={(e) => setWriter(e.target.value)} placeholder="작성자 이름" className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>1. 사고 경위</label>
        <textarea rows={5} value={background} onChange={(e) => setBackground(e.target.value)} placeholder="사고가 발생한 시간, 상황, 경과를 상세히 기술하세요." className={textareaClass} />
      </div>
      <div>
        <label className={labelClass}>2. 사고 원인</label>
        <textarea rows={4} value={cause} onChange={(e) => setCause(e.target.value)} placeholder="사고의 근본 원인을 분석하여 기술하세요." className={textareaClass} />
      </div>
      <div>
        <label className={labelClass}>3. 사고 처리</label>
        <textarea rows={4} value={resolution} onChange={(e) => setResolution(e.target.value)} placeholder="사고 인지 후 처리한 내용을 기술하세요." className={textareaClass} />
      </div>
      <div>
        <label className={labelClass}>4. 재발 방지 대책</label>
        <textarea rows={4} value={prevention} onChange={(e) => setPrevention(e.target.value)} placeholder="향후 동일 사고를 방지하기 위한 대책을 기술하세요." className={textareaClass} />
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

function createTableRow(label: string, value: string) {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 25, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 22, font: "맑은 고딕" })] })],
        borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 }, left: { style: BorderStyle.SINGLE, size: 1 }, right: { style: BorderStyle.SINGLE, size: 1 } },
      }),
      new TableCell({
        width: { size: 75, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: value, size: 22, font: "맑은 고딕" })] })],
        borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 }, left: { style: BorderStyle.SINGLE, size: 1 }, right: { style: BorderStyle.SINGLE, size: 1 } },
      }),
    ],
  });
}

function createSectionHeading(text: string) {
  return new Paragraph({
    spacing: { before: 300, after: 100 },
    children: [new TextRun({ text, bold: true, size: 24, font: "맑은 고딕" })],
  });
}

function textToParagraphs(text: string) {
  if (!text.trim()) return [new Paragraph({ children: [new TextRun({ text: "-", size: 22, font: "맑은 고딕" })] })];
  return text.split("\n").map((line) =>
    new Paragraph({
      spacing: { after: 80 },
      children: [new TextRun({ text: line, size: 22, font: "맑은 고딕" })],
    })
  );
}
