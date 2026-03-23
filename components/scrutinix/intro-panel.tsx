import Link from "next/link";
import { ArrowRight, Lock, ShieldCheck, Workflow } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface IntroPanelProps {
  dock?: ReactNode;
}

const proofRows = [
  {
    title: "Weighted evidence",
    body: "Reputation lists and threat feeds outweigh softer context so the verdict follows stronger signals first.",
    icon: ShieldCheck,
  },
  {
    title: "Private by default",
    body: "History persists in IndexedDB only, and shared links are generated in the browser rather than saved server-side.",
    icon: Lock,
  },
  {
    title: "Stream, then inspect",
    body: "The hero starts the scan immediately, while the operational surface below expands into signal-by-signal evidence.",
    icon: Workflow,
  },
] as const;

const methodRows = [
  {
    label: "Coverage",
    value: "8 signals",
    body: "Safe Browsing, community feeds, TLS, redirects, DNS, registration, VirusTotal, and a local ensemble.",
  },
  {
    label: "Delivery",
    value: "NDJSON stream",
    body: "Signals resolve independently, so partial results and failures stay visible instead of collapsing into one opaque error.",
  },
  {
    label: "Retention",
    value: "Browser only",
    body: "Local history stays on-device, while operational logs keep hashes, scan IDs, timings, and verdict classes.",
  },
] as const;

export function IntroPanel({ dock }: IntroPanelProps) {
  return (
    <section
      aria-labelledby="scrutinix-intro-heading"
      className="border-b border-border"
    >
      <div className="relative z-10 mx-auto max-w-[1520px] px-4 py-6 sm:px-6 sm:py-8 xl:px-8">
        <div className="grid gap-8 xl:min-h-[calc(100svh-6.5rem)] xl:grid-cols-[minmax(0,0.98fr)_minmax(22rem,0.82fr)] xl:items-center">
          <div className="flex min-w-0 flex-col justify-between gap-8">
            <div className="space-y-6">
              <div className="sx-stage-in flex items-center gap-2" data-delay="0">
                <span className="inline-flex items-center rounded-md border border-border bg-card px-2.5 py-1 text-[0.65rem] font-medium tracking-[0.08em] text-[var(--sx-text-muted)] uppercase">
                  Public threat analysis
                </span>
                <span className="hidden text-xs text-[var(--sx-text-soft)] sm:inline">
                  Eight signals, streamed live
                </span>
              </div>

              <div className="space-y-5">
                <div className="sx-stage-in space-y-3" data-delay="1">
                  <p className="text-sm font-medium text-[var(--sx-accent)]">
                    Trust the verdict. Inspect the evidence.
                  </p>
                  <h1
                    id="scrutinix-intro-heading"
                    className="sx-font-sans text-5xl font-semibold tracking-[-0.05em] text-[var(--sx-text)] sm:text-6xl lg:text-7xl"
                  >
                    Scrutinix
                  </h1>
                </div>

                <div className="sx-stage-in max-w-3xl space-y-4" data-delay="2">
                  <h2 className="sx-font-sans max-w-3xl text-2xl font-medium leading-tight text-[var(--sx-text)] sm:text-[2rem]">
                    Check any URL against browser-protection lists, community
                    feeds, TLS posture, DNS, redirects, registration data, and
                    a local ML ensemble.
                  </h2>
                  <p className="sx-font-sans max-w-2xl text-base leading-7 text-[var(--sx-text-muted)]">
                    Scrutinix keeps the headline verdict grounded in weighted
                    evidence, shows confidence caveats when coverage is limited,
                    and keeps your local history in the browser instead of on a
                    server archive.
                  </p>
                </div>
              </div>

              <div className="sx-stage-in flex flex-wrap gap-3" data-delay="3">
                <Button asChild variant="terminal" className="h-8 px-3">
                  <a href="#scan-console">
                    Open scanner
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </Button>
                <Button asChild variant="ghost" className="h-8 px-3">
                  <Link href="/about">How it works</Link>
                </Button>
                <Button asChild variant="ghost" className="h-8 px-3">
                  <Link href="/privacy">Privacy</Link>
                </Button>
              </div>
            </div>

            <div className="sx-stage-in grid gap-5 border-t border-border pt-6 sm:grid-cols-3" data-delay="4">
              {proofRows.map(({ body, icon: Icon, title }) => (
                <div key={title} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Icon
                      className="h-4 w-4 text-[var(--sx-accent)]"
                      aria-hidden="true"
                    />
                    <h2 className="text-sm font-medium text-[var(--sx-text)]">
                      {title}
                    </h2>
                  </div>
                  <p className="sx-font-sans max-w-sm text-sm leading-6 text-[var(--sx-text-muted)]">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {dock ? <div className="min-w-0 xl:pl-4">{dock}</div> : null}
        </div>

        <div
          id="method"
          className="sx-stage-in mt-8 grid gap-4 border-t border-border pt-6 lg:grid-cols-3"
          data-delay="5"
        >
          {methodRows.map((row) => (
            <div
              key={row.label}
              className="flex flex-col gap-2 border-b border-border pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-5 last:border-r-0"
            >
              <span className="text-xs text-[var(--sx-text-muted)]">
                {row.label}
              </span>
              <span className="sx-font-sans text-xl font-semibold text-[var(--sx-text)]">
                {row.value}
              </span>
              <p className="sx-font-sans max-w-sm text-sm leading-6 text-[var(--sx-text-muted)]">
                {row.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
