const kpis = [
  {
    label: "활성 프로젝트",
    value: "24",
    change: "+3",
    icon: "rocket_launch",
    trend: "up" as const,
  },
  {
    label: "완료",
    value: "156",
    change: "+12",
    icon: "task_alt",
    trend: "up" as const,
  },
  {
    label: "지연",
    value: "5",
    change: "+2",
    icon: "warning",
    trend: "down" as const,
  },
  {
    label: "전체 예산",
    value: "42.8억",
    change: "87%",
    icon: "account_balance",
    trend: "up" as const,
  },
];

const projects = [
  {
    id: "PRJ-2026-001",
    name: "차세대 학사시스템 구축",
    manager: "김민수",
    status: "진행중",
    progress: 72,
    startDate: "2025-09-01",
    endDate: "2026-06-30",
    budget: "8.5억",
  },
  {
    id: "PRJ-2026-002",
    name: "입학관리 포털 개편",
    manager: "이수진",
    status: "진행중",
    progress: 45,
    startDate: "2026-01-15",
    endDate: "2026-08-31",
    budget: "3.2억",
  },
  {
    id: "PRJ-2026-003",
    name: "모바일 캠퍼스 앱",
    manager: "박영호",
    status: "지연",
    progress: 28,
    startDate: "2025-11-01",
    endDate: "2026-04-30",
    budget: "5.1억",
  },
  {
    id: "PRJ-2026-004",
    name: "데이터 분석 플랫폼",
    manager: "정하은",
    status: "완료",
    progress: 100,
    startDate: "2025-06-01",
    endDate: "2026-02-28",
    budget: "6.7억",
  },
  {
    id: "PRJ-2026-005",
    name: "통합 인증 시스템",
    manager: "최동원",
    status: "진행중",
    progress: 89,
    startDate: "2025-10-01",
    endDate: "2026-04-15",
    budget: "2.4억",
  },
  {
    id: "PRJ-2026-006",
    name: "클라우드 마이그레이션",
    manager: "한지민",
    status: "대기",
    progress: 0,
    startDate: "2026-04-01",
    endDate: "2026-12-31",
    budget: "12.3억",
  },
];

function getStatusStyle(status: string) {
  switch (status) {
    case "진행중":
      return "bg-primary/10 text-primary";
    case "완료":
      return "bg-secondary/20 text-secondary";
    case "지연":
      return "bg-error/10 text-error";
    case "대기":
      return "bg-tertiary/10 text-tertiary";
    default:
      return "bg-secondary/10 text-secondary";
  }
}

function getProgressColor(progress: number) {
  if (progress >= 80) return "bg-primary";
  if (progress >= 50) return "bg-primary-dim";
  if (progress >= 30) return "bg-tertiary";
  return "bg-error";
}

export default function PimsPage() {
  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
        <span className="material-symbols-outlined text-[18px]">folder</span>
        <span>프로젝트</span>
        <span className="material-symbols-outlined text-[14px]">
          chevron_right
        </span>
        <span className="text-primary font-medium">PIMS</span>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-on-surface">
          프로젝트 정보 관리 시스템
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          전체 프로젝트의 진행현황, 예산, 일정을 통합 관리합니다.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-outline-variant/15 bg-surface-container p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-on-surface-variant font-medium">
                {kpi.label}
              </span>
              <span className="material-symbols-outlined text-primary text-[22px]">
                {kpi.icon}
              </span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black text-on-surface">
                {kpi.value}
              </span>
              <span
                className={`text-xs font-bold mb-1 ${
                  kpi.trend === "up" && kpi.label !== "지연"
                    ? "text-primary"
                    : "text-error"
                }`}
              >
                {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Project List */}
      <div>
        <h2 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-4">
          프로젝트 목록
        </h2>
        <div className="rounded-xl border border-outline-variant/15 bg-surface-container overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-container-high text-on-surface-variant text-left">
                <th className="px-5 py-3 font-semibold">프로젝트 ID</th>
                <th className="px-5 py-3 font-semibold">프로젝트명</th>
                <th className="px-5 py-3 font-semibold">담당자</th>
                <th className="px-5 py-3 font-semibold">상태</th>
                <th className="px-5 py-3 font-semibold w-40">진행률</th>
                <th className="px-5 py-3 font-semibold">기간</th>
                <th className="px-5 py-3 font-semibold text-right">예산</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-surface-container-high/50 transition-colors"
                >
                  <td className="px-5 py-3.5 font-mono text-xs text-on-surface-variant">
                    {project.id}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-on-surface">
                    {project.name}
                  </td>
                  <td className="px-5 py-3.5 text-on-surface-variant">
                    {project.manager}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(project.status)}`}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getProgressColor(project.progress)} transition-all`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-on-surface-variant w-8 text-right">
                        {project.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-on-surface-variant">
                    {project.startDate} ~ {project.endDate}
                  </td>
                  <td className="px-5 py-3.5 text-right font-medium text-on-surface">
                    {project.budget}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
