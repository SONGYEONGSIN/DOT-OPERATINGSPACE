import {
  PageHeader,
  KpiCard,
  KpiGrid,
  StatusBadge,
  Card,
  ProgressBar,
  DataTable,
} from "@/components/common";

const urgentItems = [
  {
    icon: "credit_card_off",
    title: "결제 게이트웨이 연결 실패",
    time: "09:15",
    borderColor: "border-error",
  },
  {
    icon: "contract_delete",
    title: "한양대 계약 만료 D-3",
    time: "08:30",
    borderColor: "border-tertiary",
  },
  {
    icon: "account_balance",
    title: "미수채권 90일 초과 2건",
    time: "08:00",
    borderColor: "border-error",
  },
] as const;

const departmentProgress = [
  { name: "운영팀", value: 85, color: "primary" as const },
  { name: "개발팀", value: 72, color: "primary" as const },
  { name: "영업팀", value: 91, color: "primary" as const },
  { name: "CS팀", value: 68, color: "warning" as const },
] as const;

const scheduleItems = [
  { time: "09:00", title: "팀 미팅", dotColor: "bg-primary" },
  { time: "10:30", title: "고객사 미팅", dotColor: "bg-tertiary" },
  { time: "13:00", title: "프로젝트 리뷰", dotColor: "bg-secondary" },
  { time: "15:00", title: "보안 점검", dotColor: "bg-error" },
  { time: "17:00", title: "데일리 리포트", dotColor: "bg-primary" },
] as const;

const activityColumns = [
  { key: "time", label: "시간", className: "w-24" },
  { key: "person", label: "담당자" },
  { key: "action", label: "활동 내용" },
  { key: "status", label: "상태", className: "w-28" },
];

const activityData = [
  {
    time: <span className="font-mono text-xs text-on-surface-variant">09:42</span>,
    person: <span className="font-medium">김운영</span>,
    action: "결제 게이트웨이 장애 접수 및 담당자 배정",
    status: <StatusBadge variant="error" dot>긴급</StatusBadge>,
  },
  {
    time: <span className="font-mono text-xs text-on-surface-variant">09:30</span>,
    person: <span className="font-medium">이개발</span>,
    action: "v2.4.1 핫픽스 배포 완료",
    status: <StatusBadge variant="success">완료</StatusBadge>,
  },
  {
    time: <span className="font-mono text-xs text-on-surface-variant">09:15</span>,
    person: <span className="font-medium">박영업</span>,
    action: "한양대 계약 갱신 협의 요청 메일 발송",
    status: <StatusBadge variant="info">진행</StatusBadge>,
  },
  {
    time: <span className="font-mono text-xs text-on-surface-variant">09:00</span>,
    person: <span className="font-medium">최보안</span>,
    action: "일일 보안 스캔 실행 및 리포트 생성",
    status: <StatusBadge variant="success">완료</StatusBadge>,
  },
  {
    time: <span className="font-mono text-xs text-on-surface-variant">08:45</span>,
    person: <span className="font-medium">정CS</span>,
    action: "고객 문의 티켓 12건 일괄 배정",
    status: <StatusBadge variant="success">완료</StatusBadge>,
  },
  {
    time: <span className="font-mono text-xs text-on-surface-variant">08:30</span>,
    person: <span className="font-medium">한재무</span>,
    action: "미수채권 90일 초과 건 경영진 보고",
    status: <StatusBadge variant="warning">검토</StatusBadge>,
  },
  {
    time: <span className="font-mono text-xs text-on-surface-variant">08:15</span>,
    person: <span className="font-medium">오인프라</span>,
    action: "서버 모니터링 알림 임계값 조정",
    status: <StatusBadge variant="success">완료</StatusBadge>,
  },
  {
    time: <span className="font-mono text-xs text-on-surface-variant">08:00</span>,
    person: <span className="font-medium">윤관리</span>,
    action: "오전 브리핑 자료 준비 및 공유",
    status: <StatusBadge variant="success">완료</StatusBadge>,
  },
];

