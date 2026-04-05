import { Suspense } from "react";
import {
  PageHeader,
  KpiGrid,
  KpiCard,
  StatusBadge,
  DataTable,
  TableSection,
  FilterBar,
} from "@/components/common";
import { IconSchool, IconRefresh, IconCategory, IconUsers } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import ContactActions from "./ContactActions";

interface Contact {
  id: number;
  university_name: string;
  category: string;
  department: string | null;
  role: string | null;
  person_name: string;
  phone: string | null;
  email: string | null;
  updated_at: string;
}

interface PageProps {
  searchParams: Promise<{ search?: string; tab?: string }>;
}

export default async function ContactsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const searchFilter = params.search ?? "";
  const tabFilter = params.tab ?? "all";

  const supabase = createClient();

  const { data: contactRows } = await supabase
    .from("university_contacts")
    .select("*")
    .order("university_name")
    .order("person_name");

  const contacts: Contact[] = (contactRows ?? []) as Contact[];

  const uniqueUniversities = new Set(contacts.map((c) => c.university_name)).size;
  const pimsCount = contacts.filter((c) => c.category === "PIMS").length;
  const receptionCount = contacts.filter((c) => c.category !== "PIMS").length;

  // 필터
  let filtered = contacts;
  if (tabFilter === "PIMS") filtered = filtered.filter((c) => c.category === "PIMS");
  if (tabFilter === "원서접수") filtered = filtered.filter((c) => c.category === "원서접수");

  if (searchFilter) {
    const q = searchFilter.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.university_name.toLowerCase().includes(q) ||
        c.person_name.toLowerCase().includes(q) ||
        (c.department ?? "").toLowerCase().includes(q),
    );
  }

  const columns = [
    { key: "university", label: "대학명", className: "w-[18%]" },
    { key: "category", label: "구분", className: "w-[10%]" },
    { key: "dept", label: "부서", className: "w-[14%]" },
    { key: "role", label: "직급", className: "w-[8%]" },
    { key: "person", label: "담당자", className: "w-[10%]" },
    { key: "phone", label: "연락처", className: "w-[12%]" },
    { key: "email", label: "이메일", className: "w-[18%]" },
    { key: "updated", label: "업데이트", className: "w-[10%]" },
  ];

  const tableData = filtered.map((c) => ({
    university: <span className="text-sm font-medium text-on-surface">{c.university_name}</span>,
    category: (
      <span className={c.category === "PIMS" ? "text-xs font-bold text-primary" : "text-xs font-bold text-tertiary"}>
        {c.category}
      </span>
    ),
    dept: <span className="text-xs text-on-surface-variant">{c.department ?? "-"}</span>,
    role: <span className="text-xs text-on-surface-variant">{c.role ?? "-"}</span>,
    person: <span className="text-xs font-semibold text-on-surface">{c.person_name}</span>,
    phone: <span className="text-xs text-on-surface tabular-nums">{c.phone ?? "-"}</span>,
    email: <span className="text-xs text-on-surface-variant">{c.email ?? "-"}</span>,
    updated: (
      <span className="text-xs text-on-surface-variant tabular-nums">
        {new Date(c.updated_at).toLocaleDateString("ko-KR")}
      </span>
    ),
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="대학연락처"
        description="거래 대학의 담당자 연락처를 관리합니다."
        breadcrumb={["운영", "대학연락처"]}
        actions={<ContactActions />}
      />

      <KpiGrid>
        <KpiCard icon={<IconSchool size={18} className="text-on-surface-variant" />} label="등록 대학수" value={uniqueUniversities.toString()} suffix="개" />
        <KpiCard icon={<IconUsers size={18} className="text-on-surface-variant" />} label="전체 담당자" value={contacts.length.toString()} suffix="명" />
        <KpiCard icon={<IconCategory size={18} className="text-on-surface-variant" />} label="PIMS" value={pimsCount.toString()} suffix="명" />
        <KpiCard icon={<IconRefresh size={18} className="text-on-surface-variant" />} label="원서접수" value={receptionCount.toString()} suffix="명" />
      </KpiGrid>

      <Suspense>
        <FilterBar
          searchPlaceholder="대학명, 담당자, 부서 검색..."
          tabs={[
            { label: "전체", value: "all" },
            { label: "PIMS", value: "PIMS" },
            { label: "원서접수", value: "원서접수" },
          ]}
        />
      </Suspense>

      <TableSection totalCount={filtered.length}>
        <DataTable columns={columns} data={tableData} />
        {contacts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
            <IconSchool size={40} className="opacity-30 mb-2" />
            <p className="text-sm font-medium">등록된 연락처가 없습니다.</p>
            <p className="text-xs mt-1">연락처 추가 또는 엑셀 업로드로 등록해주세요.</p>
          </div>
        )}
      </TableSection>
    </div>
  );
}
