import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Radar, ShieldCheck, Workflow } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About Scrutinix",
  description:
    "How Scrutinix evaluates URLs with streamed multi-signal evidence and confidence scoring.",
};

const sectionLabelClass =
  "text-[11px] tracking-[0.18em] text-[var(--sx-accent)] uppercase";

export default function AboutPage() {
  return (
    <main
      id="main-content"
      className="scrutinix-theme min-h-screen bg-[var(--sx-bg)] px-4 py-6 sm:px-6 xl:px-8"
    >
      <div className="mx-auto max-w-5xl space-y-5">
        <Link
          href="/"
          className="sx-btn-press sx-font-sans inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--sx-border)] px-4 py-2.5 text-xs font-semibold tracking-[0.14em] text-[var(--sx-text)] uppercase transition-all hover:border-[var(--sx-active-accent)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to scanner
        </Link>

        <Card>
          <CardContent className="p-6 sm:p-7">
            <p className={sectionLabelClass}>About Scrutinix</p>
            <h1 className="sx-font-sans mt-3 max-w-3xl text-3xl font-semibold tracking-[0.02em] text-[var(--sx-text)] sm:text-4xl">
              Scrutinix turns link triage into a single streamed evidence view
              instead of a pile of disconnected lookups.
            </h1>
            <p className="sx-font-sans mt-4 max-w-3xl text-base leading-8 text-[var(--sx-text-muted)]">
              A scan combines high-confidence reputation checks with resilient
              local signals so the output stays useful even when one provider is
              degraded. Each signal resolves independently, and the verdict
              confidence explains how much clean or risky coverage actually
              supported the final score.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <ShieldCheck
                className="h-5 w-5 text-[var(--sx-safe)]"
                aria-hidden="true"
              />
              <h2 className="mt-4 text-xs font-semibold tracking-[0.16em] text-[var(--sx-text)] uppercase">
                Weighted evidence
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--sx-text-muted)]">
                Browser-protection lists, community feeds, and multi-engine
                detections outweigh softer context like domain age or redirect
                complexity.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <Workflow
                className="h-5 w-5 text-[var(--sx-info)]"
                aria-hidden="true"
              />
              <h2 className="mt-4 text-xs font-semibold tracking-[0.16em] text-[var(--sx-text)] uppercase">
                Streamed by signal
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--sx-text-muted)]">
                Single scans and batch scans stream NDJSON events so the UI can
                surface partial results, caveats, and progress in real time.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <Radar
                className="h-5 w-5 text-[var(--sx-suspicious)]"
                aria-hidden="true"
              />
              <h2 className="mt-4 text-xs font-semibold tracking-[0.16em] text-[var(--sx-text)] uppercase">
                Confidence, not just score
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--sx-text-muted)]">
                Clean verdicts lose confidence when reputation sources time out,
                and risky verdicts gain confidence when multiple independent
                categories agree.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
