import PageHeader from "@/components/common/PageHeader";
import StepTimeline from "@/components/common/StepTimeline";
import StatusBadge from "@/components/common/StatusBadge";
import Card from "@/components/common/Card";
import ProgressBar from "@/components/common/ProgressBar";

const steps = [
  {
    step: 1,
    title: "계정 설정",
    description: "프로필 정보를 입력하고 보안 설정을 완료하세요.",
    icon: "person",
    status: "completed" as const,
    items: [
      { label: "프로필 사진 업로드", done: true },
      { label: "기본 정보 입력 (이름, 부서, 직책)", done: true },
      { label: "비밀번호 변경", done: true },
      { label: "2단계 인증 설정", done: true },
    ],
  },
  {
    step: 2,
    title: "시스템 소개",
    description: "DOT 운영 공간의 주요 기능과 구조를 이해하세요.",
    icon: "explore",
    status: "completed" as const,
    items: [
      { label: "대시보드 둘러보기", done: true },
      { label: "네비게이션 구조 이해", done: true },
      { label: "주요 기능 소개 영상 시청", done: true },
    ],
  },
  {
    step: 3,
    title: "업무 환경 구성",
    description: "자주 사용하는 도구와 환경을 설정하세요.",
    icon: "tune",
    status: "active" as const,
    items: [
      { label: "알림 설정 (이메일, 인앱)", done: true },
      { label: "대시보드 위젯 커스터마이징", done: true },
      { label: "자주 쓰는 보고서 템플릿 선택", done: false },
      { label: "단축키 설정", done: false },
    ],
  },
  {
    step: 4,
    title: "팀 연동",
    description: "팀원들과 협업 채널을 연결하세요.",
    icon: "group",
    status: "pending" as const,
    items: [
      { label: "팀 채널 가입", done: false },
      { label: "팀원 소개 및 역할 확인", done: false },
      { label: "공유 프로젝트 접근 권한 설정", done: false },
    ],
  },
  {
    step: 5,
    title: "첫 업무 시작",
    description: "실제 업무를 시작하며 시스템에 익숙해지세요.",
    icon: "rocket_launch",
    status: "pending" as const,
    items: [
      { label: "첫 번째 업무 로그 작성", done: false },
      { label: "보고서 1건 열람", done: false },
      { label: "AI 어시스턴트에게 질문하기", done: false },
      { label: "시스템 개선 의견 1건 제출", done: false },
    ],
  },
];

const totalItems = steps.flatMap((s) => s.items);
const completedItems = totalItems.filter((i) => i.done);
const completionPercent = Math.round(
  (completedItems.length / totalItems.length) * 100,
);

const timelineSteps = steps.map((s) => ({
  label: s.title,
  status: s.status === "active" ? ("active" as const) : s.status,
}));

const statusBadgeVariant = {
  completed: "success",
  active: "warning",
  pending: "neutral",
} as const;

const statusLabel = {
  completed: "완료",
  active: "진행중",
  pending: "대기",
} as const;

export default function OnboardingPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="온보딩"
        description="DOT 운영 공간을 효과적으로 시작하기 위한 단계별 가이드입니다."
        breadcrumb={["지원", "온보딩"]}
      />

      {/* Welcome Banner */}
      <Card className="relative p-6 overflow-hidden !border-primary/20">
        <div className="absolute inset-0 kinetic-grid" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[28px]">
                waving_hand
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">
                환영합니다, 한소희 님!
              </h2>
              <p className="text-sm text-on-surface-variant mt-0.5">
                디자인팀에 합류하신 것을 축하드립니다. 아래 가이드를 따라
                시스템 설정을 완료해 주세요.
              </p>
            </div>
          </div>

          {/* Progress Ring */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  className="stroke-surface-container-high"
                  strokeWidth="6"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  className="stroke-primary"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${(completionPercent / 100) * 2 * Math.PI * 34} ${2 * Math.PI * 34}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-black text-primary">
                  {completionPercent}%
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-on-surface">
                {completedItems.length}/{totalItems.length}
              </p>
              <p className="text-xs text-on-surface-variant">완료됨</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Step Timeline Overview */}
      <Card className="p-6">
        <StepTimeline steps={timelineSteps} />
      </Card>

      {/* Step Detail Cards */}
      <div className="space-y-4">
        {steps.map((step) => {
          const stepDone = step.items.filter((i) => i.done).length;
          const stepTotal = step.items.length;

          return (
            <Card
              key={step.step}
              className={`p-5 ${step.status === "active" ? "!border-primary/30" : ""}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      step.status === "pending"
                        ? "bg-surface-container-high"
                        : "bg-primary/10"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] ${
                        step.status === "pending"
                          ? "text-on-surface-variant"
                          : "text-primary"
                      }`}
                    >
                      {step.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-on-surface">
                      {step.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>
                <StatusBadge variant={statusBadgeVariant[step.status]}>
                  {statusLabel[step.status]}
                </StatusBadge>
              </div>

              {/* Checklist */}
              <div className="space-y-2 ml-12">
                {step.items.map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 ${
                        item.done
                          ? "bg-primary border-primary"
                          : "border-outline-variant bg-transparent"
                      }`}
                    >
                      {item.done && (
                        <span className="material-symbols-outlined text-on-primary text-[14px]">
                          check
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        item.done
                          ? "text-on-surface-variant line-through"
                          : "text-on-surface"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Step Progress */}
              {step.status !== "pending" && (
                <div className="flex items-center gap-2 mt-4 ml-12">
                  <div className="flex-1">
                    <ProgressBar value={stepDone} max={stepTotal} />
                  </div>
                  <span className="text-[10px] font-bold text-on-surface-variant">
                    {stepDone}/{stepTotal}
                  </span>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
