"use client";

import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { IconCalendar } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import "react-day-picker/style.css";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  includeTime?: boolean;
  position?: "bottom" | "top";
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "날짜를 선택하세요",
  includeTime,
  position = "bottom",
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState(
    value ? value.slice(11, 16) || "09:00" : "09:00",
  );
  const ref = useRef<HTMLDivElement>(null);

  const selected = value ? new Date(value) : undefined;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleSelect(date: Date | undefined) {
    if (date) {
      if (includeTime) {
        onChange(`${format(date, "yyyy-MM-dd")}T${time}`);
      } else {
        onChange(format(date, "yyyy-MM-dd"));
      }
      if (!includeTime) setOpen(false);
    }
  }

  function handleTimeChange(newTime: string) {
    setTime(newTime);
    if (value) {
      onChange(`${value.slice(0, 10)}T${newTime}`);
    }
  }

  const displayText = value
    ? includeTime
      ? `${value.slice(0, 10)} ${value.slice(11, 16)}`
      : value.slice(0, 10)
    : placeholder;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center gap-2 bg-[var(--color-surface)] shadow-neu-inset-soft rounded-[14px] px-4 py-3 text-sm text-left transition-all duration-[var(--duration-hover)] ease-[var(--ease-neu)]",
          "focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none",
          value ? "text-[var(--color-text)]" : "text-[var(--color-text-faint)]",
        )}
      >
        <IconCalendar
          size={16}
          className="text-[var(--color-text-muted)] shrink-0"
        />
        <span className="tabular-nums">{displayText}</span>
      </button>

      {open && (
        <div
          className={cn(
            "absolute left-0 z-50 bg-[var(--color-surface)] rounded-[20px] shadow-neu-strong p-4",
            position === "top" ? "bottom-full mb-2" : "top-full mt-2",
          )}
        >
          <DayPicker
            mode="single"
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
              today: "ring-1 ring-[var(--color-primary)]/30",
              outside: "text-[var(--color-text-faint)]/30",
            }}
          />
          {includeTime && (
            <div className="border-t border-black/[0.05] pt-3 mt-2 flex items-center gap-2">
              <span className="text-xs text-[var(--color-text-muted)] font-bold">
                시간
              </span>
              <input
                type="time"
                value={time}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="bg-[var(--color-surface)] shadow-neu-inset-soft rounded-[14px] px-3 py-1.5 text-sm text-[var(--color-text)] border-none focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
