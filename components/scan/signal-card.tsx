"use client";

import { AlertTriangle, CheckCircle2, Clock3, RotateCcw } from "lucide-react";

import { StatusPill } from "@/components/shared/status-pill";
import type {
  DNSData,
  GoogleSafeBrowsingData,
  MLSignalData,
  RedirectData,
  SignalName,
  SignalPayloadMap,
  SignalResults,
  SSLData,
  ThreatFeedsData,
  VirusTotalData,
  WhoisData,
} from "@/lib/domain/types";

interface SignalCardProps {
  name: SignalName;
  result: SignalResults[SignalName];
  viewMode: "summary" | "full";
  onRetry?: () => void;
}

const signalLabels: Record<SignalName, string> = {
  virusTotal: "VirusTotal",
  mlEnsemble: "ML Ensemble",
  googleSafeBrowsing: "Google Safe Browsing",
  threatFeeds: "Threat Feeds",
  ssl: "TLS Certificate",
  whois: "Domain Registration",
  dns: "DNS Profile",
  redirectChain: "Redirect Chain",
};

export function SignalCard({
  name,
  result,
  viewMode,
  onRetry,
}: SignalCardProps) {
  const statusTone =
    result.status === "success"
      ? "safe"
      : result.status === "error"
        ? "error"
        : "neutral";

  return (
    <article className="rounded-[28px] border border-black/10 bg-[color:var(--card)] p-5 shadow-[0_20px_60px_-48px_rgba(16,24,40,0.8)] dark:border-white/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.22em] text-[color:var(--muted-foreground)] uppercase">
            {signalLabels[name]}
          </p>
          <div className="mt-3 flex items-center gap-3">
            {result.status === "pending" && (
              <Clock3 className="h-4 w-4 text-[color:var(--muted-foreground)]" />
            )}
            {result.status === "success" && (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            )}
            {result.status === "error" && (
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            )}
            <StatusPill tone={statusTone}>
              {result.status === "pending" ? "Pending" : result.status}
            </StatusPill>
          </div>
        </div>
        {result.status === "error" && onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-2 text-xs font-semibold tracking-[0.16em] text-[color:var(--foreground)] uppercase transition hover:-translate-y-0.5 dark:border-white/10"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Retry
          </button>
        ) : null}
      </div>

      <div className="mt-4 text-sm text-[color:var(--foreground)]">
        {result.status === "pending" && (
          <div className="space-y-3">
            <div className="h-3 w-3/4 rounded-full bg-black/10 dark:bg-white/10" />
            <div className="h-3 w-full rounded-full bg-black/5 dark:bg-white/5" />
            <div className="h-3 w-2/3 rounded-full bg-black/5 dark:bg-white/5" />
          </div>
        )}
        {result.status === "error" && <p>{result.error}</p>}
        {result.status === "success" && result.data && (
          <div className="space-y-3">
            <p className="text-[color:var(--muted-foreground)]">
              {summarizeSignal(name, result.data)}
            </p>
            {viewMode === "full"
              ? renderSignalDetails(name, result.data)
              : null}
          </div>
        )}
      </div>

      <p className="mt-4 text-xs tracking-[0.18em] text-[color:var(--muted-foreground)] uppercase">
        {result.durationMs}ms
      </p>
    </article>
  );
}

function summarizeSignal(name: SignalName, data: SignalPayloadMap[SignalName]) {
  switch (name) {
    case "virusTotal":
      return summarizeVirusTotal(data as VirusTotalData);
    case "mlEnsemble":
      return summarizeMlEnsemble(data as MLSignalData);
    case "googleSafeBrowsing":
      return summarizeGoogleSafeBrowsing(data as GoogleSafeBrowsingData);
    case "threatFeeds":
      return summarizeThreatFeeds(data as ThreatFeedsData);
    case "ssl":
      return summarizeSsl(data as SSLData);
    case "whois":
      return summarizeWhois(data as WhoisData);
    case "dns":
      return summarizeDns(data as DNSData);
    case "redirectChain":
      return summarizeRedirectChain(data as RedirectData);
    default:
      return "Signal complete.";
  }
}

function renderSignalDetails(
  name: SignalName,
  data: SignalPayloadMap[SignalName],
) {
  switch (name) {
    case "virusTotal":
      return (
        <ul className="space-y-2 text-sm text-[color:var(--muted-foreground)]">
          {(data as VirusTotalData).results.slice(0, 5).map((result) => (
            <li
              key={result.engine}
              className="flex justify-between gap-3 rounded-2xl bg-black/[0.03] px-3 py-2 dark:bg-white/[0.04]"
            >
              <span>{result.engine}</span>
              <span>{result.result ?? result.category}</span>
            </li>
          ))}
        </ul>
      );
    case "mlEnsemble":
      return (
        <div className="space-y-2 text-sm text-[color:var(--muted-foreground)]">
          <p>
            Lexical model:{" "}
            {((data as MLSignalData).lexicalModel.score * 100).toFixed(0)}%
          </p>
          {(data as MLSignalData).hostedModel ? (
            <p>
              Hosted model:{" "}
              {(((data as MLSignalData).hostedModel?.score ?? 0) * 100).toFixed(
                0,
              )}
              %
            </p>
          ) : null}
          {(data as MLSignalData).warnings.length ? (
            <p>Warnings: {(data as MLSignalData).warnings.join(" ")}</p>
          ) : null}
        </div>
      );
    case "googleSafeBrowsing":
      return (
        <ul className="space-y-2 text-sm text-[color:var(--muted-foreground)]">
          {(data as GoogleSafeBrowsingData).matches.map((match) => (
            <li
              key={`${match.threatType}-${match.platformType}`}
              className="rounded-2xl bg-black/[0.03] px-3 py-2 dark:bg-white/[0.04]"
            >
              {match.threatType} / {match.platformType} /{" "}
              {match.threatEntryType}
            </li>
          ))}
        </ul>
      );
    case "threatFeeds":
      return (
        <div className="space-y-2 text-sm text-[color:var(--muted-foreground)]">
          {(data as ThreatFeedsData).matches.map((match) => (
            <div
              key={`${match.feed}-${match.matchedUrl}`}
              className="rounded-2xl bg-black/[0.03] px-3 py-2 dark:bg-white/[0.04]"
            >
              <p className="font-medium text-[color:var(--foreground)]">
                {match.feed}
              </p>
              <p>{match.detail}</p>
            </div>
          ))}
          {(data as ThreatFeedsData).warnings.length ? (
            <p>Warnings: {(data as ThreatFeedsData).warnings.join(" ")}</p>
          ) : null}
        </div>
      );
    case "ssl":
      return renderSslDetails(data as SSLData);
    case "whois":
      return renderWhoisDetails(data as WhoisData);
    case "dns":
      return renderDnsDetails(data as DNSData);
    case "redirectChain":
      return renderRedirectDetails(data as RedirectData);
    default:
      return null;
  }
}

