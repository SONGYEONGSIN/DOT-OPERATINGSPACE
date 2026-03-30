import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import Card from "@/components/common/Card";

const logs = [
  {
    id: 1,
    user: "김도연",
    avatar: "DY",
    action: "프로젝트 '스마트 오피스 구축' 마일스톤 완료 처리",
    timestamp: "2026-03-26 14:32",
    category: "프로젝트",
    type: "완료" as const,
    detail: "마일스톤 3/5 -- 인프라 설계 완료",
  },
  {
    id: 2,
    user: "박서연",
    avatar: "SY",
    action: "주간 운영 보고서(3월 3주차) 작성 및 제출",
    timestamp: "2026-03-26 13:15",
    category: "보고서",
    type: "생성" as const,
    detail: "12페이지 분량, PDF 생성 완료",
  },
  {
    id: 3,
    user: "이정민",
    avatar: "JM",
    action: "시스템 모니터링 알림 설정 변경",
    timestamp: "2026-03-26 11:48",
    category: "시스템",
    type: "수정" as const,
    detail: "CPU 임계치 85% -> 90%로 조정",
  },
  {
    id: 4,
    user: "최현우",
    avatar: "HW",
    action: "신규 팀원 '한소희' 온보딩 프로세스 시작",
    timestamp: "2026-03-26 10:22",
    category: "인사",
    type: "생성" as const,
    detail: "디자인팀 배정, 온보딩 5단계 진행 예정",
  },
  {
    id: 5,
    user: "김도연",
    avatar: "DY",
    action: "운영 대시보드 KPI 목표치 업데이트",
    timestamp: "2026-03-26 09:55",
    category: "설정",
    type: "수정" as const,
    detail: "Q1 목표 달성률 85% -> 90% 상향",
  },
  {
    id: 6,
    user: "박서연",
    avatar: "SY",
    action: "시스템 개선 요청 #REQ-047 검토 완료",
    timestamp: "2026-03-25 17:40",
    category: "요청",
    type: "완료" as const,
    detail: "우선순위 '높음' -> 개발팀 전달",
  },
  {
    id: 7,
    user: "이정민",
    avatar: "JM",
    action: "자동 백업 스케줄 야간 배치 작업 설정",
    timestamp: "2026-03-25 16:12",
    category: "시스템",
    type: "생성" as const,
    detail: "매일 02:00 전체 DB 백업 자동화",
  },
  {
    id: 8,
    user: "최현우",
    avatar: "HW",
    action: "월간 성과 분석 보고서 초안 반려",
    timestamp: "2026-03-25 14:30",
    category: "보고서",
    type: "반려" as const,
    detail: "데이터 기준일 오류 -- 수정 요청",
  },
];

const typeBadgeVariant = {
  완료: "success",
  생성: "warning",
  수정: "info",
  반려: "error",
} as const;

const avatarStyles = [
  "bg-primary/20 text-primary",
  "bg-tertiary/20 text-tertiary",
  "bg-secondary-container text-on-secondary-container",
  "bg-error/15 text-error",
];

export default function WorkLogsPage() {
  const todayCount = logs.filter((l) =>
    l.timestamp.startsWith("2026-03-26"),
  ).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="업무 로그"
        description="팀원들의 활동 기록을 타임라인으로 확인하세요."
        breadcrumb={["분석 & 보고", "업무 로그"]}
        actions={
          <div className="flex items-center gap-2">
            <Card className="px-3 py-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">
                today
              </span>
              <span className="text-xs font-semibold text-on-surface">
                오늘 {todayCount}건
              </span>
            </Card>
            <button className="flex items-center gap-2 bg-surface-container-high border border-outline-variant/15 px-4 py-2 rounded-xl text-on-surface-variant text-sm hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[18px]">
                filter_list
              </span>
              필터
            </button>
          </div>
        }
      />

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-[23px] top-0 bottom-0 w-px bg-outline-variant/20" />

        <div className="space-y-1">
          {logs.map((log, index) => {
            const isNewDay =
              index === 0 ||
              log.timestamp.slice(0, 10) !== logs[index - 1].timestamp.slice(0, 10);

            return (
              <div key={log.id}>
                {/* Date separator */}
                {isNewDay && (
                  <div className="flex items-center gap-3 py-3 ml-[14px]">
                    <div className="w-[18px] h-[18px] rounded-full bg-primary flex items-center justify-center z-10">
                      <span className="material-symbols-outlined text-on-primary text-[12px]">
                        calendar_today
                      </span>
                    </div>
                    <span className="text-xs font-bold text-primary tracking-wider uppercase">
                      {log.timestamp.slice(0, 10)}
                    </span>
                  </div>
                )}

                {/* Log entry */}
                <div className="flex gap-4 group">
                  {/* Avatar */}
                  <div className="relative z-10 flex-shrink-0">
                    <div
                      className={`w-[47px] h-[47px] rounded-full flex items-center justify-center text-xs font-black ${avatarStyles[index % avatarStyles.length]}`}
                    >
                      {log.avatar}
                    </div>
                  </div>

                  {/* Content */}
                  <Card className="flex-1 p-4 group-hover:border-primary/20 transition-colors mb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-on-surface">
                            {log.user}
                          </span>
                          <StatusBadge variant={typeBadgeVariant[log.type]}>
                            {log.type}
                          </StatusBadge>
                        </div>
                        <p className="text-sm text-on-surface/90">{log.action}</p>
                        <p className="text-xs text-on-surface-variant mt-1.5">
                          {log.detail}
                        </p>
                      </div>
                      <StatusBadge variant="neutral">{log.category}</StatusBadge>
                    </div>
                    <div className="flex items-center gap-1 mt-3 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[13px]">
                        schedule
                      </span>
                      <span className="text-[11px]">
                        {log.timestamp.slice(11)}
                      </span>
                    </div>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
