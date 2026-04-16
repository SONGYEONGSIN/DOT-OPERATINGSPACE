"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

interface YearFilterProps {
  years: number[];
}

export default function YearFilter({ years }: YearFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentYear = searchParams.get("year") ?? "";

  function handleChange(year: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (year) params.set("year", year);
    else params.delete("year");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-1 bg-[var(--color-surface)] rounded-[20px] p-1 w-fit">
      <button
        type="button"
        onClick={() => handleChange("")}
        className={cn(
          "px-3.5 py-1.5 rounded-[14px] text-xs font-bold tracking-wide transition-all",
          !currentYear ? "bg-primary text-on-primary" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]",
        )}
      >
        전체
      </button>
      {years.map((y) => (
        <button
          key={y}
          type="button"
          onClick={() => handleChange(String(y))}
          className={cn(
            "px-3.5 py-1.5 rounded-[14px] text-xs font-bold tracking-wide transition-all",
            currentYear === String(y) ? "bg-primary text-on-primary" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]",
          )}
        >
          {y}년
        </button>
      ))}
    </div>
  );
}
