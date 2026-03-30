const tools = [
  {
    icon: "description",
    name: "보고서 생성기",
    description:
      "프로젝트 진행 현황, 실적 분석 보고서를 자동으로 생성합니다. PDF 및 Excel 형식을 지원합니다.",
    category: "문서",
  },
  {
    icon: "bar_chart",
    name: "차트 빌더",
    description:
      "데이터를 시각적인 차트로 변환합니다. 막대, 원형, 선형 등 다양한 차트 유형을 제공합니다.",
    category: "시각화",
  },
  {
    icon: "table_chart",
    name: "엑셀 변환기",
    description:
      "시스템 데이터를 커스텀 엑셀 양식으로 변환합니다. 다양한 템플릿을 제공합니다.",
    category: "데이터",
  },
  {
    icon: "mail",
    name: "메일 템플릿",
    description:
      "입학 안내, 합격 통보, 서류 요청 등 목적별 이메일 템플릿을 생성합니다.",
    category: "커뮤니케이션",
  },
  {
    icon: "qr_code_2",
    name: "QR 코드 생성기",
    description:
      "원서접수 링크, 행사 안내, 캠퍼스 지도 등을 위한 QR 코드를 생성합니다.",
    category: "유틸리티",
  },
  {
    icon: "image",
    name: "배너 생성기",
    description:
      "모집요강, 입학설명회 홍보 배너를 미리 정의된 디자인 템플릿으로 생성합니다.",
    category: "디자인",
  },
  {
    icon: "calendar_month",
    name: "일정표 생성기",
    description:
      "입시 일정, 프로젝트 마일스톤, 행사 일정을 캘린더 형식으로 자동 생성합니다.",
    category: "문서",
  },
  {
    icon: "dataset",
    name: "데이터 연동기",
    description:
      "외부 시스템 데이터를 표준 포맷으로 변환하여 연동합니다. API 및 CSV를 지원합니다.",
    category: "데이터",
  },
  {
    icon: "smart_toy",
    name: "AI 문구 생성기",
    description:
      "입학 홍보 문구, 모집 안내문, SNS 게시물 등을 AI 기반으로 자동 생성합니다.",
    category: "AI",
  },
];

const categories = ["전체", "문서", "시각화", "데이터", "커뮤니케이션", "유틸리티", "디자인", "AI"];

function getCategoryStyle(category: string) {
  switch (category) {
    case "문서":
      return "bg-primary/10 text-primary";
    case "시각화":
      return "bg-tertiary/10 text-tertiary";
    case "데이터":
      return "bg-secondary/20 text-secondary";
    case "커뮤니케이션":
      return "bg-primary/10 text-primary-dim";
    case "유틸리티":
      return "bg-tertiary/10 text-tertiary-dim";
    case "디자인":
      return "bg-error/10 text-error";
    case "AI":
      return "bg-primary/10 text-primary";
    default:
      return "bg-secondary/10 text-secondary";
  }
}

export default function GeneratorPage() {
  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
        <span className="material-symbols-outlined text-[18px]">folder</span>
        <span>프로젝트</span>
        <span className="material-symbols-outlined text-[14px]">
          chevron_right
        </span>
        <span className="text-primary font-medium">생성툴</span>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-on-surface">
          생성툴
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          업무에 필요한 문서, 데이터, 디자인 자산을 빠르게 생성하세요.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map((category) => (
          <button
            key={category}
            className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
              category === "전체"
                ? "bg-primary/10 text-primary"
                : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Tool Cards Grid */}
      <div>
        <h2 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-4">
          사용 가능한 도구
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className="rounded-xl border border-outline-variant/15 bg-surface-container p-6 flex flex-col gap-4 hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined text-primary text-[26px]">
                    {tool.icon}
                  </span>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getCategoryStyle(tool.category)}`}
                >
                  {tool.category}
                </span>
              </div>

              <div className="space-y-2 flex-1">
                <h3 className="font-bold text-on-surface text-base">
                  {tool.name}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <button className="w-full rounded-lg bg-primary/10 text-primary font-bold text-sm py-2.5 hover:bg-primary/20 transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">
                  play_arrow
                </span>
                생성하기
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
