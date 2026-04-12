"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { IconFilter } from "@tabler/icons-react";

interface CategoryFilterProps {
  categories: string[];
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = searchParams.get("category") ?? "";

  const handleChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("category", value);
      } else {
        params.delete("category");
      }
      params.delete("page");
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="relative flex items-center gap-1.5">
      <IconFilter size={14} className="text-on-surface-variant" />
      <select
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        className="appearance-none bg-surface-container-high rounded-lg px-3 py-1.5 pr-6 text-xs font-bold text-on-surface-variant tracking-wide focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
      >
        <option value="">전체 분류</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}
