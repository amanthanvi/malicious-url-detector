"use client";

import { Moon, Radar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";

export function SiteHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[color:var(--surface-overlay)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--accent)] text-[color:var(--accent-foreground)] shadow-[0_16px_40px_-22px_rgba(25,66,57,0.75)]">
            <Radar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs tracking-[0.28em] text-[color:var(--muted-foreground)] uppercase">
              Malicious URL Detector
            </p>
            <p className="text-base font-semibold text-[color:var(--foreground)]">
              Streaming threat intelligence for suspicious links
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium text-[color:var(--foreground)] shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <SunMedium className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          Theme
        </button>
      </div>
    </header>
  );
}
