import Link from "next/link";
import { notFound } from "next/navigation";
import {
  IconArrowLeft, IconBuildingBank, IconUser, IconMapPin,
  IconCategory, IconFileText, IconStack2, IconCheck,
} from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/common";
import WorkLogEditor from "./WorkLogEditor";

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

  const serviceName = (service.service_name ?? "서비스").replace(/\d{4}학년도\s*|\d{4}-(?=\d학기)/g, "");

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${service.university_name ?? "미지정"} - ${serviceName}`}
        breadcrumb={["운영", "서비스 관리", service.university_name ?? "미지정"]}
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

      {/* ── 서비스 정보 히어로 카드 ── */}
      <div className="space-y-3">
      <h2 className="text-lg font-black text-on-surface tracking-tight">서비스정보</h2>
      <div className="relative overflow-hidden rounded-2xl border border-outline-variant/15 bg-surface-container">
        {/* 좌측 액센트 바 */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-tertiary" />

        <div className="pl-6 pr-6 py-5">
          {/* 상단: 대학명 + 서비스명 */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                  <IconBuildingBank size={18} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-on-surface tracking-tight leading-tight">
                    {service.university_name ?? "미지정"}
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">{serviceName}</p>
                </div>
              </div>
            </div>
            {service.is_exclusive && (
              <span className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold">
                <IconCheck size={12} /> 단독
              </span>
            )}
          </div>

          {/* 하단: 메타데이터 칩 */}
          <div className="flex items-center gap-2 flex-wrap">
            <MetaChip icon={IconFileText} label="접수" value={service.reception_type} />
            <MetaChip icon={IconStack2} label="구분" value={service.university_type} />
            <MetaChip icon={IconMapPin} label="지역" value={service.region} />
            <MetaChip icon={IconCategory} label="카테고리" value={service.category} />
            <MetaChip icon={IconUser} label="운영자" value={service.operator} accent />
          </div>
        </div>
      </div>
      </div>

      {/* 작업이력 */}
      <WorkLogEditor serviceId={service.id} workLogs={workLogs ?? []} />
    </div>
  );
}

function MetaChip({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof IconUser;
  label: string;
  value: string | null | undefined;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high/80">
      <Icon size={13} className={accent ? "text-primary" : "text-on-surface-variant/50"} />
      <span className="text-[10px] text-on-surface-variant">{label}</span>
      <span className={`text-xs font-bold ${accent ? "text-primary" : "text-on-surface"}`}>
        {value ?? "-"}
      </span>
    </div>
  );
}
