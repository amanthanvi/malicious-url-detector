import Link from "next/link";
import { Lock, ShieldCheck, Workflow } from "lucide-react";
import type { ReactNode } from "react";

import { EducationSection } from "@/components/scrutinix/education-section";
import { Button } from "@/components/ui/button";

interface IntroPanelProps {
  dock?: ReactNode;
}

const supportRows = [
  {
    title: "Weighted evidence",
    body: "High-signal reputation sources outrank softer context so the verdict stays conservative.",
    icon: ShieldCheck,
    href: "/about",
    cta: "How scoring works",
  },
  {
    title: "Browser-only history",
    body: "Saved scans stay on-device unless you choose to export or share them.",
    icon: Lock,
    href: "/privacy",
    cta: "Privacy details",
  },
  {
    title: "Batch stays isolated",
    body: "Queue short lists now, then open any finished row in the single-scan surface.",
    icon: Workflow,
    href: "/#scan-console",
    cta: "Open the console",
  },
] as const;

export function IntroPanel({ dock }: IntroPanelProps) {
  return (
    <section
      aria-labelledby="scrutinix-intro-heading"
      className="border-b border-border"
    >
      <div className="relative z-10 mx-auto max-w-[1520px] px-4 py-5 sm:px-6 sm:py-6 xl:px-8 xl:py-8">
        <div className="sx-home-hero grid gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.72fr)] lg:items-start">
          {dock ? <div className="order-1 min-w-0">{dock}</div> : null}

          <div className="order-2 min-w-0 lg:pl-2">
            <div className="sx-home-brand sx-stage-in space-y-4" data-delay="0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-md border border-border bg-card px-2.5 py-1 text-[0.65rem] font-medium tracking-[0.08em] text-[var(--sx-text-muted)] uppercase">
                  Public threat analysis
                </span>
                <span className="hidden text-xs text-[var(--sx-text-soft)] sm:inline">
                  Eight streamed signals
                </span>
              </div>

              <div className="space-y-2">
                <h1
                  id="scrutinix-intro-heading"
                  className="sx-font-sans text-4xl font-semibold tracking-[-0.05em] text-[var(--sx-text)] sm:text-5xl lg:text-6xl"
                >
                  Scrutinix
                </h1>
                <p className="sx-font-sans max-w-xl text-xl leading-tight font-medium text-[var(--sx-text)] sm:text-2xl">
                  Scan suspicious links without leaving the dashboard.
                </p>
              </div>

              <p className="sx-home-secondary-copy sx-font-sans max-w-xl text-sm leading-6 text-[var(--sx-text-muted)] sm:text-base">
                Eight streamed signals, short-batch triage, local history, and
                export or share controls when you need them.
              </p>

              <div className="flex flex-wrap gap-2">
                <Button asChild variant="ghost" className="h-8 px-3">
                  <Link href="/about">How scoring works</Link>
                </Button>
                <Button asChild variant="ghost" className="h-8 px-3">
                  <Link href="/privacy">Privacy</Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--sx-text-soft)]">
                <span>8 signals</span>
                <span>Batch max 10</span>
                <span>Browser-only history</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeSupportSection() {
  return (
    <section
      aria-labelledby="home-support-heading"
      className="border-t border-border pt-8"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs text-[var(--sx-text-muted)]">
              Support and method
            </p>
            <h2
              id="home-support-heading"
              className="sx-font-sans text-2xl font-semibold text-[var(--sx-text)]"
            >
              Keep the live surface lean. Open the caveats when you need them.
            </h2>
            <p className="sx-font-sans max-w-2xl text-sm leading-6 text-[var(--sx-text-muted)]">
              Method notes and privacy details stay here and on the dedicated
              docs pages instead of crowding the scanner.
            </p>
          </div>

          <EducationSection />
        </div>

        <div className="grid gap-3">
          {supportRows.map(({ body, cta, href, icon: Icon, title }) => (
            <div
              key={title}
              className="sx-panel rounded-xl border border-border px-5 py-5"
            >
              <div className="flex items-start gap-3">
                <Icon
                  className="mt-1 h-4 w-4 shrink-0 text-[var(--sx-accent)]"
                  aria-hidden="true"
                />
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-[var(--sx-text)]">
                    {title}
                  </h3>
                  <p className="sx-font-sans text-sm leading-6 text-[var(--sx-text-muted)]">
                    {body}
                  </p>
                  <Button asChild variant="ghost" size="sm" className="h-7 px-2.5">
                    <Link href={href}>{cta}</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
