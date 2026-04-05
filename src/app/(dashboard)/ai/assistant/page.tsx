import PageHeader from "@/components/common/PageHeader";
import Card from "@/components/common/Card";

const messages = [
  {
    id: 1,
    role: "assistant" as const,
    content:
      "안녕하세요! DOT 운영 어시스턴트입니다. 운영 현황 분석, 보고서 작성, 데이터 조회 등 다양한 업무를 도와드릴 수 있습니다. 무엇을 도와드릴까요?",
    timestamp: "14:30",
  },
  {
    id: 2,
    role: "user" as const,
    content: "이번 주 팀별 KPI 달성 현황을 요약해줘",
    timestamp: "14:31",
  },
  {
    id: 3,
    role: "assistant" as const,
    content:
      "이번 주 팀별 KPI 달성 현황을 분석했습니다.\n\n**개발팀** -- 95.2점 (목표 초과 달성)\n**운영팀** -- 92.0점 (목표 달성)\n**마케팅팀** -- 88.5점 (목표 근접)\n**디자인팀** -- 86.3점 (개선 필요)\n\n전체 평균 90.5점으로, 전주 대비 2.3점 상승했습니다. 개발팀이 3주 연속 1위를 유지하고 있으며, 디자인팀은 리소스 부족으로 소폭 하락했습니다.",
    timestamp: "14:31",
  },
];

const suggestedPrompts = [
  { icon: "bar_chart", title: "성과 분석", prompt: "이번 달 팀별 성과 비교 분석해줘" },
  { icon: "description", title: "보고서 작성", prompt: "주간 운영 현황 보고서 초안 작성해줘" },
  { icon: "search", title: "데이터 조회", prompt: "최근 7일간 시스템 가동률을 알려줘" },
  { icon: "lightbulb", title: "개선 제안", prompt: "운영 효율성 개선 방안을 제안해줘" },
  { icon: "schedule", title: "일정 관리", prompt: "이번 주 주요 일정과 마감 업무를 정리해줘" },
  { icon: "trending_up", title: "트렌드 분석", prompt: "최근 3개월간 프로젝트 완료율 추이를 분석해줘" },
];

const recentConversations = [
  { id: 1, title: "팀별 KPI 달성 현황 요약", preview: "이번 주 팀별 KPI 달성 현황을 분석했습니다...", date: "오늘 14:31", messageCount: 3 },
  { id: 2, title: "2월 운영 보고서 데이터 정리", preview: "2월 운영 현황 데이터를 정리했습니다. 주요 지표...", date: "어제 16:22", messageCount: 8 },
  { id: 3, title: "시스템 모니터링 알림 기준 검토", preview: "현재 알림 임계치를 검토한 결과, CPU 사용률...", date: "03-24", messageCount: 5 },
  { id: 4, title: "Q1 목표 달성률 예측", preview: "현재 추세를 기반으로 Q1 목표 달성 확률은...", date: "03-22", messageCount: 12 },
];

export default function AssistantPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="AI 어시스턴트"
        description="AI와 대화하며 운영 업무를 효율적으로 처리하세요."
        breadcrumb={["AI & 자동화", "어시스턴트"]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ height: "calc(100vh - 220px)" }}>
        {/* Chat Area */}
        <Card className="lg:col-span-2 flex flex-col overflow-hidden p-0">
          {/* Chat Header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-outline-variant/15">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[18px]">
                smart_toy
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-on-surface">DOT 어시스턴트</p>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[10px] text-on-surface-variant">온라인</span>
              </div>
            </div>
            <button className="w-8 h-8 rounded-lg hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined text-[18px]">more_vert</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-primary text-[16px]">
                      smart_toy
                    </span>
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-primary text-on-primary rounded-br-md"
                      : "bg-surface-container-high text-on-surface rounded-bl-md"
                  }`}
                >
                  <p
                    className={`text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === "user" ? "" : "text-on-surface/90"
                    }`}
                  >
                    {msg.content}
                  </p>
                  <p
                    className={`text-[10px] mt-1.5 ${
                      msg.role === "user"
                        ? "text-on-primary/60"
                        : "text-on-surface-variant"
                    }`}
                  >
                    {msg.timestamp}
                  </p>
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-black text-on-secondary-container">
                      나
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Prompts */}
          <div className="px-5 pb-3">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {suggestedPrompts.slice(0, 3).map((sp) => (
                <button
                  key={sp.title}
                  className="flex items-center gap-1.5 bg-surface-container-high border border-outline-variant/15 rounded-full px-3 py-1.5 text-xs text-on-surface-variant hover:text-primary hover:border-primary/20 transition-colors whitespace-nowrap flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {sp.icon}
                  </span>
                  {sp.prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="px-5 pb-4">
            <div className="flex items-center gap-2 bg-surface-container-high rounded-xl border border-outline-variant/15 px-4 py-2.5 focus-within:border-primary/30 transition-colors">
              <input
                type="text"
                placeholder="메시지를 입력하세요..."
                className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
              />
              <button className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined text-[20px]">
                  attach_file
                </span>
              </button>
              <button className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary hover:bg-primary-dim transition-colors">
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </div>
          </div>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4 overflow-y-auto">
          {/* Prompt Grid */}
          <Card className="p-4">
            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">
              빠른 질문
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {suggestedPrompts.map((sp) => (
                <button
                  key={sp.title}
                  className="flex flex-col items-start gap-1.5 bg-surface-container-high rounded-lg p-3 hover:bg-primary/10 hover:border-primary/20 border border-transparent transition-colors text-left group"
                >
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px] group-hover:text-primary transition-colors">
                    {sp.icon}
                  </span>
                  <span className="text-[11px] font-semibold text-on-surface group-hover:text-primary transition-colors">
                    {sp.title}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* Recent Conversations */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                최근 대화
              </h3>
              <button className="text-[10px] text-primary font-semibold hover:underline">
                전체보기
              </button>
            </div>
            <div className="space-y-1">
              {recentConversations.map((conv) => (
                <button
                  key={conv.id}
                  className="w-full text-left p-2.5 rounded-lg hover:bg-surface-container-high transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-xs font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                      {conv.title}
                    </p>
                    <span className="text-[10px] text-on-surface-variant flex-shrink-0 ml-2">
                      {conv.date}
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">
                    {conv.preview}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-on-surface-variant text-[11px]">
                      chat_bubble
                    </span>
                    <span className="text-[10px] text-on-surface-variant">
                      {conv.messageCount}개 메시지
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
