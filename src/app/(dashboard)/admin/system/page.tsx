import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import Card from "@/components/common/Card";

const healthCards = [
  { label: "CPU", value: 42, unit: "%", status: "normal" as const, icon: "memory", detail: "4코어 / 평균 부하 0.82" },
  { label: "메모리", value: 67, unit: "%", status: "normal" as const, icon: "data_usage", detail: "10.7GB / 16GB 사용중" },
  { label: "디스크", value: 78, unit: "%", status: "warning" as const, icon: "hard_drive", detail: "312GB / 400GB 사용중" },
  { label: "네트워크", value: 23, unit: "ms", status: "normal" as const, icon: "wifi", detail: "평균 응답시간 23ms" },
];

const configurations = [
  { id: "maintenance", label: "유지보수 모드", description: "활성화 시 사용자 접근이 제한됩니다.", icon: "construction", enabled: false, critical: true },
  { id: "auto-backup", label: "자동 백업", description: "매일 02:00 전체 데이터베이스 자동 백업", icon: "backup", enabled: true, critical: false },
  { id: "email-notification", label: "이메일 알림", description: "시스템 이벤트 발생 시 관리자에게 이메일 전송", icon: "mail", enabled: true, critical: false },
  { id: "two-factor", label: "2단계 인증 강제", description: "모든 사용자에게 2FA를 필수로 적용", icon: "security", enabled: false, critical: false },
  { id: "api-rate-limit", label: "API 속도 제한", description: "분당 최대 1,000건 요청으로 제한", icon: "speed", enabled: true, critical: false },
  { id: "audit-log", label: "감사 로그", description: "모든 관리자 작업을 기록 및 보관", icon: "receipt_long", enabled: true, critical: false },
];

const systemEvents = [
  { id: 1, type: "info" as const, message: "자동 백업이 성공적으로 완료되었습니다.", timestamp: "2026-03-26 02:00", source: "BackupService" },
  { id: 2, type: "warning" as const, message: "디스크 사용률이 78%에 도달했습니다. 정리를 권장합니다.", timestamp: "2026-03-26 09:15", source: "MonitoringAgent" },
  { id: 3, type: "info" as const, message: "사용자 '한소희' 계정이 생성되었습니다.", timestamp: "2026-03-26 10:22", source: "AuthService" },
  { id: 4, type: "error" as const, message: "외부 API 연동 오류 -- 3회 재시도 후 복구됨.", timestamp: "2026-03-25 14:45", source: "IntegrationHub" },
  { id: 5, type: "info" as const, message: "시스템 보안 패치 v2.4.1이 적용되었습니다.", timestamp: "2026-03-25 03:00", source: "UpdateManager" },
  { id: 6, type: "warning" as const, message: "비정상적인 로그인 시도가 감지되었습니다 (IP: 203.xxx.xxx.12).", timestamp: "2026-03-24 22:30", source: "SecurityGuard" },
];

const ringColorMap = {
  normal: "stroke-primary",
  warning: "stroke-tertiary",
  critical: "stroke-error",
} as const;

const textColorMap = {
  normal: "text-primary",
  warning: "text-tertiary",
  critical: "text-error",
} as const;

const eventIcon = {
  info: "info",
  warning: "warning",
  error: "error",
} as const;

function RingGauge({
  percent,
  ringColor,
}: {
  percent: number;
  ringColor: string;
}) {
  const circumference = 2 * Math.PI * 30;
  const dashOffset = circumference - (percent / 100) * circumference;

  return (
    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
      <circle
        cx="32" cy="32" r="30" fill="none"
        className="stroke-surface-container-high" strokeWidth="4"
      />
      <circle
        cx="32" cy="32" r="30" fill="none"
        className={ringColor} strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
      />
    </svg>
  );
}

export default function SystemPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="시스템 관리"
        description="시스템 상태를 모니터링하고 설정을 관리하세요."
        breadcrumb={["관리자", "시스템"]}
        actions={
          <Card className="flex items-center gap-2 px-3 py-2 !border-primary/20">
            <div className="w-2 h-2 rounded-full bg-primary animate-bar-pulse" />
            <span className="text-xs font-semibold text-primary">
              시스템 정상 가동
            </span>
          </Card>
        }
      />

      {/* Health Cards with Ring Gauges */}
      <div className="grid grid-cols-4 gap-4">
        {healthCards.map((card) => {
          const displayPercent = card.label === "네트워크" ? 23 : card.value;

          return (
            <Card
              key={card.label}
              hover
              className="p-5 relative overflow-hidden group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px] group-hover:text-primary transition-colors">
                      {card.icon}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-on-surface-variant">
                    {card.label}
                  </p>
                  <div className="flex items-baseline gap-0.5 mt-1">
                    <span className={`text-3xl font-black tracking-tight ${textColorMap[card.status]}`}>
                      {card.value}
                    </span>
                    <span className="text-sm font-bold text-on-surface-variant">
                      {card.unit}
                    </span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant mt-1">
                    {card.detail}
                  </p>
                </div>
                <div className="relative w-16 h-16 flex-shrink-0">
                  <RingGauge
                    percent={displayPercent}
                    ringColor={ringColorMap[card.status]}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* Configuration Toggles */}
        <Card className="col-span-3 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-on-surface">시스템 설정</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                시스템 동작 방식을 제어합니다.
              </p>
            </div>
            <button className="text-xs text-primary font-semibold hover:underline">
              모두 초기화
            </button>
          </div>

          <div className="space-y-1">
            {configurations.map((config) => (
              <div
                key={config.id}
                className="flex items-center justify-between p-3.5 rounded-lg hover:bg-surface-container-high/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      config.critical ? "bg-error/10" : "bg-surface-container-high"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] ${
                        config.critical ? "text-error" : "text-on-surface-variant"
                      }`}
                    >
                      {config.icon}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-on-surface">
                        {config.label}
                      </p>
                      {config.critical && (
                        <StatusBadge variant="error">주의</StatusBadge>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {config.description}
                    </p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <div
                  className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors ${
                    config.enabled ? "bg-primary" : "bg-outline-variant"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                      config.enabled
                        ? "left-6 bg-on-primary"
                        : "left-1 bg-on-surface-variant"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* System Events */}
        <Card className="col-span-2 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-on-surface">시스템 이벤트</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                최근 시스템 활동 기록
              </p>
            </div>
            <button className="text-xs text-primary font-semibold hover:underline">
              전체보기
            </button>
          </div>

          <div className="space-y-3">
            {systemEvents.map((event) => (
              <div
                key={event.id}
                className="flex gap-3 p-3 rounded-lg hover:bg-surface-container-high/50 transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    event.type === "info"
                      ? "bg-primary/10"
                      : event.type === "warning"
                        ? "bg-tertiary/10"
                        : "bg-error/10"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[16px] ${
                      event.type === "info"
                        ? "text-primary"
                        : event.type === "warning"
                          ? "text-tertiary"
                          : "text-error"
                    }`}
                  >
                    {eventIcon[event.type]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-on-surface leading-snug">
                    {event.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-on-surface-variant font-medium">
                      {event.timestamp}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-outline-variant" />
                    <span className="text-[10px] text-on-surface-variant font-mono">
                      {event.source}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
