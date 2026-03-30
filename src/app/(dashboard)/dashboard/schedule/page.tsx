import {
  PageHeader,
  StatusBadge,
  Card,
} from "@/components/common";

/* ── 캘린더 데이터 ── */
const YEAR = 2026;
const MONTH = 3; // 3월

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

// 2026년 3월: 1일 = 일요일, 31일까지
const firstDayOfWeek = 0; // 일요일
const daysInMonth = 31;
const TODAY = 31;

type EventDot = "primary" | "error" | "tertiary";

const calendarEvents: Record<number, EventDot[]> = {
  2: ["primary"],
  5: ["primary", "tertiary"],
  9: ["primary"],
  11: ["error"],
  14: ["tertiary"],
  16: ["primary"],
  18: ["primary", "error"],
  20: ["primary"],
  23: ["tertiary"],
  25: ["primary"],
  27: ["error", "primary"],
  28: ["primary"],
  30: ["primary"],
  31: ["primary", "error", "tertiary"],
};

const dotColorMap: Record<EventDot, string> = {
  primary: "bg-primary",
  error: "bg-error",
  tertiary: "bg-tertiary",
};

/* ── 주간 일정 데이터 ── */
type CategoryType = "미팅" | "리뷰" | "마감" | "점검";

interface ScheduleItem {
  time: string;
  title: string;
  category: CategoryType;
}

interface DaySchedule {
  day: string;
  date: string;
  isToday?: boolean;
  items: ScheduleItem[];
}

const weeklySchedule: DaySchedule[] = [
  {
    day: "월",
    date: "3/30",
    items: [
      { time: "09:00", title: "팀 스탠드업", category: "미팅" },
      { time: "14:00", title: "고객사 A 미팅", category: "미팅" },
    ],
  },
  {
    day: "화",
    date: "3/31",
    isToday: true,
    items: [
      { time: "10:00", title: "프로젝트 킥오프", category: "미팅" },
      { time: "16:00", title: "보안 리뷰", category: "리뷰" },
    ],
  },
  {
    day: "수",
    date: "4/1",
    items: [
      { time: "09:30", title: "경영진 보고", category: "미팅" },
      { time: "13:00", title: "시스템 점검", category: "점검" },
    ],
  },
  {
    day: "목",
    date: "4/2",
    items: [
      { time: "11:00", title: "채용 면접", category: "미팅" },
      { time: "15:00", title: "파트너 미팅", category: "미팅" },
    ],
  },
  {
    day: "금",
    date: "4/3",
    items: [
      { time: "09:00", title: "주간 회고", category: "리뷰" },
      { time: "17:00", title: "주간 리포트 마감", category: "마감" },
    ],
  },
];

const categoryVariant: Record<CategoryType, "info" | "warning" | "error" | "neutral"> = {
  미팅: "info",
  리뷰: "warning",
  마감: "error",
  점검: "neutral",
};

/* ── 다가오는 주요 일정 ── */
const upcomingEvents = [
  { title: "한양대 계약 갱신", dDay: 3, variant: "error" as const },
  { title: "분기 실적 보고", dDay: 7, variant: "warning" as const },
  { title: "보증보험 갱신", dDay: 14, variant: "info" as const },
  { title: "시스템 업데이트", dDay: 21, variant: "neutral" as const },
  { title: "인수인계 완료 예정", dDay: 30, variant: "neutral" as const },
] as const;

/* ── 캘린더 셀 빌드 ── */
function buildCalendarCells() {
  const cells: Array<{ day: number | null; dots: EventDot[] }> = [];

  // 이전 달 빈 칸
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push({ day: null, dots: [] });
  }

  // 이번 달 날짜
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, dots: calendarEvents[d] ?? [] });
  }

  // 남은 셀 (7의 배수로 채움)
  const remaining = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7);
  for (let i = 0; i < remaining; i++) {
    cells.push({ day: null, dots: [] });
  }

  return cells;
}

