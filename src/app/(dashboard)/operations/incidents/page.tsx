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
import { IconAlertOctagon, IconCircleCheck, IconClock, IconHandStop } from "@tabler/icons-react";
import IncidentForm from "./IncidentForm";
import IncidentList from "./IncidentList";
import CategoryFilter from "./CategoryFilter";
import IncidentPageTabs from "./IncidentPageTabs";
import YearFilter from "./YearFilter";
import IncidentAnalytics from "./IncidentAnalytics";

const CATEGORIES = [
  "PIMS", "SMS", "결제", "경쟁률", "기타", "로그인/회원가입",
  "모니터링", "사이트", "수험번호", "알림톡", "원서작성",
  "유의사항", "입학홈페이지", "전산", "전형료", "추천서",
  "출력물", "카톡챗봇", "콜프로그램", "특이사항/수정권한", "관리자",
] as const;

interface Incident {
  id: number;
  title: string;
  incident_date: string;
  university: string | null;
  category: string | null;
  department: string | null;
  reporter: string;
  assignee: string | null;
  severity: string;
  status: string;
  background: string | null;
  cause: string | null;
  resolution: string | null;
  prevention: string | null;
  created_at: string;
}

interface PageProps {
  searchParams: Promise<{ search?: string; tab?: string; category?: string; view?: string; year?: string }>;
}

// 학년도 기준: 3월~익년 2월 (예: 2024년 = 2024.3~2025.2)
function getAcademicYear(dateStr: string | null, createdAt: string): number {
  const d = dateStr ? new Date(dateStr) : new Date(createdAt);
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return month >= 3 ? year : year - 1;
}

export default async function IncidentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const searchFilter = params.search ?? "";
  const tabFilter = params.tab ?? "all";
  const categoryFilter = params.category ?? "";
  const viewMode = params.view ?? "list";
  const yearFilter = params.year ?? "";

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

  // 학년도 목록 추출
  const yearSet = new Set<number>();
  for (const inc of allIncidents) {
    yearSet.add(getAcademicYear(inc.incident_date, inc.created_at));
  }
  const availableYears = [...yearSet].sort((a, b) => b - a);

  // 학년도 필터
  let filtered = allIncidents;
  if (yearFilter) {
    const y = Number(yearFilter);
    filtered = filtered.filter((i) => getAcademicYear(i.incident_date, i.created_at) === y);
  }

  if (tabFilter === "todo") filtered = filtered.filter((i) => i.status === "할 일");
  if (tabFilter === "progress") filtered = filtered.filter((i) => i.status === "진행 중");
  if (tabFilter === "done") filtered = filtered.filter((i) => i.status === "처리완료");
  if (tabFilter === "hold") filtered = filtered.filter((i) => i.status === "보류");
  if (tabFilter === "scheduled") filtered = filtered.filter((i) => i.status === "처리예정");

  if (categoryFilter) {
    filtered = filtered.filter((i) => i.category === categoryFilter);
  }

  if (searchFilter) {
    const q = searchFilter.toLowerCase();
    filtered = filtered.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        (i.university ?? "").toLowerCase().includes(q) ||
        i.reporter.toLowerCase().includes(q) ||
        (i.assignee ?? "").toLowerCase().includes(q),
    );
  }

  // 연도 필터 적용된 전체 데이터 (KPI/분석 기준)
  const yearFiltered = yearFilter
    ? allIncidents.filter((i) => getAcademicYear(i.incident_date, i.created_at) === Number(yearFilter))
    : allIncidents;

  // KPI
  const totalCount = yearFiltered.length;
  const activeCount = yearFiltered.filter((i) => i.status === "할 일" || i.status === "진행 중").length;
  const doneCount = yearFiltered.filter((i) => i.status === "처리완료").length;
  const holdCount = yearFiltered.filter((i) => i.status === "보류").length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="사고 리포트"
        description={`운영 중 발생한 사고를 기록하고 경위, 원인, 처리, 대책을 관리합니다.${yearFilter ? ` (${yearFilter}년: ${yearFilter}.3~${Number(yearFilter)+1}.2)` : ""}`}
        breadcrumb={["운영", "사고리포트"]}
        actions={<IncidentForm profiles={profiles} />}
      />

      <YearFilter years={availableYears} />

      <KpiGrid>
        <KpiCard
          icon={<IconAlertOctagon size={18} className="text-on-surface-variant" />}
          label="전체"
          value={totalCount.toString()}
          suffix="건"
        />
        <KpiCard
          icon={<IconClock size={18} className="text-on-surface-variant" />}
          label="할일 / 진행중"
          value={activeCount.toString()}
          suffix="건"
          alert={activeCount > 0}
        />
        <KpiCard
          icon={<IconCircleCheck size={18} className="text-on-surface-variant" />}
          label="처리완료"
          value={doneCount.toString()}
          suffix="건"
          change={totalCount > 0 ? `${Math.round((doneCount / totalCount) * 100)}%` : undefined}
          trend={doneCount > 0 ? "up" : undefined}
        />
        <KpiCard
          icon={<IconHandStop size={18} className="text-on-surface-variant" />}
          label="보류"
          value={holdCount.toString()}
          suffix="건"
          alert={holdCount > 0}
        />
      </KpiGrid>

      <Suspense>
        <IncidentPageTabs />
      </Suspense>

      {viewMode === "analytics" ? (
        <IncidentAnalytics incidents={yearFiltered} />
      ) : (
        <>
          <Suspense>
            <FilterBar
              searchPlaceholder="요약, 대학명, 보고자, 담당자 검색..."
              tabs={[
                { label: "전체", value: "all" },
                { label: "할일", value: "todo" },
                { label: "진행중", value: "progress" },
                { label: "처리완료", value: "done" },
                { label: "보류", value: "hold" },
                { label: "처리예정", value: "scheduled" },
              ]}
              actions={<CategoryFilter categories={[...CATEGORIES]} />}
            />
          </Suspense>

          <TableSection totalCount={filtered.length}>
            <Card className="overflow-hidden p-0">
              <IncidentList incidents={filtered} profiles={profiles} />
            </Card>
            {allIncidents.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
                <IconAlertOctagon size={40} className="opacity-30 mb-2" />
                <p className="text-sm font-medium">등록된 사고 리포트가 없습니다.</p>
              </div>
            )}
          </TableSection>
        </>
      )}
    </div>
  );
}
