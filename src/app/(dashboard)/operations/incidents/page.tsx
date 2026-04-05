import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import {
  PageHeader,
  KpiGrid,
  KpiCard,
  Card,
  FilterBar,
  TableSection,
} from "@/components/common";
import { IconAlertOctagon, IconCircleCheck, IconClock, IconAlertTriangle } from "@tabler/icons-react";
import IncidentForm from "./IncidentForm";
import IncidentList from "./IncidentList";

interface Incident {
  id: number;
  title: string;
  incident_date: string;
  university: string | null;
  service: string | null;
  reporter: string;
  severity: string;
  status: string;
  background: string | null;
  cause: string | null;
  resolution: string | null;
  prevention: string | null;
  created_at: string;
}

interface PageProps {
  searchParams: Promise<{ search?: string; tab?: string }>;
}

export default async function IncidentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const searchFilter = params.search ?? "";
  const tabFilter = params.tab ?? "all";

  const supabase = createClient();

  const [{ data: incidents }, { data: profileRows }] = await Promise.all([
    supabase
      .from("incident_reports")
      .select("*")
      .order("incident_date", { ascending: false }),
    supabase
      .from("profiles")
      .select("name")
      .eq("status", "active")
      .order("name"),
  ]);

  const allIncidents = (incidents ?? []) as Incident[];
  const profiles = (profileRows ?? []) as { name: string }[];

  // 필터
  let filtered = allIncidents;
  if (tabFilter === "open") filtered = filtered.filter((i) => i.status !== "완료");
  if (tabFilter === "done") filtered = filtered.filter((i) => i.status === "완료");
  if (tabFilter === "urgent") filtered = filtered.filter((i) => i.severity === "높음" || i.severity === "긴급");

  if (searchFilter) {
    const q = searchFilter.toLowerCase();
    filtered = filtered.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        (i.university ?? "").toLowerCase().includes(q) ||
        i.reporter.toLowerCase().includes(q),
    );
  }

  // KPI
  const totalCount = allIncidents.length;
  const openCount = allIncidents.filter((i) => i.status !== "완료").length;
  const urgentCount = allIncidents.filter((i) => i.severity === "높음" || i.severity === "긴급").length;
  const doneCount = allIncidents.filter((i) => i.status === "완료").length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="사고 리포트"
        description="운영 중 발생한 사고를 기록하고 경위, 원인, 처리, 대책을 관리합니다."
        breadcrumb={["운영", "사고리포트"]}
        actions={<IncidentForm profiles={profiles} />}
      />

      <KpiGrid>
        <KpiCard
          icon={<IconAlertOctagon size={18} className="text-on-surface-variant" />}
          label="전체 사고"
          value={totalCount.toString()}
          suffix="건"
        />
        <KpiCard
          icon={<IconClock size={18} className="text-on-surface-variant" />}
          label="처리중"
          value={openCount.toString()}
          suffix="건"
          alert={openCount > 0}
        />
        <KpiCard
          icon={<IconAlertTriangle size={18} className="text-on-surface-variant" />}
          label="높음/긴급"
          value={urgentCount.toString()}
          suffix="건"
          alert={urgentCount > 0}
        />
        <KpiCard
          icon={<IconCircleCheck size={18} className="text-on-surface-variant" />}
          label="처리 완료"
          value={doneCount.toString()}
          suffix="건"
          change={totalCount > 0 ? `${Math.round((doneCount / totalCount) * 100)}%` : undefined}
          trend={doneCount > 0 ? "up" : undefined}
        />
      </KpiGrid>

      <Suspense>
        <FilterBar
          searchPlaceholder="사고 제목, 대학명, 보고자 검색..."
          tabs={[
            { label: "전체", value: "all" },
            { label: "처리중", value: "open" },
            { label: "높음/긴급", value: "urgent" },
            { label: "완료", value: "done" },
          ]}
        />
      </Suspense>

      <TableSection totalCount={filtered.length}>
        <Card className="overflow-hidden p-0">
          <IncidentList incidents={filtered} />
        </Card>
        {allIncidents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
            <IconAlertOctagon size={40} className="opacity-30 mb-2" />
            <p className="text-sm font-medium">등록된 사고 리포트가 없습니다.</p>
          </div>
        )}
      </TableSection>
    </div>
  );
}
