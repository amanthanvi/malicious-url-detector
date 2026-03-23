import Link from "next/link";
import type { ReactNode } from "react";

interface AppFooterProps {
  children: ReactNode;
}

export function AppFooter({ children }: AppFooterProps) {
  return (
    <footer className="relative z-10 border-t border-[var(--sx-border)] bg-[color-mix(in_srgb,var(--sx-surface)_82%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1520px] flex-col gap-3 px-4 py-4 sm:px-6 xl:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="sx-font-sans text-[11px] font-semibold tracking-[0.18em] text-[var(--sx-text)] uppercase">
              Scrutinix
            </span>
            <span className="hidden text-[10px] text-[var(--sx-text-soft)] sm:inline">
              Multi-signal URL triage
            </span>
            <Link
              href="/about"
              className="text-[10px] tracking-[0.16em] text-[var(--sx-text-muted)] uppercase transition-colors hover:text-[var(--sx-text)]"
            >
              About
            </Link>
            <Link
              href="/privacy"
              className="text-[10px] tracking-[0.16em] text-[var(--sx-text-muted)] uppercase transition-colors hover:text-[var(--sx-text)]"
            >
              Policy
            </Link>
          </div>

          <div className="min-w-0 flex-1 overflow-hidden text-xs text-[var(--sx-text-muted)] lg:text-right">
            {children}
          </div>
        </div>
      </div>
    </footer>
  );
}
