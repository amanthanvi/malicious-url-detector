"use client";

import { clsx } from "clsx";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { useId } from "react";

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

function scoreArcOffset(score: number): number {
  const clamped = Math.min(Math.max(score, 0), 100);
  const circumference = 283;
  return circumference - (clamped / 100) * circumference;
}

function RadarSvg({ fast }: { fast: boolean }) {
  const gradId = useId();
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      <circle
        cx="100"
        cy="100"
        r="30"
        fill="none"
        stroke="var(--sx-accent)"
        strokeWidth="0.5"
        opacity="0.3"
        className="sx-radar-ring"
      />
      <circle
        cx="100"
        cy="100"
        r="60"
        fill="none"
        stroke="var(--sx-accent)"
        strokeWidth="0.5"
        opacity="0.25"
        className="sx-radar-ring"
      />
      <circle
        cx="100"
        cy="100"
        r="90"
        fill="none"
        stroke="var(--sx-accent)"
        strokeWidth="0.5"
        opacity="0.2"
        className="sx-radar-ring"
      />
      <line
        x1="100"
        y1="10"
        x2="100"
        y2="190"
        stroke="var(--sx-accent)"
        strokeWidth="0.3"
        opacity="0.15"
      />
      <line
        x1="10"
        y1="100"
        x2="190"
        y2="100"
        stroke="var(--sx-accent)"
        strokeWidth="0.3"
        opacity="0.15"
      />
      <line
        x1="100"
        y1="100"
        x2="100"
        y2="10"
        stroke="var(--sx-accent)"
        strokeWidth="1.5"
        opacity="0.6"
        className={fast ? "sx-radar-sweep-fast" : "sx-radar-sweep-line"}
      />
      <path
        d="M100,100 L100,10 A90,90 0 0,1 163,37 Z"
        fill={`url(#${gradId})`}
        className={fast ? "sx-radar-sweep-fast" : "sx-radar-sweep-line"}
      />
      <defs>
        <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--sx-accent)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--sx-accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="3" fill="var(--sx-accent)" opacity="0.6" />
    </svg>
  );
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const dashOffset = scoreArcOffset(score);
  return (
    <div className="relative mx-auto h-36 w-36 sm:h-40 sm:w-40">
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="var(--sx-border)"
          strokeWidth="4"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="283"
          strokeDashoffset={dashOffset}
          style={{
            transition: "stroke-dashoffset 600ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        aria-live="polite"
        role="status"
      >
        <span className="text-xs tracking-[0.2em] text-[var(--sx-text-muted)] uppercase">
          Threat Score
        </span>
        <span
          className="text-6xl leading-none font-bold transition-transform duration-300 sm:text-7xl"
          style={{ color }}
        >
          {score}
        </span>
      </div>
    </div>
  );
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

  /* Empty State: Radar */
  if (!result && !isStreaming && !sharedSnapshot) {
    return (
      <section
        className="rounded border border-dashed border-[var(--sx-border-muted)] bg-[var(--sx-surface)] px-6 py-8"
        aria-label="Awaiting target URL"
      >
        <div className="mx-auto max-w-xs text-center">
          <div className="mx-auto mb-4 h-40 w-40">
            <RadarSvg fast={false} />
          </div>
          <p className="sx-pulse text-sm tracking-[0.2em] text-[var(--sx-accent)] uppercase">
            Awaiting URL
          </p>
          <p className="mt-2 text-xs leading-relaxed text-[var(--sx-text-muted)]">
            Submit a URL to stream a multi-signal threat report. Signals arrive
            independently as each provider resolves.
          </p>
        </div>
      </section>
    );
  }

  /* Streaming State */
  if (isStreaming && !result) {
    const displayUrl = formatDisplayUrl(streamUrl);
    return (
      <section
        className="sx-scan-line rounded border border-[var(--sx-accent)] bg-[var(--sx-surface)] px-6 py-6 transition-opacity duration-200"
        style={{
          boxShadow:
            "0 0 20px color-mix(in srgb, var(--sx-active-accent) 16%, transparent)",
        }}
        aria-label="Scanning URL"
        aria-live="polite"
      >
        <div className="mx-auto max-w-xs text-center">
          <div className="mx-auto mb-3 h-32 w-32">
            <RadarSvg fast />
          </div>
          <p className="sx-pulse text-xs tracking-[0.15em] text-[var(--sx-accent)] uppercase">
            Resolving signals...
          </p>
          <p className="mt-2 truncate text-sm text-[var(--sx-text)]">
            {displayUrl}
          </p>
          <p className="mt-1 text-xs text-[var(--sx-text-muted)]">
            SIGNALS: {completedSignals}/8 ACQUIRED
          </p>
        </div>
      </section>
    );
  }

  /* Result / Shared Snapshot State */
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
        "rounded border bg-[var(--sx-surface)] p-5 transition-all duration-200",
        isMalicious
          ? "border-[var(--sx-malicious)]"
          : "border-[var(--sx-border)]",
      )}
      style={
        isMalicious
          ? { boxShadow: "0 0 30px rgba(255, 0, 128, 0.1)" }
          : undefined
      }
      aria-label={`Scan result: ${result?.verdict ?? sharedSnapshot?.verdict ?? "pending"}`}
    >
      {result && (
        <div className="mb-4">
          <ScoreRing score={score} color={color} />
          <div className="mt-3 text-center">
            <span
              className="inline-block rounded px-4 py-1.5 text-lg font-black tracking-[0.2em] uppercase"
              style={{
                color,
                backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
              }}
            >
              {result.verdict}
            </span>
            <p className="mt-2 text-[11px] tracking-[0.16em] text-[var(--sx-text-muted)] uppercase">
              {threatScoreBandLabel(score)}
            </p>
          </div>
        </div>
      )}

      {/* Shared snapshot badge */}
      {!result && sharedSnapshot && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <span className="inline-block rounded border border-[var(--sx-border)] bg-[var(--sx-surface-elevated)] px-2.5 py-1 text-xs tracking-[0.12em] text-[var(--sx-info)] uppercase">
              Shared Snapshot
            </span>
            <p className="text-xs text-[var(--sx-text-muted)]">
              This snapshot is unverified client-shared state. Run a fresh scan
              to confirm the result.
            </p>
          </div>
          {onRunSharedScan && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRunSharedScan}
            >
              <ExternalLink className="h-3 w-3" />
              Run Full Scan
            </Button>
          )}
        </div>
      )}

      {/* URL — left-aligned for readability */}
      <h2 className="truncate text-sm text-[var(--sx-text)]">{displayUrl}</h2>

      {/* Summary — left-aligned */}
      <p className="sx-font-sans mt-2 max-w-2xl text-xs leading-relaxed text-[var(--sx-text-muted)]">
        {summaryText}
      </p>

      {coverageCallout && (
        <div className="mt-4 rounded-lg border border-[var(--sx-suspicious)] bg-[color-mix(in_srgb,var(--sx-suspicious)_10%,transparent)] px-3 py-3 text-xs text-[var(--sx-text)]">
          <div className="flex items-start gap-2">
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sx-suspicious)]"
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold tracking-[0.12em] text-[var(--sx-suspicious)] uppercase">
                {coverageCallout.title}
              </p>
              <p className="mt-1 leading-relaxed text-[var(--sx-text-muted)]">
                {coverageCallout.body}
              </p>
            </div>
          </div>
        </div>
      )}

      {evidenceReasons.length > 0 ? (
        <div className="mt-4 space-y-2">
          <h3 className="text-[11px] tracking-[0.16em] text-[var(--sx-text-muted)] uppercase">
            Why this verdict
          </h3>
          <div className="sx-font-hack space-y-1">
            {evidenceReasons.slice(0, 6).map((reason, i) => (
              <div
                key={`${i}-${reason}`}
                className="rounded bg-[var(--sx-bg)] px-3 py-1.5 text-xs text-[var(--sx-text)]"
              >
                <span className="inline-flex items-start gap-2">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span>{reason}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : result ? (
        <div className="mt-4 rounded bg-[var(--sx-bg)] px-3 py-2 text-xs text-[var(--sx-text-muted)]">
          <CheckCircle2
            className="mr-2 inline h-3.5 w-3.5 align-[-2px] text-[var(--sx-safe)]"
            aria-hidden="true"
          />
          No direct malicious indicators were found in the completed signals.
        </div>
      ) : null}

      {limitations.length ? (
        <div className="mt-4 space-y-2">
          <h3 className="text-[11px] tracking-[0.16em] text-[var(--sx-text-muted)] uppercase">
            Signal caveats
          </h3>
          {limitations.slice(0, 4).map((item, index) => (
            <div
              key={`${index}-${item}`}
              className="rounded border border-[var(--sx-border)] bg-[var(--sx-bg)] px-3 py-2 text-xs text-[var(--sx-text-muted)]"
            >
              {item}
            </div>
          ))}
        </div>
      ) : null}

      {/* Metadata — score + confidence visually emphasized */}
      {result && (
        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="rounded border border-[var(--sx-border)] bg-[var(--sx-bg)] px-3 py-3">
            <h3 className="text-[11px] tracking-[0.16em] text-[var(--sx-text-muted)] uppercase">
              Verdict confidence
            </h3>
            <p className="mt-1 text-sm font-semibold text-[var(--sx-text)]">
              {confidenceLabel}{" "}
              <span className="text-[var(--sx-text-muted)]">
                ({((threatInfo?.confidence ?? 0) * 100).toFixed(0)}%)
              </span>
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--sx-border)]">
              <div
                className="h-full rounded-full transition-[width] duration-300"
                style={{
                  width: `${Math.round(confidenceValue * 100)}%`,
                  backgroundColor: color,
                }}
              />
            </div>
            <ul className="mt-2 space-y-1 text-xs leading-relaxed text-[var(--sx-text-muted)]">
              {confidenceReasons.slice(0, 4).map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
          <div className="rounded border border-[var(--sx-border)] bg-[var(--sx-bg)] px-3 py-3 text-xs text-[var(--sx-text-muted)]">
            <h3 className="text-[11px] tracking-[0.16em] uppercase">
              Scan metadata
            </h3>
            <div className="mt-2 flex flex-wrap gap-3">
              <span>
                SIGNALS:{" "}
                <span className="text-[var(--sx-text)]">
                  {completedSignalCount}/8
                </span>
              </span>
              <span>
                DURATION:{" "}
                <span className="text-[var(--sx-text)]">
                  {result.metadata.durationMs}ms
                </span>
              </span>
              <span>
                COMPLETED:{" "}
                <span className="text-[var(--sx-text)]">
                  {new Date(result.metadata.completedAt).toLocaleString()}
                </span>
              </span>
            </div>
          </div>
        </div>
      )}

      {recommendations.length ? (
        <div className="mt-4 rounded border border-[var(--sx-border)] bg-[var(--sx-bg)] px-3 py-3">
          <h3 className="text-[11px] tracking-[0.16em] text-[var(--sx-text-muted)] uppercase">
            Recommended next steps
          </h3>
          <ul className="mt-2 space-y-1 text-xs leading-relaxed text-[var(--sx-text)]">
            {recommendations.map((item) => (
              <li key={item}>
                <ShieldAlert
                  className="mr-2 inline h-3.5 w-3.5 align-[-2px] text-[var(--sx-info)]"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Shared snapshot metadata */}
      {!result && sharedSnapshot && (
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-[var(--sx-text-muted)]">
          <span>
            VERDICT:{" "}
            <span
              className="uppercase"
              style={{ color: verdictColor(sharedSnapshot.verdict) }}
            >
              {sharedSnapshot.verdict}
            </span>
          </span>
          <span>
            CAPTURED:{" "}
            <span className="text-[var(--sx-text)]">
              {new Date(sharedSnapshot.capturedAt).toLocaleString()}
            </span>
          </span>
        </div>
      )}
    </section>
  );
}
