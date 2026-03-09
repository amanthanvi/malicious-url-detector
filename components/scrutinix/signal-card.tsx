"use client";

import { clsx } from "clsx";
import { motion } from "framer-motion";
import { memo } from "react";

import {
  signalLabels,
  getSignalSummary,
  getSignalDetailEntries,
} from "@/components/shared/signal-utils";
import {
  getSignalSeverity,
  getLedColorFromSeverity,
  getEdgeClassFromSeverity,
} from "@/components/shared/scrutinix-types";
import type {
  SignalName,
  SignalResults,
  RedirectData,
  SSLData,
  WhoisData,
  ThreatFeedsData,
} from "@/lib/domain/types";

interface SignalCardProps {
  name: SignalName;
  result: SignalResults[SignalName];
  viewMode: "summary" | "full";
  isStreaming?: boolean;
  onRetry?: () => void;
  index?: number;
}

function renderRichDetails(name: SignalName, data: unknown): React.ReactNode {
  if (name === "redirectChain") {
    const d = data as RedirectData;
    if (d.hops.length === 0) return null;
    return (
      <ol className="sx-font-hack mt-2 list-inside list-decimal space-y-0.5">
        {d.hops.map((hop) => (
          <li
            key={`${hop.url}-${hop.status}`}
            className="rounded bg-[var(--sx-bg)] px-2 py-1 text-xs text-[var(--sx-text)]"
          >
            <span className="mr-1 text-[var(--sx-info)]">{hop.status}</span>
            <span className="truncate">{hop.url}</span>
            {hop.location && (
              <span className="text-[var(--sx-text-muted)]">
                {" "}
                → {hop.location}
              </span>
            )}
          </li>
        ))}
      </ol>
    );
  }

  if (name === "ssl" || name === "whois") {
    const entries =
      name === "ssl"
        ? [
            { label: "Issuer", value: (data as SSLData).issuer ?? "Unknown" },
            { label: "Subject", value: (data as SSLData).subject ?? "Unknown" },
            {
              label: "Valid from",
              value: (data as SSLData).validFrom
                ? new Date((data as SSLData).validFrom!).toLocaleDateString()
                : "Unknown",
            },
            {
              label: "Valid to",
              value: (data as SSLData).validTo
                ? new Date((data as SSLData).validTo!).toLocaleDateString()
                : "Unknown",
            },
          ]
        : [
            {
              label: "Registrar",
              value: (data as WhoisData).registrar ?? "Unknown",
            },
            {
              label: "Country",
              value: (data as WhoisData).country ?? "Unknown",
            },
            {
              label: "Registered",
              value: (data as WhoisData).registeredAt
                ? new Date(
                    (data as WhoisData).registeredAt!,
                  ).toLocaleDateString()
                : "Unknown",
            },
            {
              label: "Expires",
              value: (data as WhoisData).expiresAt
                ? new Date((data as WhoisData).expiresAt!).toLocaleDateString()
                : "Unknown",
            },
          ];
    return (
      <div className="sx-font-hack mt-2 grid grid-cols-2 gap-1">
        {entries.map((e) => (
          <div
            key={e.label}
            className="rounded bg-[var(--sx-bg)] px-2 py-1 text-xs"
          >
            <span className="text-[var(--sx-text-muted)]">{e.label}: </span>
            <span className="text-[var(--sx-text)]">{e.value}</span>
          </div>
        ))}
      </div>
    );
  }

  if (name === "threatFeeds") {
    const d = data as ThreatFeedsData;
    if (d.matches.length === 0) return null;
    return (
      <div className="sx-font-hack mt-2 space-y-0.5">
        {d.matches.map((m) => (
          <div
            key={`${m.feed}-${m.matchedUrl}`}
            className="rounded bg-[var(--sx-bg)] px-2 py-1 text-xs"
          >
            <span className="font-semibold text-[var(--sx-text)]">
              {m.feed}
            </span>
            <span className="ml-1 text-[var(--sx-text-muted)]">{m.detail}</span>
          </div>
        ))}
      </div>
    );
  }

  const entries = getSignalDetailEntries(name, data as never);
  if (entries.length === 0) return null;
  return (
    <div className="sx-font-hack mt-2 space-y-0.5">
      {entries.map((entry) => (
        <div
          key={entry.label}
          className="flex gap-2 rounded bg-[var(--sx-bg)] px-2 py-1 text-xs"
        >
          <span className="shrink-0 text-[var(--sx-text-muted)]">
            {entry.label}:
          </span>
          <span className="truncate text-[var(--sx-text)]">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };

function SignalCardInner({
  name,
  result,
  viewMode,
  isStreaming = false,
  onRetry,
  index = 0,
}: SignalCardProps) {
  const severity = getSignalSeverity(result.status, result.data, name);
  const edgeClass = getEdgeClassFromSeverity(severity);
  const ledColor = getLedColorFromSeverity(severity);
  const isPending = result.status === "pending";
  const isError = result.status === "error";
  const isSuccess = result.status === "success";
  const isActivelyScanning = isPending && isStreaming;

  return (
    <motion.article
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      exit={{ scaleX: 0, opacity: 0 }}
      transition={{ ...SPRING, delay: index * 0.06 }}
      style={{ transformOrigin: "left" }}
      className={clsx(
        "rounded border border-[var(--sx-border)] bg-[var(--sx-surface)] px-4 py-3 transition-all",
        edgeClass,
        isActivelyScanning && "sx-pending-scan",
        "hover:border-[var(--sx-accent)]/40 hover:shadow-[0_0_8px_var(--sx-ring-safe)]",
      )}
      aria-label={`${signalLabels[name]} signal: ${result.status}`}
    >
      {/* LED + Name + Duration */}
      <div className="flex items-center gap-2">
        <span
          className={clsx(
            "sx-led",
            isActivelyScanning && "sx-led-pulse",
            isError && "sx-led-pulse",
          )}
          style={{ backgroundColor: ledColor, color: ledColor }}
          aria-hidden="true"
        />
        <span className="flex-1 text-xs font-semibold tracking-[0.08em] text-[var(--sx-text)] uppercase">
          {signalLabels[name]}
        </span>
        {result.durationMs > 0 && (
          <span className="shrink-0 text-xs text-[var(--sx-info)]">
            {result.durationMs}ms
          </span>
        )}
      </div>

      {/* Status + Summary */}
      <div className="mt-1.5">
        {isPending && isStreaming && (
          <span className="sx-pulse text-xs tracking-[0.1em] text-[var(--sx-suspicious)] uppercase">
            SCANNING
          </span>
        )}
        {isPending && !isStreaming && (
          <span className="text-xs tracking-[0.1em] text-[var(--sx-text-muted)] uppercase">
            IDLE
          </span>
        )}
        {isError && (
          <div className="flex items-center gap-2">
            <span className="flex-1 truncate text-xs text-[var(--sx-malicious)]">
              {result.error}
            </span>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="sx-btn-press shrink-0 text-xs font-semibold tracking-[0.1em] text-[var(--sx-accent)] uppercase hover:underline"
              >
                RETRY
              </button>
            )}
          </div>
        )}
        {isSuccess && result.data && (
          <p className="line-clamp-2 text-xs leading-relaxed text-[var(--sx-text-muted)]">
            {getSignalSummary(name, result.data)}
          </p>
        )}
      </div>

      {viewMode === "full" &&
        isSuccess &&
        result.data &&
        renderRichDetails(name, result.data)}
    </motion.article>
  );
}

export const SignalCard = memo(SignalCardInner, (prev, next) => {
  return (
    prev.name === next.name &&
    prev.result === next.result &&
    prev.viewMode === next.viewMode &&
    prev.isStreaming === next.isStreaming &&
    prev.index === next.index
  );
});
