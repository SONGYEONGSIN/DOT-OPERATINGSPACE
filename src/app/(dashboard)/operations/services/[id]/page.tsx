import Link from "next/link";
import { notFound } from "next/navigation";
import { IconArrowLeft } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Card, StatusBadge } from "@/components/common";
import WorkLogEditor from "./WorkLogEditor";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return dateStr.slice(2, 10).replace(/-/g, ".");
}


interface PageProps {
  params: { id: string };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = createClient();

  const { data: service, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !service) {
    notFound();
  }

  const { data: workLogs } = await supabase
    .from("service_work_logs")
    .select("*")
    .eq("service_id", service.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${service.university_name ?? "미지정"} - ${(service.service_name ?? "서비스").replace(/\d{4}학년도\s*|\d{4}-(?=\d학기)/g, "")}`}
        breadcrumb={[
          "운영",
          "서비스 관리",
          service.university_name ?? "미지정",
        ]}
        actions={
          <Link
            href="/operations/services"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container-high text-on-surface-variant text-xs font-bold transition-colors hover:bg-surface-container-highest"
          >
            <IconArrowLeft size={16} />
            목록으로
          </Link>
        }
      />

      {/* 서비스 정보 */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-primary">서비스정보</h2>
        <Card className="p-6">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-3">
          <InfoRow label="접수구분" value={service.reception_type} />
          <InfoRow label="대학명" value={service.university_name} />
          <InfoRow label="대학구분" value={service.university_type} />
          <InfoRow label="지역" value={service.region} />
          <InfoRow label="서비스명" value={service.service_name?.replace(/\d{4}학년도\s*|\d{4}-(?=\d학기)/g, "") ?? null} />
          <InfoRow label="카테고리" value={service.category} />
          <InfoRow label="운영자" value={service.operator} />
          <InfoRow
            label="단독여부"
            value={service.is_exclusive ? "Y" : "N"}
            badge
          />
        </div>
      </Card>
      </div>

      {/* 작업이력 */}
      <WorkLogEditor serviceId={service.id} workLogs={workLogs ?? []} />
    </div>
  );
}

/* --- 보조 컴포넌트 --- */

function InfoRow({
  label,
  value,
  badge,
}: {
  label: string;
  value: string | null | undefined;
  badge?: boolean;
}) {
  const displayValue = value ?? "-";

  return (
    <div className="flex items-start gap-3">
      <span className="text-xs font-bold text-on-surface-variant w-20 shrink-0 pt-0.5">
        {label}
      </span>
      {badge && value ? (
        <StatusBadge variant="info">{displayValue}</StatusBadge>
      ) : (
        <span className="text-sm text-on-surface">{displayValue}</span>
      )}
    </div>
  );
}

