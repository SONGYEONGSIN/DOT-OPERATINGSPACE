import {
  PageHeader,
  KpiGrid,
  KpiCard,
  StatusBadge,
  Card,
  ProgressBar,
} from "@/components/common";

const services = [
  { name: "PIMS 원서접수", description: "대학별 원서접수 시스템 통합 관리", status: "live" as const, uptime: 99.97, cpu: 42, ram: 68, lastIncident: "32일 전", university: "42개 대학", icon: "hub" },
  { name: "경쟁률 조회", description: "실시간 경쟁률 집계 및 공개 서비스", status: "live" as const, uptime: 99.91, cpu: 28, ram: 45, lastIncident: "15일 전", university: "38개 대학", icon: "leaderboard" },
  { name: "진학캐쉬 정산", description: "광고 수익 정산 및 분배 시스템", status: "alert" as const, uptime: 98.45, cpu: 78, ram: 85, lastIncident: "2일 전", university: "전체", icon: "payments" },
  { name: "내부관리자", description: "대학 내부 행정 관리 솔루션", status: "live" as const, uptime: 99.85, cpu: 15, ram: 32, lastIncident: "8일 전", university: "35개 대학", icon: "admin_panel_settings" },
  { name: "접수관리자", description: "접수 데이터 관리 및 통계 시스템", status: "maintenance" as const, uptime: 95.2, cpu: 0, ram: 0, lastIncident: "진행중", university: "42개 대학", icon: "assignment" },
  { name: "추천인검증", description: "추천인 정보 검증 및 인증 서비스", status: "live" as const, uptime: 99.99, cpu: 8, ram: 18, lastIncident: "60일 전", university: "28개 대학", icon: "verified_user" },
  { name: "생성툴", description: "마케팅 콘텐츠 자동 생성 도구", status: "live" as const, uptime: 99.72, cpu: 55, ram: 62, lastIncident: "12일 전", university: "전체", icon: "construction" },
  { name: "초중고 서비스", description: "초중고 입학 관련 정보 제공", status: "alert" as const, uptime: 97.8, cpu: 65, ram: 72, lastIncident: "1일 전", university: "15개 학교", icon: "school" },
];

const statusBadgeMap = {
  live: { variant: "success" as const, label: "LIVE" },
  alert: { variant: "warning" as const, label: "ALERT" },
  maintenance: { variant: "error" as const, label: "점검중" },
};

const uptimeHours = [
  { hour: "00:00", value: 99.8, incident: false },
  { hour: "04:00", value: 99.9, incident: false },
  { hour: "08:00", value: 99.6, incident: false },
  { hour: "12:00", value: 82.1, incident: true },
  { hour: "16:00", value: 99.4, incident: false },
  { hour: "20:00", value: 100, incident: false },
];

const recentIssues = [
  { title: "진학캐쉬 정산 지연", desc: "외부 결제 API 응답 지연으로 정산 처리 대기", time: "2시간 전", severity: "error" as const },
  { title: "초중고 서비스 트래픽 급증", desc: "원서접수 기간 시작으로 인한 동시접속 증가", time: "6시간 전", severity: "warning" as const },
  { title: "접수관리자 정기점검 시작", desc: "DB 마이그레이션 및 인덱스 최적화 작업", time: "12시간 전", severity: "info" as const },
];

const severityStyles = {
  error: { icon: "error", color: "text-error", border: "border-l-error" },
  warning: { icon: "warning", color: "text-tertiary", border: "border-l-tertiary" },
  info: { icon: "info", color: "text-secondary", border: "border-l-secondary" },
} as const;

