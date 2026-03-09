"use client";

import { clsx } from "clsx";
import { ChevronDown, ShieldAlert, Sparkles } from "lucide-react";
import { useId, useState } from "react";

export function EducationSection() {
  const [open, setOpen] = useState(false);
  const contentId = useId();

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
        <span
          id="reading-results-heading"
          className="text-xs font-semibold tracking-[0.15em] text-[var(--sx-text-muted)] uppercase"
        >
          Reading the results
        </span>
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
          </div>
        </div>
      </div>
    </section>
  );
}
