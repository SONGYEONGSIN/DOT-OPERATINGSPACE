import { Suspense } from "react";
import {
  PageHeader,
  KpiGrid,
  KpiCard,
  StatusBadge,
  Card,
  DataTable,
  TableSection,
} from "@/components/common";
import { IconFileText, IconMailForward, IconCalendarEvent, IconHash } from "@tabler/icons-react";
import { fetchDocuments, fetchMailRecords } from "@/lib/sharepoint";
import EtcTabs from "./EtcTabs";
import EtcFilters from "./EtcFilters";
import DocActionMenu from "./DocActionMenu";
import MailActionMenu from "./MailActionMenu";

interface PageProps {
  searchParams: Promise<{
    tab?: string;
    search?: string;
    docType?: string;
    year?: string;
    writer?: string;
  }>;
}

export default async function EtcPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentTab = params.tab ?? "documents";
  const searchFilter = params.search ?? "";
  const docTypeFilter = params.docType ?? "발신";
  const yearFilter = params.year ?? "2026";
  const writerFilter = params.writer ?? "";

  const [docResult, mailResult] = await Promise.all([
    fetchDocuments(),
    fetchMailRecords(),
  ]);

  const documents = docResult?.items ?? [];
  const mailRecords = mailResult?.items ?? [];

  // 공문 KPI
  const doc2026 = documents.filter((d) => d.year === "2026");
  const sendCount = doc2026.filter((d) => d.type === "발신").length;
  const recvCount = doc2026.filter((d) => d.type === "수신").length;

  if (currentTab === "mail") {
    // ── 우편물 ──
    let filtered = mailRecords;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.recipient.toLowerCase().includes(q) ||
          m.recipientPerson.toLowerCase().includes(q) ||
          m.manager.toLowerCase().includes(q) ||
          (m.trackingNumber ?? "").toLowerCase().includes(q),
      );
    }
    if (writerFilter) {
      filtered = filtered.filter((m) => m.manager === writerFilter);
    }

    const uniqueManagers = [...new Set(mailRecords.map((m) => m.manager).filter(Boolean))].sort();

    const mailColumns = [
      { key: "no", label: "NO", className: "w-[5%]" },
      { key: "sendDate", label: "발송일", className: "w-[10%]" },
      { key: "recipient", label: "수신처", className: "w-[22%]" },
      { key: "recipientPerson", label: "수신자", className: "w-[10%]" },
      { key: "manager", label: "담당자", className: "w-[10%]" },
      { key: "checker", label: "확인", className: "w-[8%]" },
      { key: "trackingNumber", label: "등기번호", className: "w-[16%]" },
      { key: "remark", label: "비고" },
      { key: "action", label: "", className: "w-[4%]" },
    ];

    const mailData = filtered.map((m, i) => ({
      no: <span className="text-xs text-on-surface-variant tabular-nums">{m.no ?? i + 1}</span>,
      sendDate: <span className="text-xs text-on-surface-variant tabular-nums">{m.sendDate ?? "-"}</span>,
      recipient: <span className="text-sm text-on-surface">{m.recipient}</span>,
      recipientPerson: <span className="text-xs text-on-surface-variant">{m.recipientPerson}</span>,
      manager: <span className="text-xs text-on-surface">{m.manager}</span>,
      checker: <span className="text-xs text-on-surface-variant">{m.checker ?? "-"}</span>,
      trackingNumber: <span className="text-xs font-mono text-on-surface-variant">{m.trackingNumber ?? "-"}</span>,
      remark: <span className="text-xs text-on-surface-variant">{m.remark ?? "-"}</span>,
      action: <MailActionMenu sendDate={m.sendDate} recipient={m.recipient} recipientPerson={m.recipientPerson} manager={m.manager} checker={m.checker} trackingNumber={m.trackingNumber} remark={m.remark} />,
    }));

    return (
      <div className="space-y-8">
        <PageHeader
          title="기타"
          description="공문 관리대장, 우편물 관리대장 등 운영 부수 업무를 관리합니다."
          breadcrumb={["운영", "기타"]}
        />

        <KpiGrid>
          <KpiCard icon={<IconFileText size={18} className="text-on-surface-variant" />} label="전체 공문" value={documents.length.toString()} suffix="건" change={`2026년 발신 ${sendCount} · 수신 ${recvCount}`} />
          <KpiCard icon={<IconMailForward size={18} className="text-on-surface-variant" />} label="우편물" value={mailRecords.length.toString()} suffix="건" />
          <KpiCard icon={<IconCalendarEvent size={18} className="text-on-surface-variant" />} label="공문 연도" value="2" suffix="개년" />
          <KpiCard icon={<IconHash size={18} className="text-on-surface-variant" />} label="우편물 연도" value="1" suffix="개년" />
        </KpiGrid>

        <Suspense><EtcTabs /></Suspense>
        <Suspense><EtcFilters mode="mail" managers={uniqueManagers} /></Suspense>

        <TableSection totalCount={filtered.length}>
          <DataTable columns={mailColumns} data={mailData} />
          {filtered.length === 0 && (
            <div className="py-12 text-center text-on-surface-variant text-xs">해당 조건의 우편물이 없습니다.</div>
          )}
        </TableSection>
      </div>
    );
  }

  // ── 공문 ──
  let filtered = documents.filter((d) => d.year === yearFilter);
  if (docTypeFilter) filtered = filtered.filter((d) => d.type === docTypeFilter);
  if (writerFilter) filtered = filtered.filter((d) => d.writer === writerFilter);
  if (searchFilter) {
    const q = searchFilter.toLowerCase();
    filtered = filtered.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.sender.toLowerCase().includes(q) ||
        d.docNumber.toLowerCase().includes(q),
    );
  }

  const uniqueWriters = [...new Set(documents.filter((d) => d.year === yearFilter).map((d) => d.writer).filter(Boolean))] as string[];

  const docColumns = [
    { key: "no", label: "NO", className: "w-[5%]" },
    { key: "docNumber", label: "문서번호", className: "w-[16%]" },
    { key: "date", label: "일자", className: "w-[10%]" },
    { key: "sender", label: "발신처", className: "w-[14%]" },
    { key: "title", label: "공문제목" },
    { key: "file", label: "파일", className: "w-[6%]" },
    { key: "writer", label: "작성자", className: "w-[8%]" },
    { key: "action", label: "", className: "w-[4%]" },
  ];

  const docData = filtered.map((doc) => ({
    no: <span className="text-xs text-on-surface-variant tabular-nums">{doc.no ?? "-"}</span>,
    docNumber: <span className="text-xs font-mono text-on-surface-variant">{doc.docNumber}</span>,
    date: <span className="text-xs text-on-surface-variant tabular-nums">{doc.date ?? "-"}</span>,
    sender: <span className="text-xs text-on-surface">{doc.sender}</span>,
    title: <span className="text-sm text-on-surface">{doc.title}</span>,
    file: doc.fileLink ? (
      doc.fileLink.startsWith("http") || doc.fileLink.startsWith("../") ? (
        <a href={doc.fileLink.startsWith("http") ? doc.fileLink : `https://jinhaksa.sharepoint.com${doc.fileLink.replace(/^\.\.\/\.\.\/\.\.\/\.\.\/\.\./, "")}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-medium hover:underline">확인</a>
      ) : (
        <span className="text-xs text-primary font-medium">확인</span>
      )
    ) : <span className="text-xs text-on-surface-variant">-</span>,
    writer: <span className="text-xs text-on-surface-variant">{doc.writer ?? "-"}</span>,
    action: <DocActionMenu type={doc.type} docNumber={doc.docNumber} date={doc.date} sender={doc.sender} title={doc.title} fileLink={doc.fileLink} writer={doc.writer} receiver={doc.receiver} />,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="기타"
        description="공문 관리대장, 우편물 관리대장 등 운영 부수 업무를 관리합니다."
        breadcrumb={["운영", "기타"]}
      />

      <KpiGrid>
        <KpiCard icon={<IconFileText size={18} className="text-on-surface-variant" />} label="전체 공문" value={documents.length.toString()} suffix="건" change={`2026년 발신 ${sendCount} · 수신 ${recvCount}`} />
        <KpiCard icon={<IconMailForward size={18} className="text-on-surface-variant" />} label="우편물" value={mailRecords.length.toString()} suffix="건" />
        <KpiCard icon={<IconCalendarEvent size={18} className="text-on-surface-variant" />} label="공문 연도" value="2" suffix="개년" />
        <KpiCard icon={<IconHash size={18} className="text-on-surface-variant" />} label="우편물 연도" value="1" suffix="개년" />
      </KpiGrid>

      <Suspense><EtcTabs /></Suspense>
      <Suspense><EtcFilters mode="documents" writers={uniqueWriters.sort()} /></Suspense>

      <TableSection totalCount={filtered.length}>
        <DataTable columns={docColumns} data={docData} />
        {filtered.length === 0 && (
          <div className="py-12 text-center text-on-surface-variant text-xs">해당 조건의 공문이 없습니다.</div>
        )}
      </TableSection>
    </div>
  );
}
