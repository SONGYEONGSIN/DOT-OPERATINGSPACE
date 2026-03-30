import PageHeader from "@/components/common/PageHeader";
import KpiGrid from "@/components/common/KpiGrid";
import KpiCard from "@/components/common/KpiCard";
import Card from "@/components/common/Card";
import StatusBadge from "@/components/common/StatusBadge";

const schools = [
  {
    name: "서울디지털고등학교",
    region: "서울",
    program: "AI 기초과정",
    students: 142,
    status: "진행중" as const,
    progress: 72,
  },
  {
    name: "부산정보중학교",
    region: "부산",
    program: "코딩 캠프",
    students: 98,
    status: "진행중" as const,
    progress: 45,
  },
  {
    name: "대전과학고등학교",
    region: "대전",
    program: "데이터분석 입문",
    students: 64,
    status: "완료" as const,
    progress: 100,
  },
  {
    name: "인천글로벌중학교",
    region: "인천",
    program: "웹개발 기초",
    students: 112,
    status: "진행중" as const,
    progress: 58,
  },
  {
    name: "광주미래초등학교",
    region: "광주",
    program: "창의 코딩",
    students: 87,
    status: "예정" as const,
    progress: 0,
  },
  {
    name: "경기혁신고등학교",
    region: "경기",
    program: "앱 개발 실습",
    students: 135,
    status: "진행중" as const,
    progress: 83,
  },
  {
    name: "제주탐라중학교",
    region: "제주",
    program: "IoT 체험",
    students: 56,
    status: "완료" as const,
    progress: 100,
  },
  {
    name: "강원산골초등학교",
    region: "강원",
    program: "로봇 코딩",
    students: 43,
    status: "예정" as const,
    progress: 0,
  },
];

const statusVariantMap = {
  진행중: "success",
  완료: "info",
  예정: "warning",
} as const;

const regionVariantMap: Record<string, "success" | "warning" | "info"> = {
  서울: "success",
  부산: "warning",
  대전: "info",
  인천: "success",
  광주: "warning",
  경기: "success",
  제주: "warning",
  강원: "info",
};

export default function K12Page() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="초중고 관리"
        description="초, 중, 고등학교 교육 프로그램의 운영 현황을 관리합니다."
        breadcrumb={["프로젝트", "초중고"]}
      />

      <KpiGrid>
        <KpiCard
          icon="school"
          label="참여학교"
          value="247"
          change="+12 이번 분기"
          trend="up"
        />
        <KpiCard
          icon="auto_stories"
          label="진행프로그램"
          value="38"
          change="+3 이번 분기"
          trend="up"
        />
        <KpiCard
          icon="emoji_events"
          label="수료학생"
          value="5,842"
          change="+328 이번 분기"
          trend="up"
        />
        <KpiCard
          icon="sentiment_satisfied"
          label="만족도"
          value="4.7"
          suffix="/ 5.0"
          change="+0.2 이번 분기"
          trend="up"
        />
      </KpiGrid>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-primary tracking-[0.2em] uppercase">
          참여 학교 목록
        </h2>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors">
          <span className="material-symbols-outlined text-sm">add</span>
          학교 추가
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {schools.map((school) => (
          <Card key={school.name} hover className="p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-on-surface">
                  {school.name}
                </h3>
                <div className="flex items-center gap-2">
                  <StatusBadge variant={regionVariantMap[school.region] ?? "neutral"}>
                    {school.region}
                  </StatusBadge>
                  <StatusBadge variant={statusVariantMap[school.status]}>
                    {school.status}
                  </StatusBadge>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-lg">
                more_vert
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">
                auto_stories
              </span>
              <span>{school.program}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">group</span>
              <span>참여 학생 {school.students}명</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-on-surface-variant">진행률</span>
                <span className="font-bold text-on-surface">
                  {school.progress}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    school.progress === 100
                      ? "bg-primary-container"
                      : "bg-primary"
                  }`}
                  style={{ width: `${school.progress}%` }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
