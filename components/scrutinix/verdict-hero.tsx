"use client";

import { clsx } from "clsx";
import { useId } from "react";

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
    <div className="relative mx-auto h-32 w-32 sm:h-40 sm:w-40">
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
      <div className="absolute inset-0 flex flex-col items-center justify-center">
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
            Awaiting Target Acquisition
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
        style={{ boxShadow: "0 0 20px rgba(0, 230, 57, 0.08)" }}
        aria-label="Scanning URL"
        aria-live="polite"
      >
        <div className="mx-auto max-w-xs text-center">
          <div className="mx-auto mb-3 h-32 w-32">
            <RadarSvg fast />
          </div>
          <p className="sx-pulse text-xs tracking-[0.15em] text-[var(--sx-accent)] uppercase">
            Acquiring Signals...
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
          </div>
        </div>
      )}

      {/* Shared snapshot badge */}
      {!result && sharedSnapshot && (
        <div className="mb-3 text-center">
          <span className="rounded border border-[var(--sx-border)] bg-[var(--sx-surface-elevated)] px-2.5 py-1 text-xs tracking-[0.12em] text-[var(--sx-info)] uppercase">
            Shared Snapshot
          </span>
        </div>
      )}

      {/* URL — left-aligned for readability */}
      <h2 className="truncate text-sm text-[var(--sx-text)]">{displayUrl}</h2>

      {/* Summary — left-aligned */}
      <p className="sx-font-sans mt-2 max-w-2xl text-xs leading-relaxed text-[var(--sx-text-muted)]">
        {summaryText}
      </p>

      {/* Threat reasons */}
      {result?.threatInfo?.reasons?.length ? (
        <div className="sx-font-hack mt-4 space-y-1">
          {result.threatInfo.reasons.slice(0, 6).map((reason, i) => (
            <div
              key={`${i}-${reason}`}
              className="rounded bg-[var(--sx-bg)] px-3 py-1.5 text-xs text-[var(--sx-text)]"
            >
              <span className="mr-1 text-[var(--sx-malicious)]">[!]</span>
              {reason}
            </div>
          ))}
        </div>
      ) : null}

      {/* Metadata — score + confidence visually emphasized */}
      {result && (
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-[var(--sx-text-muted)]">
          <span>
            SCORE:{" "}
            <span className="font-bold" style={{ color }}>
              {result.threatInfo?.score ?? 0}
            </span>
          </span>
          <span>
            CONFIDENCE:{" "}
            <span className="font-bold text-[var(--sx-text)]">
              {((result.threatInfo?.confidence ?? 0) * 100).toFixed(0)}%
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
      )}

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
