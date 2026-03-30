const systemHealth = [
  {
    name: "API 서버",
    status: "정상",
    uptime: "99.97%",
    responseTime: "42ms",
    icon: "dns",
  },
  {
    name: "데이터베이스",
    status: "정상",
    uptime: "99.99%",
    responseTime: "8ms",
    icon: "database",
  },
  {
    name: "스토리지",
    status: "주의",
    uptime: "99.95%",
    responseTime: "120ms",
    icon: "cloud",
  },
  {
    name: "CDN",
    status: "정상",
    uptime: "100%",
    responseTime: "15ms",
    icon: "language",
  },
  {
    name: "메일 서버",
    status: "정상",
    uptime: "99.90%",
    responseTime: "230ms",
    icon: "mail",
  },
  {
    name: "인증 서비스",
    status: "장애",
    uptime: "98.50%",
    responseTime: "1200ms",
    icon: "shield",
  },
];

const activityLog = [
  {
    user: "관리자",
    action: "시스템 설정 변경",
    detail: "메일 발송 SMTP 서버 주소 변경",
    time: "2분 전",
    icon: "settings",
  },
  {
    user: "김민수",
    action: "사용자 권한 수정",
    detail: "박영호 계정 관리자 권한 부여",
    time: "15분 전",
    icon: "admin_panel_settings",
  },
  {
    user: "시스템",
    action: "자동 백업 완료",
    detail: "일일 백업 (전체 데이터베이스 320GB)",
    time: "1시간 전",
    icon: "backup",
  },
  {
    user: "이수진",
    action: "보고서 생성",
    detail: "2026년 3월 운영 현황 보고서 다운로드",
    time: "2시간 전",
    icon: "description",
  },
  {
    user: "시스템",
    action: "보안 스캔 완료",
    detail: "취약점 0건 발견, 정상 상태",
    time: "3시간 전",
    icon: "security",
  },
  {
    user: "정하은",
    action: "API 키 갱신",
    detail: "외부 연동 API 키 재발급",
    time: "5시간 전",
    icon: "key",
  },
];

const recentActions = [
  {
    title: "서버 패치 적용",
    description: "보안 패치 v2.4.1 전체 서버 적용 완료",
    date: "2026-03-26",
    status: "완료",
  },
  {
    title: "스토리지 용량 확장",
    description: "NAS 스토리지 2TB 추가 증설 예정",
    date: "2026-03-28",
    status: "예정",
  },
  {
    title: "인증 서비스 점검",
    description: "OAuth 인증 모듈 응답 지연 긴급 점검",
    date: "2026-03-26",
    status: "진행중",
  },
  {
    title: "SSL 인증서 갱신",
    description: "메인 도메인 SSL 인증서 만료일 2026-04-15",
    date: "2026-04-10",
    status: "예정",
  },
];

function getHealthStyle(status: string) {
  switch (status) {
    case "정상":
      return {
        badge: "bg-primary/10 text-primary",
        dot: "bg-primary",
        border: "border-primary/20",
      };
    case "주의":
      return {
        badge: "bg-tertiary/10 text-tertiary",
        dot: "bg-tertiary",
        border: "border-tertiary/20",
      };
    case "장애":
      return {
        badge: "bg-error/10 text-error",
        dot: "bg-error",
        border: "border-error/20",
      };
    default:
      return {
        badge: "bg-secondary/10 text-secondary",
        dot: "bg-secondary",
        border: "border-secondary/20",
      };
  }
}

function getActionStatusStyle(status: string) {
  switch (status) {
    case "완료":
      return "bg-primary/10 text-primary";
    case "진행중":
      return "bg-tertiary/10 text-tertiary";
    case "예정":
      return "bg-secondary/20 text-on-surface-variant";
    default:
      return "bg-secondary/10 text-secondary";
  }
}

export default function InternalPage() {
  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
        <span className="material-symbols-outlined text-[18px]">folder</span>
        <span>프로젝트</span>
        <span className="material-symbols-outlined text-[14px]">
          chevron_right
        </span>
        <span className="text-primary font-medium">내부관리자</span>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-on-surface">
          내부관리자
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          시스템 상태, 사용자 활동, 관리 작업을 모니터링합니다.
        </p>
      </div>

      {/* System Health Cards */}
      <div>
        <h2 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-4">
          시스템 상태
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemHealth.map((system) => {
            const style = getHealthStyle(system.status);
            return (
              <div
                key={system.name}
                className={`rounded-xl border bg-surface-container p-5 space-y-4 ${style.border}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        {system.icon}
                      </span>
                    </div>
                    <span className="font-semibold text-on-surface">
                      {system.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${style.dot} animate-pulse`}
                    />
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${style.badge}`}
                    >
                      {system.status}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-medium">
                      가동률
                    </span>
                    <p className="text-lg font-black text-on-surface mt-0.5">
                      {system.uptime}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-medium">
                      응답시간
                    </span>
                    <p className="text-lg font-black text-on-surface mt-0.5">
                      {system.responseTime}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Log */}
        <div>
          <h2 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-4">
            사용자 활동 로그
          </h2>
          <div className="rounded-xl border border-outline-variant/15 bg-surface-container overflow-hidden">
            <div className="divide-y divide-outline-variant/10">
              {activityLog.map((activity, idx) => (
                <div
                  key={idx}
                  className="px-5 py-4 flex items-start gap-4 hover:bg-surface-container-high/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                      {activity.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-on-surface">
                        {activity.user}
                      </span>
                      <span className="text-on-surface-variant text-xs">
                        {activity.action}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5 truncate">
                      {activity.detail}
                    </p>
                  </div>
                  <span className="text-[10px] text-on-surface-variant whitespace-nowrap mt-1">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Actions */}
        <div>
          <h2 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-4">
            최근 관리 작업
          </h2>
          <div className="space-y-3">
            {recentActions.map((action, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-outline-variant/15 bg-surface-container p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-on-surface">
                      {action.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      {action.description}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 ${getActionStatusStyle(action.status)}`}
                  >
                    {action.status}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-3">
                  <span className="material-symbols-outlined text-on-surface-variant text-[14px]">
                    calendar_today
                  </span>
                  <span className="text-[11px] text-on-surface-variant">
                    {action.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
