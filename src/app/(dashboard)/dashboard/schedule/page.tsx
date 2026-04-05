import {
  PageHeader,
  StatusBadge,
  Card,
} from "@/components/common";
import { IconCalendarEvent } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import CalendarView from "./CalendarView";
import AddScheduleButton from "./AddScheduleButton";

function stripYear(name: string) {
  return name.replace(/\d{4}학년도\s*|\d{4}-(?=\d학기)/g, "");
}

interface ServiceSchedule {
  id: number;
  university_name: string | null;
  service_name: string | null;
  operator: string | null;
  category: string | null;
  writing_start: string | null;
  writing_end: string | null;
  payment_start: string | null;
  payment_end: string | null;
}

export default async function SchedulePage() {
  const supabase = createClient();

  // 일정이 있는 서비스만 조회 (작성기간 또는 결제기간이 있는 것)
  const { count } = await supabase
    .from("services")
    .select("id", { count: "exact", head: true })
    .or("writing_start.not.is.null,payment_start.not.is.null");

  const totalRows = count ?? 0;
  const allServices: ServiceSchedule[] = [];

  for (let offset = 0; offset < totalRows; offset += 1000) {
    const { data } = await supabase
      .from("services")
      .select("id, university_name, service_name, operator, category, writing_start, writing_end, payment_start, payment_end")
      .or("writing_start.not.is.null,payment_start.not.is.null")
      .range(offset, offset + 999);
    if (data) allServices.push(...(data as ServiceSchedule[]));
  }

  // 커스텀 일정 조회
  const { data: customSchedules } = await supabase
    .from("schedules")
    .select("*")
    .order("start_date", { ascending: true });

  const schedules = (customSchedules ?? []) as {
    id: number;
    title: string;
    description: string | null;
    start_date: string;
    end_date: string;
    category: string;
    created_by: string;
  }[];

  // 이번 주 일정 계산
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const weekDays = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const dayLabels = ["월", "화", "수", "목", "금"];

  function isDateInRange(date: Date, start: string | null, end: string | null) {
    if (!start || !end) return false;
    const s = new Date(start);
    const e = new Date(end);
    s.setHours(0, 0, 0, 0);
    e.setHours(23, 59, 59, 999);
    return date >= s && date <= e;
  }

  const weeklyData = weekDays.map((date, i) => {
    const isToday = date.toDateString() === today.toDateString();
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

    const dayItems: { title: string; subtitle: string; type: "작성" | "결제" | "일정"; category?: string }[] = [];

    // 커스텀 일정
    for (const sc of schedules) {
      if (isDateInRange(date, sc.start_date, sc.end_date)) {
        dayItems.push({
          title: sc.title,
          subtitle: sc.category,
          type: "일정",
          category: sc.category,
        });
      }
    }

    // 서비스 일정
    for (const s of allServices) {
      if (isDateInRange(date, s.writing_start, s.writing_end)) {
        dayItems.push({
          title: stripYear(s.service_name ?? "-"),
          subtitle: s.university_name ?? "-",
          type: "작성",
        });
      }
      if (isDateInRange(date, s.payment_start, s.payment_end)) {
        dayItems.push({
          title: stripYear(s.service_name ?? "-"),
          subtitle: s.university_name ?? "-",
          type: "결제",
        });
      }
    }

    // 중복 제거
    const unique = dayItems.filter((v, i, a) => a.findIndex((t) => t.title === v.title && t.type === v.type) === i);

    return {
      day: dayLabels[i],
      date: dateStr,
      isToday,
      items: unique.slice(0, 5),
      totalCount: unique.length,
    };
  });

  // CalendarView에 전달할 데이터
  const calendarServices = allServices.map((s) => ({
    id: s.id,
    university_name: s.university_name,
    service_name: s.service_name,
    writing_start: s.writing_start,
    writing_end: s.writing_end,
    payment_start: s.payment_start,
    payment_end: s.payment_end,
  }));

  const calendarSchedules = schedules.map((s) => ({
    id: s.id,
    title: s.title,
    category: s.category,
    start_date: s.start_date,
    end_date: s.end_date,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="전체 일정"
        description="서비스 작성기간 및 결제기간 일정을 한눈에 확인합니다."
        breadcrumb={["메인", "전체일정"]}
        actions={<AddScheduleButton />}
      />

      {/* 월간 캘린더 */}
      <CalendarView services={calendarServices} schedules={calendarSchedules} />

      {/* 이번 주 일정 */}
      <Card className="p-6">
        <h3 className="mb-6 flex items-center gap-2 text-sm font-bold text-on-surface">
          <IconCalendarEvent size={18} className="text-primary" />
          이번 주 서비스 일정
        </h3>
        <div className="space-y-6">
          {weeklyData.map((dayBlock) => (
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
                {dayBlock.isToday && <StatusBadge variant="success">오늘</StatusBadge>}
                {dayBlock.totalCount > 0 && (
                  <span className="text-[10px] text-on-surface-variant">{dayBlock.totalCount}건</span>
                )}
              </div>
              <div className="ml-2 space-y-2 border-l border-outline-variant/20 pl-5">
                {dayBlock.items.length > 0 ? (
                  dayBlock.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-outline-variant/10 bg-surface-container-high p-3 transition-colors hover:bg-surface-bright"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-on-surface-variant truncate max-w-[120px]">
                          {item.subtitle}
                        </span>
                        <span className="text-sm font-medium text-on-surface">
                          {item.title}
                        </span>
                      </div>
                      <StatusBadge variant={item.type === "작성" ? "info" : item.type === "결제" ? "warning" : "success"}>
                        {item.type === "작성" ? "작성기간" : item.type === "결제" ? "결제기간" : item.category ?? "일정"}
                      </StatusBadge>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-on-surface-variant/50 py-2">일정 없음</p>
                )}
                {dayBlock.totalCount > 5 && (
                  <p className="text-xs text-on-surface-variant">외 {dayBlock.totalCount - 5}건</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
