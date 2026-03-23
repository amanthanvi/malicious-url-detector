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
      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--sx-border)] bg-[color-mix(in_srgb,var(--sx-surface-strong)_88%,transparent)]">
        <Shield className="h-5 w-5 text-[var(--sx-accent)]" />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="sx-font-sans text-sm font-semibold tracking-[0.2em] text-[var(--sx-text)] uppercase">
          Scrutinix
        </span>
        <span className="sx-font-sans text-[10px] tracking-[0.16em] text-[var(--sx-text-muted)] uppercase">
          Public threat analysis
        </span>
      </span>
    </>
  );

  return (
    <header className="relative z-20 border-b border-[var(--sx-border)] bg-[color-mix(in_srgb,var(--sx-surface)_80%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1520px] flex-wrap items-center gap-4 px-4 py-4 sm:px-6 xl:px-8">
        <div className="flex min-w-0 items-center gap-4">
          {isHome ? (
            <div
              className="flex items-center gap-3 rounded-full text-left"
              aria-label="Scrutinix"
            >
              {brand}
            </div>
          ) : (
            <Link
              href="/"
              className="sx-btn-press flex items-center gap-3 rounded-full text-left"
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
                className="sx-btn-press rounded-full px-3 py-2 text-[10px] font-semibold tracking-[0.16em] text-[var(--sx-text-muted)] uppercase transition-colors hover:text-[var(--sx-text)]"
              >
                Scanner
              </Link>
              <Link
                href="/about"
                className="sx-btn-press rounded-full px-3 py-2 text-[10px] font-semibold tracking-[0.16em] text-[var(--sx-text-muted)] uppercase transition-colors hover:text-[var(--sx-text)]"
              >
                Method
              </Link>
              <Link
                href="/privacy"
                className="sx-btn-press rounded-full px-3 py-2 text-[10px] font-semibold tracking-[0.16em] text-[var(--sx-text-muted)] uppercase transition-colors hover:text-[var(--sx-text)]"
              >
                Privacy
              </Link>
            </nav>
          ) : null}
        </div>

        <div className="ml-auto flex flex-1 items-center justify-end gap-3">
          {children ? (
            <div className="hidden min-w-0 flex-1 justify-end xl:flex">
              {children}
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <span className="hidden text-[10px] tracking-[0.16em] text-[var(--sx-text-muted)] uppercase sm:inline">
              Multi-signal URL triage
            </span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
