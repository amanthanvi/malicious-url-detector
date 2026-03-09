import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Database, Fingerprint, Share2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Scrutinix Privacy",
  description:
    "What Scrutinix stores locally, what the server processes, and how shared links work.",
};

const sectionLabelClass =
  "text-[11px] tracking-[0.18em] text-[var(--sx-accent)] uppercase";

export default function PrivacyPage() {
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
            <p className={sectionLabelClass}>Privacy posture</p>
            <h1 className="sx-font-sans mt-3 max-w-3xl text-3xl font-semibold tracking-[0.02em] text-[var(--sx-text)] sm:text-4xl">
              Scrutinix keeps history in the browser and avoids storing raw URLs
              in server logs.
            </h1>
            <p className="sx-font-sans mt-4 max-w-3xl text-base leading-8 text-[var(--sx-text-muted)]">
              The server still has to process submitted URLs to query providers
              and complete a live analysis, but the application is designed so
              your saved history and shareable snapshots remain client-side.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <Database
                className="h-5 w-5 text-[var(--sx-safe)]"
                aria-hidden="true"
              />
              <h2 className="mt-4 text-xs font-semibold tracking-[0.16em] text-[var(--sx-text)] uppercase">
                Local history
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--sx-text-muted)]">
                Scan history is stored in IndexedDB on your device only.
                Clearing it removes that local archive unless you use the
                immediate undo.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <Fingerprint
                className="h-5 w-5 text-[var(--sx-info)]"
                aria-hidden="true"
              />
              <h2 className="mt-4 text-xs font-semibold tracking-[0.16em] text-[var(--sx-text)] uppercase">
                Server logging
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--sx-text-muted)]">
                Operational logs store scan identifiers, timing, cache state,
                and hashed URL context rather than the original raw URL string.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <Share2
                className="h-5 w-5 text-[var(--sx-suspicious)]"
                aria-hidden="true"
              />
              <h2 className="mt-4 text-xs font-semibold tracking-[0.16em] text-[var(--sx-text)] uppercase">
                Shared links
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--sx-text-muted)]">
                Share links embed a small client-generated snapshot in the URL.
                They are not persisted to a server-side share database.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
