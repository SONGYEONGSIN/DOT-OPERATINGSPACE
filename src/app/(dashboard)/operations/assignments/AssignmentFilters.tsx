"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useRef } from "react";
import { IconSearch, IconX } from "@tabler/icons-react";

export default function AssignmentSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") ?? "";
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  function navigate(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("search", value);
    else params.delete("search");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => navigate(e.target.value), 400);
  }

  function handleClear() {
    if (inputRef.current) inputRef.current.value = "";
    clearTimeout(timerRef.current);
    navigate("");
  }

  return (
    <div className="relative">
      <IconSearch
        size={20}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
      />
      <input
        ref={inputRef}
        type="text"
        defaultValue={currentSearch}
        onChange={handleChange}
        placeholder="대학명 또는 운영자명 입력..."
        className="search-input w-full pl-12 pr-12 py-3 rounded-md text-sm font-mono tracking-wide text-on-surface focus:outline-none transition-colors placeholder:text-on-surface-variant/50"
      />
      {currentSearch && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <IconX size={18} />
        </button>
      )}
    </div>
  );
}
