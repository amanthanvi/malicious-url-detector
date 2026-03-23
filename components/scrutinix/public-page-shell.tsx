import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import { AppFooter } from "@/components/scrutinix/app-footer";
import { AppHeader } from "@/components/scrutinix/app-header";

interface ProofRow {
  label: string;
  value: string;
  body: string;
}

interface PublicPageShellProps {
  eyebrow: string;
  title: string;
  lead: string;
  proofRows: readonly ProofRow[];
  children: ReactNode;
}

export function PublicPageShell({
  eyebrow,
  title,
  lead,
  proofRows,
  children,
}: PublicPageShellProps) {
  return (
    <div className="sx-radar-bg flex min-h-screen flex-col">
      <div className="sx-atmosphere" />
      <AppHeader />

      <main id="main-content" className="relative z-10 flex-1">
        <section className="relative overflow-hidden border-b border-[var(--sx-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--sx-bg-top)_92%,transparent),color-mix(in_srgb,var(--sx-bg)_90%,transparent))]">
          <div
            className="pointer-events-none absolute inset-0 opacity-90"
            aria-hidden="true"
          >
            <div className="absolute inset-x-0 top-0 h-[26rem] bg-[radial-gradient(circle_at_12%_16%,color-mix(in_srgb,var(--sx-accent)_16%,transparent),transparent_42%),radial-gradient(circle_at_82%_10%,color-mix(in_srgb,var(--sx-info)_18%,transparent),transparent_34%)]" />
          </div>

          <div className="relative z-10 mx-auto max-w-[1520px] px-4 pb-8 pt-6 sm:px-6 sm:pb-10 xl:px-8 xl:pt-8">
            <Link
              href="/"
              className="sx-btn-press inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--sx-border)] px-4 py-2.5 text-[11px] font-semibold tracking-[0.16em] text-[var(--sx-text)] uppercase transition-all hover:border-[var(--sx-active-accent)]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to scanner
            </Link>

            <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.75fr)] xl:items-start">
              <div className="space-y-5">
                <p className="text-[11px] tracking-[0.2em] text-[var(--sx-accent)] uppercase">
                  {eyebrow}
                </p>
                <h1 className="sx-font-sans max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-[var(--sx-text)] sm:text-5xl lg:text-6xl">
                  {title}
                </h1>
                <p className="sx-font-sans max-w-3xl text-base leading-8 text-[var(--sx-text-muted)]">
                  {lead}
                </p>
              </div>

              <div className="grid gap-3">
                {proofRows.map((row) => (
                  <div
                    key={row.label}
                    className="rounded-[1.4rem] border border-[var(--sx-border)] bg-[color-mix(in_srgb,var(--sx-surface-strong)_84%,transparent)] px-4 py-4"
                  >
                    <p className="text-[10px] tracking-[0.16em] text-[var(--sx-text-muted)] uppercase">
                      {row.label}
                    </p>
                    <p className="sx-font-sans mt-2 text-xl font-semibold text-[var(--sx-text)]">
                      {row.value}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--sx-text-soft)]">
                      {row.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1520px] px-4 py-8 sm:px-6 xl:px-8 xl:py-10">
          {children}
        </section>
      </main>

      <AppFooter>
        <div className="flex w-full flex-wrap items-center justify-end gap-x-5 gap-y-1 text-[11px] text-[var(--sx-text-muted)]">
          <span>Hash-only logs</span>
          <span className="text-[var(--sx-border-muted)]">/</span>
          <span>Browser-only history</span>
          <span className="text-[var(--sx-border-muted)]">/</span>
          <span>No share database</span>
        </div>
      </AppFooter>
    </div>
  );
}
