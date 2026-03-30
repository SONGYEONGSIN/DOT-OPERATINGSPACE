import {
  PageHeader,
  KpiGrid,
  KpiCard,
  StatusBadge,
  Card,
  StepTimeline,
} from "@/components/common";

interface HandoverItem {
  id: string;
  title: string;
  from: string;
  to: string;
  university: string;
  currentStep: number;
  startDate: string;
  dueDate: string;
  daysElapsed: number;
  priority: "high" | "medium" | "low";
}

const handovers: HandoverItem[] = [
  {
    id: "HO-2026-001",
    title: "서울대 PIMS 시스템 운영 인수인계",
    from: "김민수",
    to: "이서연",
    university: "서울대학교",
    currentStep: 3,
    startDate: "2026.03.10",
    dueDate: "2026.04.10",
    daysElapsed: 16,
    priority: "high",
  },
  {
    id: "HO-2026-002",
    title: "연세대 접수관리자 담당자 변경",
    from: "박준혁",
    to: "정하은",
    university: "연세대학교",
    currentStep: 2,
    startDate: "2026.03.15",
    dueDate: "2026.04.15",
    daysElapsed: 11,
    priority: "medium",
  },
  {
    id: "HO-2026-003",
    title: "고려대 정산 시스템 이관",
    from: "최영진",
    to: "한소희",
    university: "고려대학교",
    currentStep: 4,
    startDate: "2026.02.20",
    dueDate: "2026.03.20",
    daysElapsed: 34,
    priority: "low",
  },
  {
    id: "HO-2026-004",
    title: "성균관대 경쟁률 서비스 인수인계",
    from: "오태현",
    to: "신예진",
    university: "성균관대학교",
    currentStep: 1,
    startDate: "2026.03.22",
    dueDate: "2026.04.22",
    daysElapsed: 4,
    priority: "high",
  },
  {
    id: "HO-2026-005",
    title: "한양대 내부관리자 운영 이관",
    from: "윤재호",
    to: "강민지",
    university: "한양대학교",
    currentStep: 2,
    startDate: "2026.03.18",
    dueDate: "2026.04.18",
    daysElapsed: 8,
    priority: "medium",
  },
];

const stepLabels = ["문서 작성", "검토", "인수인계", "완료"];

const priorityVariantMap = {
  high: "error",
  medium: "warning",
  low: "success",
} as const;

const priorityLabels = {
  high: "긴급",
  medium: "보통",
  low: "낮음",
} as const;

function buildSteps(
  currentStep: number,
): { label: string; status: "completed" | "active" | "pending" }[] {
  return stepLabels.map((label, index) => {
    const stepNum = index + 1;
    if (stepNum < currentStep) return { label, status: "completed" as const };
    if (stepNum === currentStep) return { label, status: "active" as const };
    return { label, status: "pending" as const };
  });
}

export default function HandoverPage() {
  const totalHandovers = handovers.length;
  const inProgress = handovers.filter((h) => h.currentStep < 4).length;
  const completed = handovers.filter((h) => h.currentStep === 4).length;
  const avgDays = Math.round(
    handovers.reduce((sum, h) => sum + h.daysElapsed, 0) / handovers.length,
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="인수인계"
        description="업무 인수인계 현황을 추적하고 프로세스를 관리합니다."
        breadcrumb={["운영", "인수인계"]}
        actions={
          <>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-high text-on-surface-variant text-sm font-semibold hover:bg-surface-bright transition-colors">
              <span className="material-symbols-outlined text-lg">
                filter_list
              </span>
              필터
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-black hover:brightness-110 transition-all active:scale-95">
              <span className="material-symbols-outlined text-lg">add</span>
              새 인수인계
            </button>
          </>
        }
      />

      <KpiGrid>
        <KpiCard
          icon="swap_horiz"
          label="전체 건수"
          value={totalHandovers.toString()}
          suffix="건"
        />
        <KpiCard
          icon="pending"
          label="진행중"
          value={inProgress.toString()}
          suffix="건"
          change="활성 프로세스"
          trend="neutral"
        />
        <KpiCard
          icon="task_alt"
          label="완료"
          value={completed.toString()}
          suffix="건"
          change="이번 달"
          trend="up"
        />
        <KpiCard
          icon="schedule"
          label="평균 소요일"
          value={avgDays.toString()}
          suffix="일"
        />
      </KpiGrid>

      {/* Handover Cards */}
      <section>
        <h2 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-4">
          인수인계 진행현황
        </h2>

        <div className="space-y-4">
          {handovers.map((handover) => (
            <Card key={handover.id} hover className="p-6">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-surface-container-high shrink-0">
                    <span className="material-symbols-outlined text-primary text-xl">
                      swap_horiz
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-semibold text-on-surface-variant">
                        {handover.id}
                      </span>
                      <StatusBadge
                        variant={priorityVariantMap[handover.priority]}
                      >
                        {priorityLabels[handover.priority]}
                      </StatusBadge>
                    </div>
                    <h3 className="text-sm font-bold text-on-surface">
                      {handover.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {handover.university}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-on-surface-variant shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant mb-0.5">
                        인계자
                      </p>
                      <p className="font-semibold text-on-surface">
                        {handover.from}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-primary text-lg">
                      arrow_forward
                    </span>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant mb-0.5">
                        인수자
                      </p>
                      <p className="font-semibold text-on-surface">
                        {handover.to}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step Timeline */}
              <div className="px-8">
                <StepTimeline steps={buildSteps(handover.currentStep)} />
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-outline-variant/10">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">
                      calendar_today
                    </span>
                    {handover.startDate} ~ {handover.dueDate}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">
                      timer
                    </span>
                    {handover.daysElapsed}일 경과
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors">
                    상세보기
                  </button>
                  {handover.currentStep < 4 && (
                    <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                      단계 진행
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
