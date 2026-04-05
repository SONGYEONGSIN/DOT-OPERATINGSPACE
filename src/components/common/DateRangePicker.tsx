"use client";

import { useState, useRef, useEffect } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { IconCalendar } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import "react-day-picker/style.css";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChangeStart: (date: string) => void;
  onChangeEnd: (date: string) => void;
  placeholder?: string;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onChangeStart,
  onChangeEnd,
  placeholder = "기간을 선택하세요",
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected: DateRange = {
    from: startDate ? new Date(startDate) : undefined,
    to: endDate ? new Date(endDate) : undefined,
  };

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleSelect(range: DateRange | undefined) {
    if (range?.from) onChangeStart(format(range.from, "yyyy-MM-dd"));
    else onChangeStart("");
    if (range?.to) onChangeEnd(format(range.to, "yyyy-MM-dd"));
    else onChangeEnd("");

    // 시작일과 종료일 모두 선택되면 닫기
    if (range?.from && range?.to) {
      setTimeout(() => setOpen(false), 200);
    }
  }

  const displayText = startDate && endDate
    ? `${startDate} → ${endDate}`
    : startDate
      ? `${startDate} →`
      : placeholder;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center gap-2 bg-surface-container-highest rounded-lg px-4 py-3 text-sm text-left transition-colors",
          "focus:ring-1 focus:ring-primary/50 focus:outline-none",
          startDate ? "text-on-surface" : "text-on-surface-variant/50",
        )}
      >
        <IconCalendar size={16} className="text-on-surface-variant shrink-0" />
        <span className="tabular-nums">{displayText}</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 bg-surface-container rounded-xl border border-outline-variant/15 shadow-2xl p-4">
          <DayPicker
            mode="range"
            selected={selected}
            onSelect={handleSelect}
            locale={ko}
            showOutsideDays
            classNames={{
              root: "rdp-custom relative",
              months: "flex gap-4",
              month_caption: "flex items-center justify-center py-2 text-sm font-bold text-on-surface h-9",
              nav: "absolute top-px inset-x-0 flex items-center justify-between px-0 z-10 h-9",
              button_previous: "flex items-center justify-center w-9 h-9 rounded-lg text-on-surface hover:bg-surface-container-high transition-colors [&>svg]:!w-[18px] [&>svg]:!h-[18px] [&>svg]:!fill-on-surface [&>svg]:!text-on-surface",
              button_next: "flex items-center justify-center w-9 h-9 rounded-lg text-on-surface hover:bg-surface-container-high transition-colors [&>svg]:!w-[18px] [&>svg]:!h-[18px] [&>svg]:!fill-on-surface [&>svg]:!text-on-surface",
              weekdays: "flex mt-1",
              weekday: "w-10 text-center text-[10px] font-bold text-on-surface-variant uppercase py-2",
              week: "flex",
              day: "w-10 h-10 flex items-center justify-center text-sm rounded-lg transition-colors",
              day_button: "w-full h-full rounded-lg hover:bg-surface-container-high text-on-surface cursor-pointer",
              selected: "!bg-primary !text-on-primary font-bold",
              range_middle: "!bg-primary/15 !text-on-surface rounded-none",
              range_start: "!bg-primary !text-on-primary rounded-l-lg rounded-r-none",
              range_end: "!bg-primary !text-on-primary rounded-r-lg rounded-l-none",
              today: "ring-1 ring-primary/30",
              outside: "text-on-surface-variant/30",
              disabled: "text-on-surface-variant/20 cursor-not-allowed",
            }}
            numberOfMonths={1}
          />
        </div>
      )}
    </div>
  );
}
