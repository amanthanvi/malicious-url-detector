import { Shield } from "lucide-react";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/theme-toggle";

interface AppHeaderProps {
  children: ReactNode;
}

export function AppHeader({ children }: AppHeaderProps) {
  return (
    <header className="relative z-10 border-b border-[var(--sx-border)] bg-[var(--sx-surface)]">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-6 xl:px-8">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-[var(--sx-accent)]" />
          <div className="flex flex-col gap-0.5">
            <h1 className="sx-font-sans text-sm font-bold tracking-[0.12em] text-[var(--sx-accent)]">
              SCRUTINIX
            </h1>
            <span className="sx-font-sans text-[10px] tracking-[0.16em] text-[var(--sx-text-muted)] uppercase">
              Multi-signal URL triage
            </span>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          {children}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
