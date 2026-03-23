import Link from "next/link";
import { ArrowRight, Lock, ShieldCheck, Workflow } from "lucide-react";
import type { ReactNode } from "react";

interface IntroPanelProps {
  dock?: ReactNode;
}

const trustPillClass =
  "rounded-full border border-[color-mix(in_srgb,var(--sx-border)_88%,transparent)] bg-[color-mix(in_srgb,var(--sx-surface-strong)_84%,transparent)] px-3 py-1.5 text-[10px] font-medium tracking-[0.16em] text-[var(--sx-text-soft)] uppercase";

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
      className="relative overflow-hidden border-b border-[var(--sx-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--sx-bg-top)_92%,transparent),color-mix(in_srgb,var(--sx-bg)_90%,transparent))]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        aria-hidden="true"
      >
        <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_14%_18%,color-mix(in_srgb,var(--sx-accent)_18%,transparent),transparent_44%),radial-gradient(circle_at_78%_8%,color-mix(in_srgb,var(--sx-info)_18%,transparent),transparent_34%),linear-gradient(135deg,color-mix(in_srgb,var(--sx-bg-top)_92%,transparent),transparent_72%)]" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-[linear-gradient(180deg,transparent,color-mix(in_srgb,var(--sx-surface)_36%,transparent))]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1520px] px-4 pb-8 pt-6 sm:px-6 sm:pb-10 xl:px-8 xl:pt-8">
        <div className="grid gap-8 xl:min-h-[calc(100svh-7.25rem)] xl:grid-cols-[minmax(0,0.98fr)_minmax(22rem,0.82fr)] xl:items-center">
          <div className="flex min-w-0 flex-col justify-between gap-8">
            <div className="space-y-6">
              <div className="sx-stage-in flex flex-wrap items-center gap-2" data-delay="0">
                <span className={trustPillClass}>Editorial security lab</span>
                <span className={trustPillClass}>Evidence-first verdicts</span>
                <span className={trustPillClass}>Client-side history</span>
              </div>

              <div className="space-y-5">
                <div className="sx-stage-in space-y-3" data-delay="1">
                  <p className="text-[11px] tracking-[0.22em] text-[var(--sx-accent)] uppercase">
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
                  <p className="sx-font-sans max-w-2xl text-sm leading-7 text-[var(--sx-text-soft)]">
                    Scrutinix keeps the headline verdict grounded in weighted
                    evidence, shows confidence caveats when coverage is limited,
                    and keeps your local history in the browser instead of on a
                    server archive.
                  </p>
                </div>
              </div>

              <div className="sx-stage-in flex flex-wrap gap-3" data-delay="3">
                <a
                  href="#scan-console"
                  className="sx-btn-press sx-font-sans inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--sx-accent)] bg-[var(--sx-accent)] px-5 py-3 text-xs font-semibold tracking-[0.16em] text-[var(--sx-accent-fg)] uppercase transition-all"
                  style={{ color: "var(--sx-accent-fg)" }}
                >
                  Open scanner
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <Link
                  href="/about"
                  className="sx-btn-press sx-font-sans inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--sx-border)] px-5 py-3 text-xs font-semibold tracking-[0.16em] text-[var(--sx-text)] uppercase transition-all hover:border-[var(--sx-active-accent)]"
                >
                  How it works
                </Link>
                <Link
                  href="/privacy"
                  className="sx-btn-press sx-font-sans inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--sx-border)] px-5 py-3 text-xs font-semibold tracking-[0.16em] text-[var(--sx-text)] uppercase transition-all hover:border-[var(--sx-active-accent)]"
                >
                  Privacy
                </Link>
              </div>
            </div>

            <div className="sx-stage-in grid gap-5 border-t border-[var(--sx-border)] pt-6 sm:grid-cols-3" data-delay="4">
              {proofRows.map(({ body, icon: Icon, title }) => (
                <div key={title} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Icon
                      className="h-4 w-4 text-[var(--sx-accent)]"
                      aria-hidden="true"
                    />
                    <h2 className="text-[11px] font-semibold tracking-[0.18em] text-[var(--sx-text)] uppercase">
                      {title}
                    </h2>
                  </div>
                  <p className="sx-font-sans max-w-sm text-sm leading-6 text-[var(--sx-text-soft)]">
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
          className="sx-stage-in mt-8 grid gap-4 border-t border-[var(--sx-border)] pt-6 lg:grid-cols-3"
          data-delay="5"
        >
          {methodRows.map((row) => (
            <div
              key={row.label}
              className="flex flex-col gap-2 border-b border-[color-mix(in_srgb,var(--sx-border)_72%,transparent)] pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-5 last:border-r-0"
            >
              <span className="text-[10px] tracking-[0.16em] text-[var(--sx-text-muted)] uppercase">
                {row.label}
              </span>
              <span className="sx-font-sans text-xl font-semibold text-[var(--sx-text)]">
                {row.value}
              </span>
              <p className="sx-font-sans max-w-sm text-sm leading-6 text-[var(--sx-text-soft)]">
                {row.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
