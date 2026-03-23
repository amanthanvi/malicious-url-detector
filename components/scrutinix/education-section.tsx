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
      className="sx-panel overflow-hidden rounded-xl border border-border"
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={contentId}
        className="flex w-full items-center justify-between px-5 py-5 text-left"
      >
        <div className="space-y-2">
          <p className="text-xs text-[var(--sx-text-muted)]">
            Method and caveats
          </p>
          <h2
            id="reading-results-heading"
            className="sx-font-sans text-lg font-semibold text-[var(--sx-text)]"
          >
            How scoring and confidence behave
          </h2>
        </div>
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
          <div className="border-t border-border px-5 py-5">
            <div className="grid gap-4">
              <div className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-4">
                <ShieldAlert
                  className="mt-1 h-4 w-4 shrink-0 text-[var(--sx-accent)]"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="text-sm font-medium text-[var(--sx-text)]">
                    Weighted signals first
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--sx-text-muted)]">
                    Safe Browsing, threat feeds, and multi-engine detections
                    outrank passive context like DNS posture or domain age.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-4">
                <Sparkles
                  className="mt-1 h-4 w-4 shrink-0 text-[var(--sx-info)]"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="text-sm font-medium text-[var(--sx-text)]">
                    Summary for triage, full for evidence
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--sx-text-muted)]">
                    Summary surfaces the highest-priority completed lanes. Full
                    keeps every lane, caveat, and not-applicable outcome
                    visible.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-4">
                <Scale
                  className="mt-1 h-4 w-4 shrink-0 text-[var(--sx-suspicious)]"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="text-sm font-medium text-[var(--sx-text)]">
                    Confidence matters
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--sx-text-muted)]">
                    Clean verdicts lose confidence when primary coverage fails,
                    even if no malicious evidence appears in completed signals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
