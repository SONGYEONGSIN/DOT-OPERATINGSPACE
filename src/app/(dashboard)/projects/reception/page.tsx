const kpis = [
  {
    label: "오늘 접수",
    value: "47",
    change: "+8",
    icon: "inbox",
    positive: true,
  },
  {
    label: "처리완료",
    value: "39",
    change: "83%",
    icon: "check_circle",
    positive: true,
  },
  {
    label: "대기중",
    value: "8",
    change: "-3",
    icon: "pending",
    positive: false,
  },
  {
    label: "평균처리시간",
    value: "2.4h",
    change: "-0.3h",
    icon: "schedule",
    positive: true,
  },
];

const receptions = [
  {
    id: "RCP-20260326-001",
    datetime: "2026-03-26 09:15",
    type: "입학문의",
    summary: "2027학년도 수시 전형 일정 확인 요청",
    status: "완료",
    assignee: "김수현",
  },
  {
    id: "RCP-20260326-002",
    datetime: "2026-03-26 09:32",
    type: "시스템장애",
    summary: "원서접수 페이지 로딩 지연 신고",
    status: "처리중",
    assignee: "박진우",
  },
  {
    id: "RCP-20260326-003",
    datetime: "2026-03-26 10:05",
    type: "정보변경",
    summary: "지원자 연락처 변경 요청",
    status: "완료",
    assignee: "이하늘",
  },
  {
    id: "RCP-20260326-004",
    datetime: "2026-03-26 10:28",
    type: "서류확인",
    summary: "제출서류 누락 확인 및 재제출 안내",
    status: "대기",
    assignee: "미배정",
  },
  {
    id: "RCP-20260326-005",
    datetime: "2026-03-26 11:03",
    type: "입학문의",
    summary: "편입학 지원 자격 관련 상담 요청",
    status: "처리중",
    assignee: "정다은",
  },
  {
    id: "RCP-20260326-006",
    datetime: "2026-03-26 11:45",
    type: "시스템장애",
    summary: "합격자 조회 시 오류 발생",
    status: "대기",
    assignee: "미배정",
  },
  {
    id: "RCP-20260326-007",
    datetime: "2026-03-26 12:10",
    type: "환불요청",
    summary: "전형료 환불 신청 처리 요청",
    status: "완료",
    assignee: "김수현",
  },
  {
    id: "RCP-20260326-008",
    datetime: "2026-03-26 13:22",
    type: "정보변경",
    summary: "지원 학과 변경 가능 여부 문의",
    status: "대기",
    assignee: "미배정",
  },
];

function getStatusStyle(status: string) {
  switch (status) {
    case "완료":
      return "bg-primary/10 text-primary";
    case "처리중":
      return "bg-tertiary/10 text-tertiary";
    case "대기":
      return "bg-error/10 text-error";
    default:
      return "bg-secondary/10 text-secondary";
  }
}

function getTypeStyle(type: string) {
  switch (type) {
    case "입학문의":
      return "bg-primary/5 text-primary";
    case "시스템장애":
      return "bg-error/10 text-error";
    case "서류확인":
      return "bg-tertiary/10 text-tertiary";
    case "정보변경":
      return "bg-secondary/20 text-secondary";
    case "환불요청":
      return "bg-tertiary/10 text-tertiary-dim";
    default:
      return "bg-secondary/10 text-secondary";
  }
}

export default function ReceptionPage() {
  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
        <span className="material-symbols-outlined text-[18px]">folder</span>
        <span>프로젝트</span>
        <span className="material-symbols-outlined text-[14px]">
          chevron_right
        </span>
        <span className="text-primary font-medium">접수관리자</span>
      </div>

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-on-surface">
            접수관리자
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            접수 현황을 실시간으로 모니터링하고 처리 상태를 관리합니다.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-on-primary font-bold text-sm hover:bg-primary-dim transition-colors">
          <span className="material-symbols-outlined text-[18px]">add</span>
          새 접수
        </button>
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
                className={`text-xs font-bold mb-1 ${kpi.positive ? "text-primary" : "text-error"}`}
              >
                {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-surface-container-high px-3 py-2 flex-1 max-w-sm">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
            search
          </span>
          <span className="text-sm text-on-surface-variant">
            접수번호 또는 내용 검색...
          </span>
        </div>
        {["전체", "대기", "처리중", "완료"].map((filter) => (
          <button
            key={filter}
            className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
              filter === "전체"
                ? "bg-primary/10 text-primary"
                : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Reception Table */}
      <div>
        <h2 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-4">
          접수 내역
        </h2>
        <div className="rounded-xl border border-outline-variant/15 bg-surface-container overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-container-high text-on-surface-variant text-left">
                <th className="px-5 py-3 font-semibold">접수번호</th>
                <th className="px-5 py-3 font-semibold">접수일시</th>
                <th className="px-5 py-3 font-semibold">유형</th>
                <th className="px-5 py-3 font-semibold">내용요약</th>
                <th className="px-5 py-3 font-semibold">상태</th>
                <th className="px-5 py-3 font-semibold">담당자</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {receptions.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-surface-container-high/50 transition-colors"
                >
                  <td className="px-5 py-3.5 font-mono text-xs text-on-surface-variant">
                    {item.id}
                  </td>
                  <td className="px-5 py-3.5 text-on-surface-variant text-xs">
                    {item.datetime}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider ${getTypeStyle(item.type)}`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-on-surface max-w-xs truncate">
                    {item.summary}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-on-surface-variant">
                    {item.assignee === "미배정" ? (
                      <span className="text-error/70 italic">
                        {item.assignee}
                      </span>
                    ) : (
                      item.assignee
                    )}
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
