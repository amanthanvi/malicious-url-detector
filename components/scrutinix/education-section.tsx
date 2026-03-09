"use client";

import { clsx } from "clsx";
import { ChevronDown, Scale, ShieldAlert, Sparkles } from "lucide-react";
import { useState } from "react";

const contentId = "reading-results-content";

export function EducationSection() {
  const [open, setOpen] = useState(false);

  return (
    <section
      aria-labelledby="reading-results-heading"
      className="overflow-hidden rounded border border-[var(--sx-border)] bg-[var(--sx-surface)]"
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={contentId}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <h2
          id="reading-results-heading"
          className="text-xs font-semibold tracking-[0.15em] text-[var(--sx-text-muted)] uppercase"
        >
          Reading the results
        </h2>
        <ChevronDown
          className={clsx(
            "h-4 w-4 text-[var(--sx-text-muted)] transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        className={clsx(
          "grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div
          id={contentId}
          aria-hidden={!open}
          className="min-h-0 overflow-hidden"
        >
          <div className="sx-font-sans space-y-3 px-4 pb-4">
            <p className="text-sm font-semibold text-[var(--sx-text)]">
              Summary mode for triage. Full report for evidence.
            </p>
            <div className="rounded border-l-2 border-[var(--sx-accent)] bg-[var(--sx-bg)] px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--sx-text)]">
                <ShieldAlert className="h-3.5 w-3.5 text-[var(--sx-accent)]" />
                High-confidence indicators
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--sx-text-muted)]">
                Safe Browsing, threat feeds, and multi-engine detections
                outweigh cosmetic signals.
              </p>
            </div>
            <div className="rounded border-l-2 border-[var(--sx-info)] bg-[var(--sx-bg)] px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--sx-text)]">
                <Sparkles className="h-3.5 w-3.5 text-[var(--sx-info)]" />
                Local-only resilience
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--sx-text-muted)]">
                DNS, TLS, redirect chain, and registration data still provide
                value even when third-party APIs are unavailable.
              </p>
            </div>
            <div className="rounded border-l-2 border-[var(--sx-suspicious)] bg-[var(--sx-bg)] px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--sx-text)]">
                <Scale className="h-3.5 w-3.5 text-[var(--sx-suspicious)]" />
                How signals are weighted
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--sx-text-muted)]">
                Reputation feeds and browser-protection lists outweigh passive
                context like DNS or registration age, while partial failures
                lower verdict confidence even when the headline verdict stays
                safe.
              </p>
            </div>
            <div className="rounded border-l-2 border-[var(--sx-safe)] bg-[var(--sx-bg)] px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--sx-text)]">
                <ShieldAlert className="h-3.5 w-3.5 text-[var(--sx-safe)]" />
                Reading the interface
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--sx-text-muted)]">
                Summary mode shows the highest-priority completed signals for
                fast triage, while Full shows every signal. Left-edge accents
                and LED colors mark state: green means clear, amber means review
                or caveat, magenta/red means stronger evidence, and muted gray
                means not applicable.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--sx-text-muted)]">
                Threat score bands are 0-24 safe, 25-54 suspicious, 55-79
                malicious, and 80-100 critical. Confidence explains how much
                coverage and agreement supported that verdict.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
