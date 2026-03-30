const kpis = [
  {
    label: "평균 경쟁률",
    value: "8.3:1",
    change: "+0.7",
    icon: "trending_up",
    positive: true,
  },
  {
    label: "최고 경쟁률",
    value: "42.1:1",
    change: "간호학과",
    icon: "emoji_events",
    positive: true,
  },
  {
    label: "모집인원",
    value: "3,240",
    change: "+120",
    icon: "groups",
    positive: true,
  },
  {
    label: "지원자수",
    value: "26,892",
    change: "+2,341",
    icon: "person_add",
    positive: true,
  },
];

const departments = [
  {
    university: "서울대학교",
    department: "간호학과",
    quota: 40,
    applicants: 1684,
    ratio: "42.1:1",
    yoyChange: "+5.2",
    trend: "up" as const,
  },
  {
    university: "서울대학교",
    department: "컴퓨터공학과",
    quota: 55,
    applicants: 1870,
    ratio: "34.0:1",
    yoyChange: "+3.8",
    trend: "up" as const,
  },
  {
    university: "연세대학교",
    department: "경영학과",
    quota: 120,
    applicants: 3120,
    ratio: "26.0:1",
    yoyChange: "+1.2",
    trend: "up" as const,
  },
  {
    university: "고려대학교",
    department: "의예과",
    quota: 30,
    applicants: 720,
    ratio: "24.0:1",
    yoyChange: "-2.1",
    trend: "down" as const,
  },
  {
    university: "성균관대학교",
    department: "반도체시스템공학과",
    quota: 45,
    applicants: 945,
    ratio: "21.0:1",
    yoyChange: "+8.4",
    trend: "up" as const,
  },
  {
    university: "한양대학교",
    department: "AI학과",
    quota: 35,
    applicants: 630,
    ratio: "18.0:1",
    yoyChange: "+4.6",
    trend: "up" as const,
  },
  {
    university: "중앙대학교",
    department: "약학과",
    quota: 25,
    applicants: 400,
    ratio: "16.0:1",
    yoyChange: "-0.5",
    trend: "down" as const,
  },
  {
    university: "경희대학교",
    department: "한의예과",
    quota: 30,
    applicants: 420,
    ratio: "14.0:1",
    yoyChange: "+1.8",
    trend: "up" as const,
  },
  {
    university: "이화여자대학교",
    department: "미래산업약학과",
    quota: 20,
    applicants: 240,
    ratio: "12.0:1",
    yoyChange: "+2.3",
    trend: "up" as const,
  },
  {
    university: "서강대학교",
    department: "데이터사이언스학과",
    quota: 40,
    applicants: 360,
    ratio: "9.0:1",
    yoyChange: "-1.1",
    trend: "down" as const,
  },
];

function getRatioColor(ratio: string) {
  const value = parseFloat(ratio);
  if (value >= 30) return "text-error";
  if (value >= 20) return "text-tertiary";
  if (value >= 10) return "text-primary";
  return "text-on-surface";
}

function getRatioBarWidth(ratio: string) {
  const value = parseFloat(ratio);
  const maxRatio = 42.1;
  return Math.min((value / maxRatio) * 100, 100);
}

export default function CompetitionPage() {
  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
        <span className="material-symbols-outlined text-[18px]">folder</span>
        <span>프로젝트</span>
        <span className="material-symbols-outlined text-[14px]">
          chevron_right
        </span>
        <span className="text-primary font-medium">경쟁률 관리</span>
      </div>

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-on-surface">
            경쟁률 관리
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            대학별, 학과별 경쟁률 현황을 실시간으로 분석합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-xl bg-surface-container-high px-4 py-2.5 text-on-surface-variant font-bold text-sm hover:text-on-surface transition-colors border border-outline-variant/15">
            <span className="material-symbols-outlined text-[18px]">
              download
            </span>
            내보내기
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-on-primary font-bold text-sm hover:bg-primary-dim transition-colors">
            <span className="material-symbols-outlined text-[18px]">
              refresh
            </span>
            새로고침
          </button>
        </div>
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
              <span className="text-xs font-bold mb-1 text-primary">
                {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Competition Table */}
      <div>
        <h2 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-4">
          학과별 경쟁률 현황
        </h2>
        <div className="rounded-xl border border-outline-variant/15 bg-surface-container overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-container-high text-on-surface-variant text-left">
                <th className="px-5 py-3 font-semibold">#</th>
                <th className="px-5 py-3 font-semibold">대학명</th>
                <th className="px-5 py-3 font-semibold">학과</th>
                <th className="px-5 py-3 font-semibold text-right">
                  모집인원
                </th>
                <th className="px-5 py-3 font-semibold text-right">지원자</th>
                <th className="px-5 py-3 font-semibold w-52">경쟁률</th>
                <th className="px-5 py-3 font-semibold text-right">
                  전년대비
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {departments.map((dept, idx) => (
                <tr
                  key={`${dept.university}-${dept.department}`}
                  className="hover:bg-surface-container-high/50 transition-colors"
                >
                  <td className="px-5 py-3.5 text-on-surface-variant font-mono text-xs">
                    {String(idx + 1).padStart(2, "0")}
                  </td>
                  <td className="px-5 py-3.5 text-on-surface font-medium">
                    {dept.university}
                  </td>
                  <td className="px-5 py-3.5 text-on-surface-variant">
                    {dept.department}
                  </td>
                  <td className="px-5 py-3.5 text-right text-on-surface tabular-nums">
                    {dept.quota.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-right text-on-surface font-medium tabular-nums">
                    {dept.applicants.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${getRatioBarWidth(dept.ratio)}%`,
                          }}
                        />
                      </div>
                      <span
                        className={`text-xs font-black w-14 text-right tabular-nums ${getRatioColor(dept.ratio)}`}
                      >
                        {dept.ratio}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="material-symbols-outlined text-[14px]">
                        {dept.trend === "up"
                          ? "arrow_upward"
                          : "arrow_downward"}
                      </span>
                      <span
                        className={`text-xs font-bold tabular-nums ${dept.trend === "up" ? "text-primary" : "text-error"}`}
                      >
                        {dept.yoyChange}
                      </span>
                    </div>
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
