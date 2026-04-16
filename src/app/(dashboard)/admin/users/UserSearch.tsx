"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { IconSearch } from "@tabler/icons-react";

export default function UserSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") ?? "");

  function handleSearch(query: string) {
    setValue(query);
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("search", query);
    } else {
      params.delete("search");
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="relative">
      <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
      <input
        type="text"
        value={value}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="이름 또는 이메일 검색..."
        className="w-64 bg-[var(--color-surface)] border-none rounded-[14px] pl-9 pr-4 py-2 text-sm text-[var(--color-text)] placeholder:text-outline focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all"
      />
    </div>
  );
}
