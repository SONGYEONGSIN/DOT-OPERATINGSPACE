import PageHeader from "@/components/common/PageHeader";
import KpiGrid from "@/components/common/KpiGrid";
import KpiCard from "@/components/common/KpiCard";
import StatusBadge from "@/components/common/StatusBadge";
import Card from "@/components/common/Card";
import DataTable from "@/components/common/DataTable";
import FilterBar from "@/components/common/FilterBar";

const requests = [
  {
    id: "REQ-051",
    title: "대시보드 위젯 드래그 앤 드롭 기능 추가",
    requester: "김도연",
    department: "운영팀",
    category: "기능 개선",
    priority: "높음" as const,
    status: "검토중" as const,
    date: "2026-03-25",
    votes: 12,
  },
  {
    id: "REQ-050",
    title: "보고서 PDF 내보내기 시 차트 해상도 개선",
    requester: "박서연",
    department: "마케팅팀",
    category: "버그 수정",
    priority: "높음" as const,
    status: "승인" as const,
    date: "2026-03-24",
    votes: 8,
  },
  {
    id: "REQ-049",
    title: "AI 어시스턴트 대화 내보내기 기능",
    requester: "이정민",
    department: "개발팀",
    category: "신규 기능",
    priority: "중간" as const,
    status: "개발중" as const,
    date: "2026-03-23",
    votes: 15,
  },
  {
    id: "REQ-048",
    title: "다크모드/라이트모드 전환 시 깜박임 현상",
    requester: "최현우",
    department: "디자인팀",
    category: "버그 수정",
    priority: "낮음" as const,
    status: "완료" as const,
    date: "2026-03-22",
    votes: 6,
  },
  {
    id: "REQ-047",
    title: "팀별 커스텀 KPI 지표 설정 기능",
    requester: "박서연",
    department: "운영팀",
    category: "기능 개선",
    priority: "높음" as const,
    status: "승인" as const,
    date: "2026-03-21",
    votes: 19,
  },
  {
    id: "REQ-046",
    title: "모바일 반응형 레이아웃 개선",
    requester: "한소희",
    department: "디자인팀",
    category: "기능 개선",
    priority: "중간" as const,
    status: "검토중" as const,
    date: "2026-03-20",
    votes: 10,
  },
  {
    id: "REQ-045",
    title: "업무 로그 CSV 내보내기 기능",
    requester: "이정민",
    department: "개발팀",
    category: "신규 기능",
    priority: "낮음" as const,
    status: "대기" as const,
    date: "2026-03-19",
    votes: 4,
  },
];

const priorityVariant = {
  높음: "error",
  중간: "warning",
  낮음: "neutral",
} as const;

const statusVariant = {
  대기: "neutral",
  검토중: "warning",
  승인: "success",
  개발중: "info",
  완료: "success",
} as const;

const columns = [
  { key: "request", label: "요청" },
  { key: "priority", label: "우선순위", className: "w-24" },
  { key: "category", label: "카테고리", className: "w-24" },
  { key: "status", label: "상태", className: "w-24" },
  { key: "requester", label: "요청자", className: "w-24" },
  { key: "date", label: "날짜", className: "w-28" },
];

export default function RequestsPage() {
  const openCount = requests.filter((r) => r.status !== "완료").length;
  const highCount = requests.filter((r) => r.priority === "높음").length;
  const doneCount = requests.filter((r) => r.status === "완료").length;

  const tableData = requests.map((req) => ({
    request: (
      <div>
        <p className="text-sm font-semibold text-on-surface">{req.title}</p>
        <p className="text-xs text-on-surface-variant mt-0.5">{req.id}</p>
      </div>
    ),
    priority: (
      <StatusBadge variant={priorityVariant[req.priority]}>
        {req.priority}
      </StatusBadge>
    ),
    category: (
      <StatusBadge
        variant={
          req.category === "버그 수정"
            ? "error"
            : req.category === "신규 기능"
              ? "warning"
              : "success"
        }
      >
        {req.category}
      </StatusBadge>
    ),
    status: (
      <StatusBadge variant={statusVariant[req.status]}>{req.status}</StatusBadge>
    ),
    requester: (
      <div>
        <p className="text-xs text-on-surface">{req.requester}</p>
        <p className="text-[10px] text-on-surface-variant">{req.department}</p>
      </div>
    ),
    date: (
      <span className="text-xs text-on-surface-variant">{req.date}</span>
    ),
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="시스템 개선요청"
        description="시스템 개선 요청을 등록하고 진행 상황을 확인하세요."
        breadcrumb={["지원", "시스템 개선요청"]}
        actions={
          <button className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-dim transition-colors">
            <span className="material-symbols-outlined text-[20px]">
              add_circle
            </span>
            새 요청
          </button>
        }
      />

      <KpiGrid>
        <KpiCard
          icon="inbox"
          label="전체 요청"
          value={String(requests.length)}
        />
        <KpiCard
          icon="pending_actions"
          label="처리중"
          value={String(openCount)}
          change={`${openCount}건 진행`}
          trend="neutral"
        />
        <KpiCard
          icon="priority_high"
          label="높은 우선순위"
          value={String(highCount)}
          alert={highCount > 2}
        />
        <KpiCard
          icon="check_circle"
          label="완료"
          value={String(doneCount)}
          change="정상 처리"
          trend="up"
        />
      </KpiGrid>

      <FilterBar
        searchPlaceholder="요청 검색..."
        tabs={[
          { label: "전체", value: "all" },
          { label: "검토중", value: "review" },
          { label: "승인", value: "approved" },
          { label: "개발중", value: "dev" },
          { label: "완료", value: "done" },
        ]}
      />

      <Card className="p-0 overflow-hidden">
        <DataTable columns={columns} data={tableData} />
      </Card>
    </div>
  );
}