export default function ServicesPage() {
  const liveCount = services.filter((s) => s.status === "live").length;
  const alertCount = services.filter((s) => s.status === "alert" || s.status === "maintenance").length;
  const avgUptime = (services.reduce((sum, s) => sum + s.uptime, 0) / services.length).toFixed(2);

  return (
    <div className="space-y-8">
      <PageHeader
        title="서비스 관리"
        description="운영 중인 서비스의 상태와 가동률을 모니터링합니다."
        breadcrumb={["운영", "서비스"]}
        actions={
          <>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-high text-on-surface-variant text-sm font-semibold hover:bg-surface-bright transition-colors">
              <span className="material-symbols-outlined text-lg">refresh</span>
              새로고침
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-black hover:brightness-110 transition-all active:scale-95">
              <span className="material-symbols-outlined text-lg">add</span>
              서비스 추가
            </button>
          </>
        }
      />

      <KpiGrid>
        <KpiCard icon="miscellaneous_services" label="전체 서비스" value={services.length.toString()} suffix="개" change="+2 New" trend="up" />
        <KpiCard icon="check_circle" label="정상운영" value={liveCount.toString()} suffix="개" change="92.8% Health" trend="up" />
        <KpiCard icon="error_outline" label="경고" value={alertCount.toString()} suffix="건" alert={alertCount > 0} />
        <KpiCard icon="speed" label="평균가동률" value={avgUptime} suffix="%" change="SLA 충족" trend="up" />
      </KpiGrid>

      {/* Service Card Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-primary tracking-[0.2em] uppercase">서비스 현황</h2>
          <div className="flex items-center gap-3">
            {[{ color: "bg-primary", label: "정상" }, { color: "bg-tertiary", label: "경고" }, { color: "bg-error", label: "점검" }].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${l.color}`} />
                <span className="text-[10px] text-on-surface-variant font-medium">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {services.map((service) => {
            const badge = statusBadgeMap[service.status];
            return (
              <Card key={service.name} hover className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-surface-container-high">
                      <span className="material-symbols-outlined text-on-surface-variant text-xl">{service.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-on-surface">{service.name}</h3>
                      <p className="text-[10px] text-on-surface-variant">{service.university}</p>
                    </div>
                  </div>
                  <StatusBadge variant={badge.variant} dot={service.status === "live"}>{badge.label}</StatusBadge>
                </div>
                <p className="text-xs text-on-surface-variant mb-4 line-clamp-2">{service.description}</p>
                {/* CPU / RAM */}
                <div className="space-y-2 mb-3">
                  {[{ label: "CPU", val: service.cpu, threshold: 70 }, { label: "RAM", val: service.ram, threshold: 80 }].map((m) => (
                    <div key={m.label}>
                      <div className="flex justify-between text-[10px] font-bold mb-1">
                        <span className="text-on-surface-variant uppercase tracking-wider">{m.label}</span>
                        <span className="text-on-surface tabular-nums">{m.val}%</span>
                      </div>
                      <ProgressBar value={m.val} color={m.val > m.threshold ? "warning" : "primary"} />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 pt-3 border-t border-outline-variant/10">
                  <span className="material-symbols-outlined text-outline text-xs">history</span>
                  <span className="text-[10px] text-on-surface-variant">마지막 이슈: {service.lastIncident}</span>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  {[{ icon: "monitoring", label: "모니터링" }, { icon: "settings", label: "설정" }].map((a) => (
                    <button key={a.label} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-surface-container-high text-on-surface-variant text-[10px] font-semibold hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-xs">{a.icon}</span>
                      {a.label}
                    </button>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Bottom: Uptime Chart + Recent Issues */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">analytics</span>
              최근 24시간 가동률
            </h4>
            <span className="text-xs text-on-surface-variant">실시간 업데이트</span>
          </div>
          <div className="h-48 flex items-end gap-1.5">
            {uptimeHours.map((h) => (
              <div key={h.hour} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-full rounded-t-sm transition-all ${h.incident ? "bg-error/40 hover:bg-error/60" : "bg-primary/20 hover:bg-primary/40"}`}
                  style={{ height: `${(h.value / 100) * 192}px` }}
                  title={`${h.hour} - ${h.value}%`}
                />
                <span className="text-[8px] text-on-surface-variant mt-1">{h.hour}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-error">notification_important</span>
              최근 이슈 리포트
            </h4>
            <button className="text-xs text-primary font-bold">전체 보기</button>
          </div>
          <div className="space-y-3">
            {recentIssues.map((issue) => {
              const s = severityStyles[issue.severity];
              return (
                <div key={issue.title} className={`flex gap-4 p-3 rounded-r-md border-l-2 ${s.border} bg-surface-container-high/50`}>
                  <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-on-surface">{issue.title}</p>
                    <p className="text-[10px] text-on-surface-variant mt-1">{issue.desc}</p>
                  </div>
                  <span className="text-[10px] text-on-surface-variant whitespace-nowrap">{issue.time}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
