"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";

interface AppHeaderProps {
  children?: ReactNode;
}

export function AppHeader({ children }: AppHeaderProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const brand = (
    <>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card">
        <Shield className="h-4.5 w-4.5 text-[var(--sx-accent)]" />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="sx-font-sans text-sm font-semibold text-[var(--sx-text)]">
          Scrutinix
        </span>
        <span className="sx-font-sans text-xs text-[var(--sx-text-muted)]">
          Public threat analysis
        </span>
      </span>
    </>
  );

  return (
    <header className="relative z-20 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1520px] flex-wrap items-center gap-4 px-4 py-4 sm:px-6 xl:px-8">
        <div className="flex min-w-0 items-center gap-4">
          {isHome ? (
            <div
              className="flex items-center gap-3 rounded-md text-left"
              aria-label="Scrutinix"
            >
              {brand}
            </div>
          ) : (
            <Link
              href="/"
              className="sx-btn-press flex items-center gap-3 rounded-md text-left"
            >
              {brand}
            </Link>
          )}

          {!isHome ? (
            <nav
              aria-label="Primary"
              className="hidden items-center gap-1 md:flex"
            >
              <Link
                href="/"
                className="sx-btn-press rounded-md px-2.5 py-1.5 text-sm text-[var(--sx-text-muted)] transition-colors hover:bg-muted hover:text-[var(--sx-text)]"
              >
                Scanner
              </Link>
              <Link
                href="/about"
                className="sx-btn-press rounded-md px-2.5 py-1.5 text-sm text-[var(--sx-text-muted)] transition-colors hover:bg-muted hover:text-[var(--sx-text)]"
              >
                Method
              </Link>
              <Link
                href="/privacy"
                className="sx-btn-press rounded-md px-2.5 py-1.5 text-sm text-[var(--sx-text-muted)] transition-colors hover:bg-muted hover:text-[var(--sx-text)]"
              >
                Privacy
              </Link>
            </nav>
          ) : null}
        </div>

        <div className="ml-auto flex flex-1 items-center justify-end gap-3">
          {children ? (
            <div className="hidden min-w-0 flex-1 justify-end lg:flex">
              {children}
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-[var(--sx-text-muted)] sm:inline">
              Multi-signal URL triage
            </span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
