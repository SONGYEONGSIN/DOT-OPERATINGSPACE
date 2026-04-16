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
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
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

  const displayText =
    startDate && endDate
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
          "w-full flex items-center gap-2 bg-[var(--color-surface)] shadow-neu-inset-soft rounded-[14px] px-4 py-3 text-sm text-left transition-all duration-[var(--duration-hover)] ease-[var(--ease-neu)]",
          "focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none",
          startDate
            ? "text-[var(--color-text)]"
            : "text-[var(--color-text-faint)]",
        )}
      >
        <IconCalendar
          size={16}
          className="text-[var(--color-text-muted)] shrink-0"
        />
        <span className="tabular-nums">{displayText}</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 bg-[var(--color-surface)] rounded-[20px] shadow-neu-strong p-4">
          <DayPicker
            mode="range"
            selected={selected}
            onSelect={handleSelect}
            locale={ko}
            showOutsideDays
            classNames={{
              root: "rdp-custom relative",
              months: "flex gap-4",
              month_caption:
                "flex items-center justify-center py-2 text-sm font-bold text-[var(--color-text)] h-9",
              nav: "absolute top-px inset-x-0 flex items-center justify-between px-0 z-10 h-9",
              button_previous:
                "flex items-center justify-center w-9 h-9 rounded-[14px] text-[var(--color-text)] hover:shadow-neu-inset-soft transition-all duration-[var(--duration-hover)] ease-[var(--ease-neu)] [&>svg]:!w-[18px] [&>svg]:!h-[18px]",
              button_next:
                "flex items-center justify-center w-9 h-9 rounded-[14px] text-[var(--color-text)] hover:shadow-neu-inset-soft transition-all duration-[var(--duration-hover)] ease-[var(--ease-neu)] [&>svg]:!w-[18px] [&>svg]:!h-[18px]",
              weekdays: "flex mt-1",
              weekday:
                "w-10 text-center text-[10px] font-bold text-[var(--color-text-faint)] uppercase py-2",
              week: "flex",
              day: "w-10 h-10 flex items-center justify-center text-sm rounded-[14px] transition-all duration-[var(--duration-press)] ease-[var(--ease-neu)]",
              day_button:
                "w-full h-full rounded-[14px] hover:shadow-neu-inset-soft text-[var(--color-text)] cursor-pointer",
              selected:
                "!bg-[var(--color-primary)] !text-white font-bold !rounded-[14px]",
              range_middle:
                "!bg-[var(--color-primary)]/15 !text-[var(--color-text)] rounded-none",
              range_start:
                "!bg-[var(--color-primary)] !text-white rounded-l-[14px] rounded-r-none",
              range_end:
                "!bg-[var(--color-primary)] !text-white rounded-r-[14px] rounded-l-none",
              today: "ring-1 ring-[var(--color-primary)]/30",
              outside: "text-[var(--color-text-faint)]/30",
              disabled: "text-[var(--color-text-faint)]/20 cursor-not-allowed",
            }}
            numberOfMonths={1}
          />
        </div>
      )}
    </div>
  );
}