export default function BriefingPage() {
  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <PageHeader
        title="오늘의 브리핑"
        breadcrumb={["메인", "브리핑"]}
        description="2026년 3월 31일 월요일"
        actions={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-container/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              LIVE
            </span>
          </div>
        }
      />

      {/* ── 오늘의 핵심 지표 ── */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          <span className="material-symbols-outlined text-primary text-sm">monitoring</span>
          오늘의 핵심 지표
        </h2>
        <KpiGrid>
          <KpiCard
            icon="error"
            label="긴급 이슈"
            value="3"
            suffix="건"
            change="+2 전일대비"
            trend="down"
            alert
          />
          <KpiCard
            icon="task_alt"
            label="처리 완료"
            value="12"
            suffix="건"
            change="+5 전일대비"
            trend="up"
          />
          <KpiCard
            icon="pending"
            label="진행 중"
            value="8"
            suffix="건"
            change="전일 동일"
            trend="neutral"
          />
          <KpiCard
            icon="groups"
            label="팀 가동률"
            value="94"
            suffix="%"
            change="+3% 전일대비"
            trend="up"
          />
        </KpiGrid>
      </section>

      {/* ── 긴급 알림 ── */}
      <section>
        <Card className="border-l-2 border-error p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold text-on-surface">
              <span className="material-symbols-outlined text-error text-lg">notifications_active</span>
              긴급 알림
            </h3>
            <StatusBadge variant="error" dot>
              {urgentItems.length}건 대기
            </StatusBadge>
          </div>
          <div className="space-y-3">
            {urgentItems.map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between rounded-lg border border-outline-variant/10 bg-surface-container-high p-4 transition-colors hover:bg-surface-bright"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-error/10">
                    <span className="material-symbols-outlined text-error text-lg">
                      {item.icon}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{item.title}</p>
                    <p className="text-[10px] font-mono text-on-surface-variant">{item.time} 발생</p>
                  </div>
                </div>
                <StatusBadge variant="error">긴급</StatusBadge>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* ── 부서별 현황 2열 그리드 ── */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 업무 진행 현황 */}
        <Card className="p-6">
          <h3 className="mb-6 flex items-center gap-2 text-sm font-bold text-on-surface">
            <span className="material-symbols-outlined text-primary text-lg">bar_chart</span>
            업무 진행 현황
          </h3>
          <div className="space-y-5">
            {departmentProgress.map((dept) => (
              <div key={dept.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-on-surface">{dept.name}</span>
                  <span className="text-xs font-bold text-on-surface-variant">{dept.value}%</span>
                </div>
                <ProgressBar value={dept.value} size="md" color={dept.color} />
              </div>
            ))}
          </div>
        </Card>

        {/* 오늘의 일정 */}
        <Card className="p-6">
          <h3 className="mb-6 flex items-center gap-2 text-sm font-bold text-on-surface">
            <span className="material-symbols-outlined text-primary text-lg">schedule</span>
            오늘의 일정
          </h3>
          <div className="relative space-y-6 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-px before:bg-outline-variant/30">
            {scheduleItems.map((item) => (
              <div key={item.time} className="relative flex items-start gap-4 pl-6">
                <div className={`absolute left-0 top-1.5 h-3 w-3 rounded-full ${item.dotColor}`} />
                <span className="w-12 shrink-0 text-xs font-mono font-bold text-on-surface-variant">
                  {item.time}
                </span>
                <span className="text-sm font-medium text-on-surface">{item.title}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* ── 최근 활동 로그 ── */}
      <section>
        <Card>
          <div className="px-6 pt-6 pb-2">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold text-on-surface">
                <span className="material-symbols-outlined text-primary text-lg">history</span>
                최근 활동 로그
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                오늘 {activityData.length}건
              </span>
            </div>
          </div>
          <DataTable columns={activityColumns} data={activityData} />
        </Card>
      </section>
    </div>
  );
}
