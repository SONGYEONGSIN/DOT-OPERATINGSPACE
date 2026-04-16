"use client";

import { useState } from "react";
import { IconChevronLeft, IconChevronRight, IconCalendar } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { Card } from "@/components/common";

interface CalendarService {
  id: number;
  university_name: string | null;
  service_name: string | null;
  writing_start: string | null;
  writing_end: string | null;
  payment_start: string | null;
  payment_end: string | null;
}

interface CustomSchedule {
  id: number;
  title: string;
  category: string;
  start_date: string;
  end_date: string;
}

interface CalendarViewProps {
  services: CalendarService[];
  schedules: CustomSchedule[];
}

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

type DotType = "writing_start" | "writing_end" | "payment_start" | "payment_end" | "writing_active" | "payment_active" | "custom";

const dotColors: Record<string, string> = {
  writing_start: "bg-primary",
  writing_end: "bg-primary",
  writing_active: "bg-primary/40",
  payment_start: "bg-tertiary",
  payment_end: "bg-tertiary",
  payment_active: "bg-tertiary/40",
  custom: "bg-error",
};

function stripYear(name: string) {
  return name.replace(/\d{4}학년도\s*|\d{4}-(?=\d학기)/g, "");
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function isInRange(date: Date, start: string | null, end: string | null) {
  if (!start || !end) return false;
  const s = new Date(start);
  const e = new Date(end);
  s.setHours(0, 0, 0, 0);
  e.setHours(23, 59, 59, 999);
  date.setHours(12, 0, 0, 0);
  return date >= s && date <= e;
}

export default function CalendarView({ services, schedules }: CalendarViewProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  function prevMonth() {
    if (month === 1) { setYear(year - 1); setMonth(12); }
    else setMonth(month - 1);
    setSelectedDay(null);
  }

  function nextMonth() {
    if (month === 12) { setYear(year + 1); setMonth(1); }
    else setMonth(month + 1);
    setSelectedDay(null);
  }

  function goToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
    setSelectedDay(today.getDate());
  }

  // 각 날짜별 이벤트 dot 계산
  function getDotsForDay(day: number): DotType[] {
    const date = new Date(year, month - 1, day);
    const dots = new Set<DotType>();

    for (const s of services) {
      if (s.writing_start) {
        const ws = new Date(s.writing_start);
        if (isSameDay(date, ws)) dots.add("writing_start");
      }
      if (s.writing_end) {
        const we = new Date(s.writing_end);
        if (isSameDay(date, we)) dots.add("writing_end");
      }
      if (isInRange(new Date(date), s.writing_start, s.writing_end)) {
        dots.add("writing_active");
      }
      if (s.payment_start) {
        const ps = new Date(s.payment_start);
        if (isSameDay(date, ps)) dots.add("payment_start");
      }
      if (s.payment_end) {
        const pe = new Date(s.payment_end);
        if (isSameDay(date, pe)) dots.add("payment_end");
      }
      if (isInRange(new Date(date), s.payment_start, s.payment_end)) {
        dots.add("payment_active");
      }
    }

    // 커스텀 일정 체크
    for (const sc of schedules) {
      if (isInRange(new Date(date), sc.start_date, sc.end_date)) {
        dots.add("custom");
      }
    }

    // 우선순위: start/end > active
    const result: DotType[] = [];
    if (dots.has("custom")) result.push("custom");
    if (dots.has("writing_start") || dots.has("writing_end")) result.push("writing_start");
    else if (dots.has("writing_active")) result.push("writing_active");
    if (dots.has("payment_start") || dots.has("payment_end")) result.push("payment_start");
    else if (dots.has("payment_active")) result.push("payment_active");

    return result;
  }

  // 선택된 날짜의 일정 목록
  function getItemsForDay(day: number) {
    const date = new Date(year, month - 1, day);
    const items: { title: string; subtitle: string; type: "작성기간" | "결제기간" | "일정"; id: number }[] = [];

    // 커스텀 일정
    for (const sc of schedules) {
      if (isInRange(new Date(date), sc.start_date, sc.end_date)) {
        items.push({ title: sc.title, subtitle: sc.category, type: "일정", id: sc.id });
      }
    }

    // 서비스 일정
    for (const s of services) {
      if (isInRange(new Date(date), s.writing_start, s.writing_end)) {
        items.push({ title: stripYear(s.service_name ?? "-"), subtitle: s.university_name ?? "-", type: "작성기간", id: s.id });
      }
      if (isInRange(new Date(date), s.payment_start, s.payment_end)) {
        items.push({ title: stripYear(s.service_name ?? "-"), subtitle: s.university_name ?? "-", type: "결제기간", id: -s.id });
      }
    }

    return items.filter((v, i, a) => a.findIndex((t) => t.title === v.title && t.type === v.type) === i);
  }

  // 캘린더 셀 빌드
  const cells: Array<{ day: number | null; dots: DotType[] }> = [];
  for (let i = 0; i < firstDay; i++) cells.push({ day: null, dots: [] });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, dots: getDotsForDay(d) });
  const remaining = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7);
  for (let i = 0; i < remaining; i++) cells.push({ day: null, dots: [] });

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1;
  const selectedDayItems = selectedDay ? getItemsForDay(selectedDay) : [];

  return (
    <section>
      <Card className="p-6">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="p-1 rounded-[14px] hover:bg-[var(--color-surface)] transition-colors">
              <IconChevronLeft size={20} className="text-[var(--color-text-muted)]" />
            </button>
            <h3 className="flex items-center gap-2 text-lg font-bold text-[var(--color-text)] min-w-[140px] justify-center">
              <IconCalendar size={20} className="text-primary" />
              {year}년 {month}월
            </h3>
            <button onClick={nextMonth} className="p-1 rounded-[14px] hover:bg-[var(--color-surface)] transition-colors">
              <IconChevronRight size={20} className="text-[var(--color-text-muted)]" />
            </button>
            {!isCurrentMonth && (
              <button onClick={goToday} className="ml-2 px-3 py-1 rounded-[14px] bg-[var(--color-surface)] text-xs font-bold text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] transition-colors">
                오늘
              </button>
            )}
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-error" />
              일정
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" />
              작성기간
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-tertiary" />
              결제기간
            </div>
          </div>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_LABELS.map((label, i) => (
            <div
              key={label}
              className={cn(
                "text-center text-[10px] font-bold uppercase tracking-widest py-2",
                i === 0 ? "text-error/70" : i === 6 ? "text-secondary/70" : "text-[var(--color-text-muted)]",
              )}
            >
              {label}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 border-t border-black/[0.04]/10">
          {cells.map((cell, idx) => {
            const isToday = isCurrentMonth && cell.day === today.getDate();
            const isWeekend = idx % 7 === 0 || idx % 7 === 6;
            const isSelected = cell.day === selectedDay;

            return (
              <div
                key={idx}
                onClick={() => cell.day && setSelectedDay(cell.day === selectedDay ? null : cell.day)}
                className={cn(
                  "relative flex flex-col items-center gap-1 border-b border-r border-black/[0.04]/10 py-3 min-h-[72px] transition-colors cursor-pointer",
                  cell.day ? "hover:bg-[var(--color-surface)]" : "",
                  isSelected && "bg-primary/5",
                )}
              >
                {cell.day !== null && (
                  <>
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                        isToday
                          ? "bg-primary text-on-primary"
                          : isSelected
                            ? "bg-primary/20 text-primary"
                            : isWeekend
                              ? "text-[var(--color-text-muted)]/60"
                              : "text-[var(--color-text)]",
                      )}
                    >
                      {cell.day}
                    </span>
                    {cell.dots.length > 0 && (
                      <div className="flex items-center gap-1">
                        {cell.dots.map((dot, dotIdx) => (
                          <span key={dotIdx} className={cn("h-1.5 w-1.5 rounded-full", dotColors[dot])} />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* 선택된 날짜 상세 */}
        {selectedDay && (
          <div className="mt-4 pt-4 border-t border-black/[0.04]/10">
            <h4 className="text-xs font-bold text-[var(--color-text-muted)] mb-3">
              {month}월 {selectedDay}일 일정 ({selectedDayItems.length}건)
            </h4>
            {selectedDayItems.length > 0 ? (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {selectedDayItems.slice(0, 15).map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-[14px] border border-black/[0.04]/10 bg-[var(--color-surface)] px-4 py-2.5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs text-[var(--color-text-muted)] shrink-0 w-[100px] truncate">
                        {item.subtitle}
                      </span>
                      <span className="text-sm text-[var(--color-text)] truncate">
                        {item.title}
                      </span>
                    </div>
                    <span className={cn(
                      "shrink-0 px-2 py-0.5 rounded text-[10px] font-bold",
                      item.type === "작성기간" ? "bg-primary/10 text-primary"
                        : item.type === "결제기간" ? "bg-tertiary/10 text-tertiary"
                        : "bg-error/10 text-error",
                    )}>
                      {item.type}
                    </span>
                  </div>
                ))}
                {selectedDayItems.length > 15 && (
                  <p className="text-xs text-[var(--color-text-muted)] text-center">외 {selectedDayItems.length - 15}건</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-[var(--color-text-muted)]/50 text-center py-4">해당 날짜에 일정이 없습니다.</p>
            )}
          </div>
        )}
      </Card>
    </section>
  );
}
