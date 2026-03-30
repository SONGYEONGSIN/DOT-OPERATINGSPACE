import PageHeader from "@/components/common/PageHeader";
import Card from "@/components/common/Card";
import StatusBadge from "@/components/common/StatusBadge";

const notices = [
  {
    id: 1,
    title: "2026년 2분기 보증보험 갱신 기한 안내",
    category: "보증보험",
    priority: "높음" as const,
    author: "관리팀",
    date: "2026-03-26",
    isNew: true,
    description:
      "4월 말 만료 예정인 보증보험 증권에 대해 사전 갱신 절차를 안내드립니다.",
  },
  {
    id: 2,
    title: "한국대학교육협의회 데이터 연동 점검 공지",
    category: "KCUE",
    priority: "높음" as const,
    author: "시스템팀",
    date: "2026-03-25",
    isNew: true,
    description:
      "3월 28일(토) 02:00~06:00 시스템 정기 점검으로 데이터 연동이 일시 중단됩니다.",
  },
  {
    id: 3,
    title: "실적증명서 발급 양식 변경 안내",
    category: "실적증명",
    priority: "중간" as const,
    author: "운영팀",
    date: "2026-03-24",
    isNew: false,
    description:
      "4월 1일부터 실적증명서 발급 양식이 변경됩니다. 새 양식을 확인해주세요.",
  },
  {
    id: 4,
    title: "추천인 검증 절차 강화 안내",
    category: "추천인검증",
    priority: "중간" as const,
    author: "감사팀",
    date: "2026-03-23",
    isNew: false,
    description:
      "내부 감사 결과에 따라 추천인 검증 절차가 3단계에서 4단계로 강화됩니다.",
  },
  {
    id: 5,
    title: "초중고 프로그램 참여 학교 추가 모집",
    category: "초중고",
    priority: "낮음" as const,
    author: "교육팀",
    date: "2026-03-22",
    isNew: false,
    description:
      "2026년 하반기 초중고 교육 프로그램 참여 학교를 추가 모집합니다.",
  },
  {
    id: 6,
    title: "정산 시스템 업데이트 완료",
    category: "정산",
    priority: "낮음" as const,
    author: "개발팀",
    date: "2026-03-21",
    isNew: false,
    description:
      "정산 시스템 v2.4 업데이트가 완료되었습니다. 주요 변경사항을 확인해주세요.",
  },
  {
    id: 7,
    title: "개인정보 처리 지침 개정 사항",
    category: "보안",
    priority: "높음" as const,
    author: "보안팀",
    date: "2026-03-20",
    isNew: false,
    description:
      "개인정보보호법 시행령 개정에 따른 내부 처리 지침이 변경되었습니다.",
  },
  {
    id: 8,
    title: "PIMS 접속 장애 복구 완료",
    category: "PIMS",
    priority: "중간" as const,
    author: "인프라팀",
    date: "2026-03-19",
    isNew: false,
    description:
      "3월 19일 발생한 PIMS 접속 장애가 복구되었습니다. 원인 분석 보고서가 첨부되어 있습니다.",
  },
];

const priorityVariant = {
  높음: "error",
  중간: "warning",
  낮음: "info",
} as const;

const priorityIcons: Record<string, string> = {
  높음: "priority_high",
  중간: "remove",
  낮음: "arrow_downward",
};

const categoryVariant: Record<string, "success" | "warning" | "info" | "error" | "neutral"> = {
  보증보험: "success",
  KCUE: "success",
  실적증명: "warning",
  추천인검증: "info",
  초중고: "success",
  정산: "info",
  보안: "error",
  PIMS: "warning",
};

const priorityIconBg: Record<string, string> = {
  높음: "bg-error/10",
  중간: "bg-tertiary/10",
  낮음: "bg-secondary/10",
};

const priorityIconColor: Record<string, string> = {
  높음: "text-error",
  중간: "text-tertiary",
  낮음: "text-on-secondary-container",
};

export default function NoticesPage() {
  const highCount = notices.filter((n) => n.priority === "높음").length;
  const mediumCount = notices.filter((n) => n.priority === "중간").length;
  const lowCount = notices.filter((n) => n.priority === "낮음").length;

  const prioritySummary = [
    {
      label: "높은 우선순위",
      count: highCount,
      icon: "priority_high",
      bgClass: "bg-error/10",
      iconClass: "text-error",
    },
    {
      label: "중간 우선순위",
      count: mediumCount,
      icon: "remove",
      bgClass: "bg-tertiary/10",
      iconClass: "text-tertiary",
    },
    {
      label: "낮은 우선순위",
      count: lowCount,
      icon: "arrow_downward",
      bgClass: "bg-secondary/10",
      iconClass: "text-on-secondary-container",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="유의사항"
        description="프로젝트 운영 시 참고해야 할 공지 및 유의사항을 확인합니다."
        breadcrumb={["프로젝트", "유의사항"]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {prioritySummary.map((item) => (
          <Card key={item.label} className="p-5 flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.bgClass}`}
            >
              <span
                className={`material-symbols-outlined text-2xl ${item.iconClass}`}
              >
                {item.icon}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {item.label}
              </p>
              <p className="text-3xl font-black text-on-surface">
                {item.count}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-primary tracking-[0.2em] uppercase">
            전체 유의사항
          </h2>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors">
            <span className="material-symbols-outlined text-sm">add</span>
            작성하기
          </button>
        </div>

        <div className="space-y-3">
          {notices.map((notice) => (
            <Card
              key={notice.id}
              hover
              className="p-5 cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${priorityIconBg[notice.priority]}`}
                >
                  <span
                    className={`material-symbols-outlined text-lg ${priorityIconColor[notice.priority]}`}
                  >
                    {priorityIcons[notice.priority]}
                  </span>
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                      {notice.title}
                    </h3>
                    {notice.isNew && (
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-primary text-on-primary">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant line-clamp-1">
                    {notice.description}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge variant={priorityVariant[notice.priority]}>
                      {notice.priority}
                    </StatusBadge>
                    <StatusBadge
                      variant={categoryVariant[notice.category] ?? "neutral"}
                    >
                      {notice.category}
                    </StatusBadge>
                    <span className="text-[10px] text-on-surface-variant">
                      {notice.author}
                    </span>
                    <span className="text-[10px] text-outline">|</span>
                    <span className="text-[10px] text-on-surface-variant">
                      {notice.date}
                    </span>
                  </div>
                </div>

                <span className="material-symbols-outlined text-outline text-lg shrink-0 group-hover:text-primary transition-colors">
                  chevron_right
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center">
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container-high text-on-surface-variant text-xs font-bold hover:bg-surface-container-highest transition-colors">
          <span className="material-symbols-outlined text-sm">
            expand_more
          </span>
          더 보기
        </button>
      </div>
    </div>
  );
}
