"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "dark" | "light";

interface ThemeStore {
  theme: Theme;
  toggle: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: "dark",
      toggle: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        set({ theme: next });
        applyTheme(next);
      },
    }),
    { name: "sentinelhub-theme" },
  ),
);

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "light") {
    root.classList.remove("dark");
    root.classList.add("light");
  } else {
    root.classList.remove("light");
    root.classList.add("dark");
  }
}