export default function SchedulePage() {
  const cells = buildCalendarCells();

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <PageHeader
        title="전체 일정"
        breadcrumb={["메인", "전체일정"]}
        actions={
          <button className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary transition-all hover:brightness-110 active:scale-95">
            <span className="material-symbols-outlined text-sm">add</span>
            일정 추가
          </button>
        }
      />

      {/* ── 월간 캘린더 ── */}
      <section>
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-on-surface">
              <span className="material-symbols-outlined text-primary">calendar_month</span>
              {YEAR}년 {MONTH}월
            </h3>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" />
                일반
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-error" />
                긴급
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-tertiary" />
                주의
              </div>
            </div>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 mb-2">
            {DAY_LABELS.map((label, i) => (
              <div
                key={label}
                className={`text-center text-[10px] font-bold uppercase tracking-widest py-2 ${
                  i === 0
                    ? "text-error/70"
                    : i === 6
                      ? "text-secondary/70"
                      : "text-on-surface-variant"
                }`}
              >
                {label}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7 border-t border-outline-variant/10">
            {cells.map((cell, idx) => {
              const isToday = cell.day === TODAY;
              const isWeekend =
                idx % 7 === 0 || idx % 7 === 6;

              return (
                <div
                  key={idx}
                  className="relative flex flex-col items-center gap-1 border-b border-r border-outline-variant/10 py-3 min-h-[72px] transition-colors hover:bg-surface-container-high"
                >
                  {cell.day !== null && (
                    <>
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                          isToday
                            ? "bg-primary text-on-primary"
                            : isWeekend
                              ? "text-on-surface-variant/60"
                              : "text-on-surface"
                        }`}
                      >
                        {cell.day}
                      </span>
                      {cell.dots.length > 0 && (
                        <div className="flex items-center gap-1">
                          {cell.dots.map((dot, dotIdx) => (
                            <span
                              key={dotIdx}
                              className={`h-1.5 w-1.5 rounded-full ${dotColorMap[dot]}`}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      {/* ── 이번 주 일정 (2열) ── */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* 주간 일정 (8/12) */}
        <div className="lg:col-span-8">
          <Card className="p-6">
            <h3 className="mb-6 flex items-center gap-2 text-sm font-bold text-on-surface">
              <span className="material-symbols-outlined text-primary text-lg">date_range</span>
              주간 일정
            </h3>
            <div className="space-y-6">
              {weeklySchedule.map((dayBlock) => (
                <div key={dayBlock.day}>
                  <div className="mb-3 flex items-center gap-2">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                        dayBlock.isToday
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container-high text-on-surface-variant"
                      }`}
                    >
                      {dayBlock.day}
                    </span>
                    <span className="text-xs text-on-surface-variant">{dayBlock.date}</span>
                    {dayBlock.isToday && (
                      <StatusBadge variant="success">오늘</StatusBadge>
                    )}
                  </div>
                  <div className="ml-2 space-y-2 border-l border-outline-variant/20 pl-5">
                    {dayBlock.items.map((item) => (
                      <div
                        key={`${dayBlock.day}-${item.time}`}
                        className="flex items-center justify-between rounded-lg border border-outline-variant/10 bg-surface-container-high p-3 transition-colors hover:bg-surface-bright"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-14 shrink-0 text-xs font-mono font-bold text-on-surface-variant">
                            {item.time}
                          </span>
                          <span className="text-sm font-medium text-on-surface">
                            {item.title}
                          </span>
                        </div>
                        <StatusBadge variant={categoryVariant[item.category]}>
                          {item.category}
                        </StatusBadge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 다가오는 주요 일정 (4/12) */}
        <div className="lg:col-span-4">
          <Card className="p-6">
            <h3 className="mb-6 flex items-center gap-2 text-sm font-bold text-on-surface">
              <span className="material-symbols-outlined text-primary text-lg">upcoming</span>
              다가오는 주요 일정
            </h3>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.title}
                  className="flex items-center justify-between rounded-lg border border-outline-variant/10 bg-surface-container-high p-4 transition-colors hover:bg-surface-bright"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-on-surface">
                      {event.title}
                    </span>
                    <StatusBadge variant={event.variant}>
                      D-{event.dDay}
                    </StatusBadge>
                  </div>
                  <span
                    className={`text-2xl font-black tracking-tighter ${
                      event.variant === "error"
                        ? "text-error"
                        : event.variant === "warning"
                          ? "text-tertiary"
                          : "text-on-surface-variant/40"
                    }`}
                  >
                    {event.dDay}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
