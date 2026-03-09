import Link from "next/link";
import { ArrowRight, Lock, Radar, ShieldCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const trustPillClass =
  "rounded-full border border-[var(--sx-border)] bg-[color-mix(in_srgb,var(--sx-surface-elevated)_72%,transparent)] px-3 py-1 text-[11px] tracking-[0.14em] text-[var(--sx-text-muted)] uppercase";

export function IntroPanel() {
  return (
    <section
      aria-labelledby="scrutinix-intro-heading"
      className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]"
    >
      <Card className="overflow-hidden">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className={trustPillClass}>Real-time URL triage</span>
            <span className={trustPillClass}>8 independent signals</span>
            <span className={trustPillClass}>
              History stays in your browser
            </span>
          </div>

          <div className="mt-4 max-w-3xl space-y-3">
            <p className="text-[11px] tracking-[0.18em] text-[var(--sx-accent)] uppercase">
              Trust the verdict, inspect the evidence
            </p>
            <h2
              id="scrutinix-intro-heading"
              className="sx-font-sans max-w-3xl text-3xl font-semibold tracking-[0.02em] text-[var(--sx-text)] sm:text-4xl"
            >
              Check any URL against browser-protection lists, community feeds,
              DNS, TLS, redirects, registration data, and a local ML ensemble in
              one streamed report.
            </h2>
            <p className="sx-font-sans max-w-2xl text-sm leading-7 text-[var(--sx-text-muted)] sm:text-base">
              Scrutinix is built for fast link triage: the headline verdict is
              backed by per-signal evidence, confidence explanations, and clear
              caveats when coverage is limited instead of overstating certainty.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href="#scan-console"
              className="sx-btn-press sx-font-sans inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--sx-accent)] bg-[var(--sx-accent)] px-4 py-2.5 text-xs font-semibold tracking-[0.14em] text-[var(--sx-accent-fg)] uppercase transition-all"
              style={{ color: "var(--sx-accent-fg)" }}
            >
              Open scanner
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <Link
              href="/about"
              className="sx-btn-press sx-font-sans inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--sx-border)] px-4 py-2.5 text-xs font-semibold tracking-[0.14em] text-[var(--sx-text)] uppercase transition-all hover:border-[var(--sx-active-accent)]"
            >
              How it works
            </Link>
            <Link
              href="/privacy"
              className="sx-btn-press sx-font-sans inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--sx-border)] px-4 py-2.5 text-xs font-semibold tracking-[0.14em] text-[var(--sx-text)] uppercase transition-all hover:border-[var(--sx-active-accent)]"
            >
              Privacy
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck
                className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sx-safe)]"
                aria-hidden="true"
              />
              <div>
                <h3 className="text-xs font-semibold tracking-[0.16em] text-[var(--sx-text)] uppercase">
                  Reputation first
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--sx-text-muted)]">
                  Google Safe Browsing, VirusTotal, URLhaus, and OpenPhish carry
                  more weight than passive context.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Radar
                className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sx-info)]"
                aria-hidden="true"
              />
              <div>
                <h3 className="text-xs font-semibold tracking-[0.16em] text-[var(--sx-text)] uppercase">
                  Streamed evidence
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--sx-text-muted)]">
                  Signals resolve independently so you can see what completed,
                  what failed, and why the confidence moved.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lock
                className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sx-suspicious)]"
                aria-hidden="true"
              />
              <div>
                <h3 className="text-xs font-semibold tracking-[0.16em] text-[var(--sx-text)] uppercase">
                  Privacy posture
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--sx-text-muted)]">
                  IndexedDB history is client-side only, share links are
                  generated in the browser, and server logs store hashes and
                  timings rather than raw URLs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
