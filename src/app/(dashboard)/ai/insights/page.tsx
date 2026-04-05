import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import Card from "@/components/common/Card";
import ProgressBar from "@/components/common/ProgressBar";

const insights = [
  {
    id: 1,
    title: "운영 효율성 개선 기회 감지",
    summary:
      "최근 2주간 반복 업무 처리 시간이 평균 18% 증가했습니다. 자동화 파이프라인 도입 시 월 32시간의 리소스 절감이 예상됩니다.",
    category: "효율성",
    confidence: 94,
    trend: "warning" as const,
    impact: "높음",
    generatedAt: "2분 전",
    tags: ["자동화", "프로세스", "리소스"],
  },
  {
    id: 2,
    title: "팀 성과 패턴 분석 완료",
    summary:
      "개발팀의 목표달성률이 3개월 연속 상승세입니다. 현재 추세 유지 시 Q1 목표 초과 달성(+7.2%) 확률이 89%로 예측됩니다.",
    category: "성과",
    confidence: 89,
    trend: "positive" as const,
    impact: "중간",
    generatedAt: "15분 전",
    tags: ["KPI", "예측", "트렌드"],
  },
  {
    id: 3,
    title: "시스템 부하 이상 징후 탐지",
    summary:
      "평일 14:00~16:00 시간대 API 응답 시간이 200ms를 초과하는 빈도가 증가하고 있습니다. 캐시 레이어 최적화를 권장합니다.",
    category: "인프라",
    confidence: 87,
    trend: "critical" as const,
    impact: "높음",
    generatedAt: "1시간 전",
    tags: ["모니터링", "성능", "인프라"],
  },
  {
    id: 4,
    title: "인력 배치 최적화 제안",
    summary:
      "현재 프로젝트 배정 현황 분석 결과, 디자인팀에 1명 추가 배치 시 병목 현상이 해소되고 전체 딜리버리 속도가 15% 향상될 것으로 분석됩니다.",
    category: "인사",
    confidence: 82,
    trend: "positive" as const,
    impact: "중간",
    generatedAt: "3시간 전",
    tags: ["인력", "최적화", "프로젝트"],
  },
];

const recommendations = [
  { icon: "auto_fix_high", title: "워크플로우 자동화", description: "반복 승인 프로세스 3건을 자동화하세요." },
  { icon: "group_add", title: "팀 리밸런싱", description: "디자인팀 리소스 보강을 검토하세요." },
  { icon: "speed", title: "성능 최적화", description: "API 캐시 레이어를 업데이트하세요." },
  { icon: "school", title: "스킬 업그레이드", description: "운영팀 대상 신규 도구 교육을 계획하세요." },
];

const trendBadgeVariant = {
  positive: "success",
  warning: "warning",
  critical: "error",
} as const;

const trendLabel = {
  positive: "긍정",
  warning: "주의",
  critical: "위험",
} as const;

export default function InsightsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="AI 인사이트"
        description="AI가 분석한 운영 인사이트와 개선 제안을 확인하세요."
        breadcrumb={["AI & 자동화", "인사이트"]}
        actions={
          <Card className="flex items-center gap-2 px-3 py-2 !border-primary/20">
            <div className="w-2 h-2 rounded-full bg-primary animate-bar-pulse" />
            <span className="text-xs font-semibold text-primary">
              실시간 분석 활성
            </span>
          </Card>
        }
      />

      {/* AI Analysis Banner */}
      <Card className="relative p-6 overflow-hidden !border-primary/20">
        <div className="scan-line" />
        <div className="absolute inset-0 kinetic-grid" />

        <div className="relative flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center glow-primary">
            <span className="material-symbols-outlined text-primary text-[28px]">
              neurology
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-on-surface">
              AI 분석 엔진 가동 중
            </h2>
            <p className="text-sm text-on-surface-variant mt-0.5">
              4개의 데이터 소스에서 실시간 패턴을 분석하고 있습니다. 마지막
              업데이트: 2분 전
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-black text-primary">{insights.length}</p>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                인사이트
              </p>
            </div>
            <div className="w-px h-10 bg-outline-variant/20" />
            <div className="text-center">
              <p className="text-2xl font-black text-on-surface">
                {recommendations.length}
              </p>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                제안
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight) => (
          <Card
            key={insight.id}
            hover
            className="p-5 relative overflow-hidden group"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <StatusBadge variant={trendBadgeVariant[insight.trend]}>
                    {trendLabel[insight.trend]}
                  </StatusBadge>
                  <StatusBadge variant="neutral">{insight.category}</StatusBadge>
                </div>
                <span className="text-[10px] text-on-surface-variant">
                  {insight.generatedAt}
                </span>
              </div>

              <h3 className="text-base font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">
                {insight.title}
              </h3>

              <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
                {insight.summary}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {insight.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md px-2 py-0.5 text-[10px] font-medium bg-surface-container-high text-on-surface-variant border border-outline-variant/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-on-surface-variant">신뢰도</span>
                  <div className="w-16">
                    <ProgressBar value={insight.confidence} />
                  </div>
                  <span className="text-[10px] font-bold text-primary">
                    {insight.confidence}%
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      <div>
        <h2 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-3">
          AI Recommendations
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {recommendations.map((rec) => (
            <Card key={rec.title} hover className="p-4 cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  {rec.icon}
                </span>
              </div>
              <h3 className="text-sm font-bold text-on-surface mb-1">
                {rec.title}
              </h3>
              <p className="text-xs text-on-surface-variant">{rec.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