function summarizeVirusTotal(data: VirusTotalData) {
  return `${data.malicious} malicious and ${data.suspicious} suspicious engines across the last analysis run.`;
}

function summarizeMlEnsemble(data: MLSignalData) {
  return `Consensus verdict: ${data.consensusLabel} at ${(data.consensusScore * 100).toFixed(0)}% confidence.`;
}

function summarizeGoogleSafeBrowsing(data: GoogleSafeBrowsingData) {
  return data.matches.length
    ? `${data.matches.length} Safe Browsing threat match${data.matches.length === 1 ? "" : "es"} found.`
    : "No Safe Browsing threat matches were reported.";
}

function summarizeThreatFeeds(data: ThreatFeedsData) {
  return data.matches.length
    ? `${data.matches.length} community feed match${data.matches.length === 1 ? "" : "es"} found.`
    : "No matches were found in the checked community feeds.";
}

function summarizeSsl(data: SSLData) {
  return data.authorized
    ? `TLS is available via ${data.protocol}.`
    : `TLS is reachable but not fully authorized: ${data.authorizationError ?? "unknown issue"}.`;
}

function summarizeWhois(data: WhoisData) {
  return data.ageDays !== null
    ? `The domain was first registered ${data.ageDays} day${data.ageDays === 1 ? "" : "s"} ago.`
    : "Registration data was returned without a domain age.";
}

function summarizeDns(data: DNSData) {
  return `${data.addresses.length} address${data.addresses.length === 1 ? "" : "es"} and ${data.mx.length} mail exchange record${data.mx.length === 1 ? "" : "s"} were found.`;
}

function summarizeRedirectChain(data: RedirectData) {
  return data.totalHops === 0
    ? `The URL resolved without redirects to ${data.finalUrl}.`
    : `${data.totalHops} redirect hop${data.totalHops === 1 ? "" : "s"} led to ${data.finalUrl}.`;
}

function renderSslDetails(data: SSLData) {
  return (
    <div className="grid grid-cols-2 gap-3 text-sm text-[color:var(--muted-foreground)]">
      <p>Issuer: {data.issuer ?? "Unknown"}</p>
      <p>Subject: {data.subject ?? "Unknown"}</p>
      <p>
        Valid from:{" "}
        {data.validFrom
          ? new Date(data.validFrom).toLocaleDateString()
          : "Unknown"}
      </p>
      <p>
        Valid to:{" "}
        {data.validTo ? new Date(data.validTo).toLocaleDateString() : "Unknown"}
      </p>
    </div>
  );
}

function renderWhoisDetails(data: WhoisData) {
  return (
    <div className="grid grid-cols-2 gap-3 text-sm text-[color:var(--muted-foreground)]">
      <p>Registrar: {data.registrar ?? "Unknown"}</p>
      <p>Country: {data.country ?? "Unknown"}</p>
      <p>
        Registered:{" "}
        {data.registeredAt
          ? new Date(data.registeredAt).toLocaleDateString()
          : "Unknown"}
      </p>
      <p>
        Expires:{" "}
        {data.expiresAt
          ? new Date(data.expiresAt).toLocaleDateString()
          : "Unknown"}
      </p>
    </div>
  );
}

function renderDnsDetails(data: DNSData) {
  return (
    <div className="space-y-2 text-sm text-[color:var(--muted-foreground)]">
      <p>A records: {data.addresses.join(", ") || "None"}</p>
      <p>MX records: {data.mx.join(", ") || "None"}</p>
      {data.anomalies.length ? (
        <p>Anomalies: {data.anomalies.join(" ")}</p>
      ) : null}
    </div>
  );
}

function renderRedirectDetails(data: RedirectData) {
  return (
    <ol className="space-y-2 text-sm text-[color:var(--muted-foreground)]">
      {data.hops.map((hop) => (
        <li
          key={`${hop.url}-${hop.status}`}
          className="rounded-2xl bg-black/[0.03] px-3 py-2 dark:bg-white/[0.04]"
        >
          <p className="font-medium text-[color:var(--foreground)]">
            {hop.status} {hop.url}
          </p>
          {hop.location ? <p>Location: {hop.location}</p> : null}
        </li>
      ))}
    </ol>
  );
}
