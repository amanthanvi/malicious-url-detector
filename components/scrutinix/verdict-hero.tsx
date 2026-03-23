"use client";

import { clsx } from "clsx";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { threatScoreBandLabel } from "@/lib/domain/score-bands";
import { formatDisplayUrl } from "@/lib/domain/url";
import type { AnalysisResult } from "@/lib/domain/types";
import {
  verdictColor,
  type SharedSnapshot,
} from "@/components/shared/scrutinix-types";

interface VerdictHeroProps {
  result: AnalysisResult | null;
  isStreaming: boolean;
  streamUrl: string;
  sharedSnapshot: SharedSnapshot | null;
  completedSignals?: number;
  onRunSharedScan?: () => void;
}

function verdictScore(result: AnalysisResult): number {
  return result.threatInfo?.score ?? 0;
}

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function VerdictHero({
  result,
  isStreaming,
  streamUrl,
  sharedSnapshot,
  completedSignals = 0,
  onRunSharedScan,
}: VerdictHeroProps) {
  const isMalicious =
    result?.verdict === "malicious" || result?.verdict === "critical";
  const sharedVerdict = sharedSnapshot?.verdict ?? null;

  if (!result && !isStreaming && !sharedSnapshot) {
    return (
      <section
        className="sx-panel rounded-[2rem] border border-dashed border-[var(--sx-border-muted)] px-6 py-8 sm:px-8"
        aria-label="Awaiting target URL"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
          <div className="space-y-4">
            <p className="text-[11px] tracking-[0.2em] text-[var(--sx-text-muted)] uppercase">
              Awaiting target
            </p>
            <h2 className="sx-font-sans max-w-2xl text-3xl font-semibold tracking-[-0.03em] text-[var(--sx-text)]">
              Run a link to open the evidence surface.
            </h2>
            <p className="sx-font-sans max-w-2xl text-sm leading-7 text-[var(--sx-text-muted)] sm:text-base">
              The verdict area stays calm until a scan starts. Once the stream
              begins, this section becomes the main reading surface for score,
              confidence, caveats, and next actions.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-[var(--sx-text-soft)]">
            <div className="rounded-[1.4rem] border border-[var(--sx-border)] bg-[color-mix(in_srgb,var(--sx-surface-strong)_82%,transparent)] px-4 py-4">
              <p className="text-[10px] tracking-[0.16em] text-[var(--sx-text-muted)] uppercase">
                Readiness
              </p>
              <p className="sx-font-sans mt-2 text-lg font-semibold text-[var(--sx-text)]">
                Idle until a URL is submitted
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-[var(--sx-border)] bg-[color-mix(in_srgb,var(--sx-surface)_72%,transparent)] px-4 py-4">
              <p className="text-[10px] tracking-[0.16em] text-[var(--sx-text-muted)] uppercase">
                Signal coverage
              </p>
              <p className="mt-2 leading-6">
                Signals arrive independently, then the cards below sort into
                summary or full evidence mode.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (isStreaming && !result) {
    const displayUrl = formatDisplayUrl(streamUrl);
    const progress = Math.min(100, Math.max(0, (completedSignals / 8) * 100));

    return (
      <section
        className="sx-panel sx-scan-line rounded-[2rem] border border-[var(--sx-accent)] px-6 py-6 sm:px-8"
        aria-label="Scanning URL"
        aria-live="polite"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
          <div className="space-y-4">
            <p className="sx-pulse text-[11px] tracking-[0.18em] text-[var(--sx-accent)] uppercase">
              Stream in progress
            </p>
            <h2 className="truncate sx-font-sans text-2xl font-semibold text-[var(--sx-text)] sm:text-3xl">
              {displayUrl}
            </h2>
            <p className="sx-font-sans max-w-2xl text-sm leading-7 text-[var(--sx-text-muted)]">
              Signals are resolving independently. The working surface below
              will fill as each provider completes, errors, or marks itself
              not-applicable.
            </p>
            <div className="max-w-xl">
              <div className="flex items-center justify-between gap-3 text-[11px] tracking-[0.14em] text-[var(--sx-text-muted)] uppercase">
                <span>Signal coverage</span>
                <span>{completedSignals}/8 complete</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[var(--sx-border)]">
                <div
                  className="sx-threat-fill h-full rounded-full bg-[var(--sx-accent)] transition-[width] duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--sx-border)] bg-[color-mix(in_srgb,var(--sx-surface-strong)_84%,transparent)] px-5 py-5">
            <p className="text-[10px] tracking-[0.16em] text-[var(--sx-text-muted)] uppercase">
              Live status
            </p>
            <p className="sx-font-sans mt-3 text-4xl font-semibold text-[var(--sx-text)]">
              {completedSignals}
              <span className="ml-1 text-lg text-[var(--sx-text-soft)]">/8</span>
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--sx-text-soft)]">
              Completed signals now. The verdict will settle once enough
              weighted evidence is available.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const color = result ? verdictColor(result.verdict) : "var(--sx-accent)";
  const score = result ? verdictScore(result) : 0;
  const displayUrl = result
    ? formatDisplayUrl(result.url)
    : sharedSnapshot
      ? formatDisplayUrl(sharedSnapshot.url)
      : formatDisplayUrl(streamUrl);
  const summaryText =
    result?.threatInfo?.summary ??
    sharedSnapshot?.summary ??
    "Signal cards will populate independently as each provider finishes.";
  const threatInfo = result?.threatInfo ?? null;
  const failedSignals = result
    ? Object.values(result.signals).filter(
        (signal) => signal.status === "error",
      ).length
    : 0;
  const skippedSignals = result
    ? Object.values(result.signals).filter(
        (signal) => signal.status === "skipped",
      ).length
    : 0;
  const completedSignalCount = result
    ? Object.values(result.signals).filter(
        (signal) => signal.status !== "pending",
      ).length
    : completedSignals;
  const evidenceReasons =
    threatInfo?.hasPositiveEvidence && threatInfo?.reasons
      ? threatInfo.reasons
      : [];
  const confidenceLabel = threatInfo
    ? threatInfo.confidenceLabel.toUpperCase()
    : "LOW";
  const confidenceReasons = threatInfo?.confidenceReasons ?? [];
  const recommendations = threatInfo?.recommendations ?? [];
  const limitations = threatInfo?.limitations ?? [];
  const confidenceValue = threatInfo?.confidence ?? 1;
  const showLimitedCoverage = Boolean(result?.metadata.partialFailure);
  const showProvisionalSafe =
    result?.verdict === "safe" && confidenceValue < 0.5;
  const coverageCallout =
    showLimitedCoverage || showProvisionalSafe
      ? {
          title:
            showLimitedCoverage && showProvisionalSafe
              ? "Limited coverage and low confidence"
              : showProvisionalSafe
                ? "Provisional safe verdict"
                : "Limited coverage",
          body:
            showLimitedCoverage && showProvisionalSafe
              ? `This verdict is based on ${completedSignalCount}/8 completed signals. ${failedSignals > 0 ? `${failedSignals} failed` : "No signals failed"}${skippedSignals > 0 ? ` and ${skippedSignals} were not applicable` : ""}. The completed signals did not show direct malicious indicators, but the confidence is still low enough that this result should not be treated as a clean bill of health.`
              : showProvisionalSafe
                ? "The completed signals did not show direct malicious indicators, but the confidence is low enough that this result should not be treated as a clean bill of health."
                : `This verdict is based on ${completedSignalCount}/8 completed signals. ${failedSignals > 0 ? `${failedSignals} failed` : "No signals failed"}${skippedSignals > 0 ? ` and ${skippedSignals} were not applicable` : ""}.`,
        }
      : null;

  return (
    <section
      className={clsx(
        "sx-panel rounded-[2rem] border p-6 transition-all duration-200 sm:p-8",
        isMalicious
          ? "border-[var(--sx-malicious)]"
          : "border-[var(--sx-border)]",
      )}
      aria-label={`Scan result: ${result?.verdict ?? sharedVerdict ?? "pending"}`}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.72fr)]">
        <div className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[var(--sx-border)] bg-[color-mix(in_srgb,var(--sx-surface-strong)_84%,transparent)] px-3 py-1 text-[10px] tracking-[0.16em] text-[var(--sx-text-muted)] uppercase">
                  {result ? "Live result" : "Shared snapshot"}
                </span>
                {result ? (
                  <span
                    className="rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.16em] uppercase"
                    style={{
                      color,
                      backgroundColor: `color-mix(in_srgb, ${color} 12%, transparent)`,
                    }}
                  >
                    {result.verdict}
                  </span>
                ) : sharedVerdict ? (
                  <span
                    className="rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.16em] uppercase"
                    style={{
                      color: verdictColor(sharedVerdict),
                      backgroundColor: `color-mix(in_srgb, ${verdictColor(sharedVerdict)} 12%, transparent)`,
                    }}
                  >
                    {sharedVerdict}
                  </span>
                ) : null}
                {result ? (
                  <span className="text-[10px] tracking-[0.16em] text-[var(--sx-text-muted)] uppercase">
                    {threatScoreBandLabel(score)}
                  </span>
                ) : null}
              </div>

              <h2 className="sx-font-sans break-all text-2xl font-semibold tracking-[-0.03em] text-[var(--sx-text)] sm:text-3xl">
                {displayUrl}
              </h2>
            </div>

            {!result && onRunSharedScan ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRunSharedScan}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Run fresh scan
              </Button>
            ) : null}
          </div>

          {!result && sharedSnapshot ? (
            <div className="rounded-[1.4rem] border border-[var(--sx-border)] bg-[color-mix(in_srgb,var(--sx-surface)_74%,transparent)] px-4 py-4 text-sm leading-6 text-[var(--sx-text-soft)]">
              This snapshot is client-shared state. Run a fresh scan to verify
              the verdict against current provider results.
            </div>
          ) : null}

          <p className="sx-font-sans max-w-3xl text-base leading-8 text-[var(--sx-text-muted)]">
            {summaryText}
          </p>

          {coverageCallout ? (
            <div className="rounded-[1.5rem] border border-[var(--sx-suspicious)] bg-[color-mix(in_srgb,var(--sx-suspicious)_10%,transparent)] px-4 py-4">
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sx-suspicious)]"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--sx-suspicious)] uppercase">
                    {coverageCallout.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--sx-text-soft)]">
                    {coverageCallout.body}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {evidenceReasons.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-[11px] tracking-[0.16em] text-[var(--sx-text-muted)] uppercase">
                Why this verdict
              </h3>
              <div className="grid gap-3">
                {evidenceReasons.slice(0, 6).map((reason, index) => (
                  <div
                    key={`${index}-${reason}`}
                    className="rounded-[1.35rem] border border-[var(--sx-border)] bg-[color-mix(in_srgb,var(--sx-surface-strong)_82%,transparent)] px-4 py-3"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <p className="text-sm leading-6 text-[var(--sx-text)]">
                        {reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : result ? (
            <div className="rounded-[1.35rem] border border-[var(--sx-border)] bg-[color-mix(in_srgb,var(--sx-surface-strong)_76%,transparent)] px-4 py-4 text-sm leading-6 text-[var(--sx-text-soft)]">
              <CheckCircle2
                className="mr-2 inline h-4 w-4 align-[-2px] text-[var(--sx-safe)]"
                aria-hidden="true"
              />
              No direct malicious indicators were found in the completed
              signals.
            </div>
          ) : null}

          {(recommendations.length > 0 || limitations.length > 0) && (
            <div className="grid gap-4 lg:grid-cols-2">
              {recommendations.length > 0 ? (
                <div className="rounded-[1.4rem] border border-[var(--sx-border)] bg-[color-mix(in_srgb,var(--sx-surface)_74%,transparent)] px-4 py-4">
                  <h3 className="text-[11px] tracking-[0.16em] text-[var(--sx-text-muted)] uppercase">
                    Recommended next steps
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {recommendations.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm leading-6 text-[var(--sx-text)]"
                      >
                        <ShieldAlert
                          className="mt-1 h-4 w-4 shrink-0 text-[var(--sx-info)]"
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {limitations.length > 0 ? (
                <div className="rounded-[1.4rem] border border-[var(--sx-border)] bg-[color-mix(in_srgb,var(--sx-surface)_74%,transparent)] px-4 py-4">
                  <h3 className="text-[11px] tracking-[0.16em] text-[var(--sx-text-muted)] uppercase">
                    Signal caveats
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {limitations.slice(0, 4).map((item, index) => (
                      <li
                        key={`${index}-${item}`}
                        className="text-sm leading-6 text-[var(--sx-text-soft)]"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          {result ? (
            <div className="rounded-[1.6rem] border border-[var(--sx-border)] bg-[color-mix(in_srgb,var(--sx-surface-strong)_88%,transparent)] px-5 py-5">
              <p className="text-[10px] tracking-[0.16em] text-[var(--sx-text-muted)] uppercase">
                Threat score
              </p>
              <p
                className="sx-font-sans mt-3 text-6xl font-semibold leading-none"
                style={{ color }}
              >
                {score}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--sx-text-soft)]">
                {threatScoreBandLabel(score)}
              </p>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[var(--sx-border)]">
                <div
                  className="sx-threat-fill h-full rounded-full transition-[width] duration-500"
                  style={{
                    width: `${Math.min(Math.max(score, 0), 100)}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-[1.6rem] border border-[var(--sx-border)] bg-[color-mix(in_srgb,var(--sx-surface-strong)_88%,transparent)] px-5 py-5">
              <p className="text-[10px] tracking-[0.16em] text-[var(--sx-text-muted)] uppercase">
                Shared verdict
              </p>
              <p
                className="sx-font-sans mt-3 text-3xl font-semibold uppercase"
                style={{ color }}
              >
                {sharedVerdict}
              </p>
              {sharedSnapshot ? (
                <p className="mt-2 text-sm leading-6 text-[var(--sx-text-soft)]">
                  Captured {formatTimestamp(sharedSnapshot.capturedAt)}.
                </p>
              ) : null}
            </div>
          )}

          {result ? (
            <div className="rounded-[1.5rem] border border-[var(--sx-border)] bg-[color-mix(in_srgb,var(--sx-surface)_74%,transparent)] px-5 py-5">
              <p className="text-[10px] tracking-[0.16em] text-[var(--sx-text-muted)] uppercase">
                Confidence
              </p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <p className="sx-font-sans text-2xl font-semibold text-[var(--sx-text)]">
                  {confidenceLabel}
                </p>
                <p className="sx-font-hack text-sm text-[var(--sx-text-soft)]">
                  {Math.round(confidenceValue * 100)}%
                </p>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[var(--sx-border)]">
                <div
                  className="h-full rounded-full transition-[width] duration-300"
                  style={{
                    width: `${Math.round(confidenceValue * 100)}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
              {confidenceReasons.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {confidenceReasons.slice(0, 4).map((reason) => (
                    <li
                      key={reason}
                      className="text-sm leading-6 text-[var(--sx-text-soft)]"
                    >
                      {reason}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          {result ? (
            <div className="rounded-[1.5rem] border border-[var(--sx-border)] bg-[color-mix(in_srgb,var(--sx-surface)_74%,transparent)] px-5 py-5">
              <p className="text-[10px] tracking-[0.16em] text-[var(--sx-text-muted)] uppercase">
                Scan metadata
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <div>
                  <p className="text-[10px] tracking-[0.14em] text-[var(--sx-text-muted)] uppercase">
                    Coverage
                  </p>
                  <p className="sx-font-sans mt-1 text-lg font-semibold text-[var(--sx-text)]">
                    {completedSignalCount}/8 signals
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.14em] text-[var(--sx-text-muted)] uppercase">
                    Duration
                  </p>
                  <p className="sx-font-hack mt-1 text-sm text-[var(--sx-text)]">
                    {result.metadata.durationMs}ms
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.14em] text-[var(--sx-text-muted)] uppercase">
                    Completed
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--sx-text-soft)]">
                    {formatTimestamp(result.metadata.completedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.14em] text-[var(--sx-text-muted)] uppercase">
                    Evidence balance
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--sx-text-soft)]">
                    {threatInfo?.hasPositiveEvidence
                      ? "Direct risk indicators influenced the final score."
                      : "No direct malicious indicators across completed signals."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-[var(--sx-border)] bg-[color-mix(in_srgb,var(--sx-surface)_74%,transparent)] px-5 py-5">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sx-info)]"
                  aria-hidden="true"
                />
                <p className="text-sm leading-6 text-[var(--sx-text-soft)]">
                  Shared links embed a browser-generated snapshot only. They do
                  not rely on a server-side share store.
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
