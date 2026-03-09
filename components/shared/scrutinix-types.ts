import type { SignalName, SignalPayloadMap, Verdict } from "@/lib/domain/types";

export interface SharedSnapshot {
  verdict: Verdict;
  url: string;
  summary: string;
  capturedAt: string;
}

export function verdictColor(verdict: Verdict | string): string {
  switch (verdict) {
    case "safe":
      return "var(--sx-safe)";
    case "suspicious":
      return "var(--sx-suspicious)";
    case "malicious":
      return "var(--sx-malicious)";
    case "critical":
      return "var(--sx-critical)";
    default:
      return "var(--sx-error)";
  }
}

/** Returns the CSS var string for the active accent based on verdict */
export function getActiveAccent(verdict: Verdict | string | undefined): string {
  if (!verdict) return "var(--sx-accent)";
  const map: Record<string, string> = {
    safe: "var(--sx-safe)",
    suspicious: "var(--sx-suspicious)",
    malicious: "var(--sx-malicious)",
    critical: "var(--sx-critical)",
    error: "var(--sx-error)",
  };
  return map[verdict] ?? "var(--sx-accent)";
}

/** Returns inline style object that sets --sx-active-accent */
export function getAccentStyle(
  verdict: Verdict | string | undefined,
): React.CSSProperties {
  return {
    "--sx-active-accent": getActiveAccent(verdict),
  } as React.CSSProperties;
}

export type Severity =
  | "safe"
  | "neutral"
  | "suspicious"
  | "malicious"
  | "error"
  | "pending"
  | "skipped";

export function getSignalSeverity(
  status: string,
  data: SignalPayloadMap[SignalName] | null,
  name: SignalName,
): Severity {
  if (status === "pending") return "pending";
  if (status === "skipped") return "skipped";
  if (status === "error") return "error";
  if (status !== "success" || !data) return "pending";

  if (name === "virusTotal") {
    const d = data as { malicious: number; suspicious: number };
    if (d.malicious > 3) return "malicious";
    if (d.malicious > 0 || d.suspicious > 0) return "suspicious";
    return "safe";
  }
  if (name === "googleSafeBrowsing") {
    const d = data as { matches: unknown[] };
    return d.matches.length > 0 ? "malicious" : "safe";
  }
  if (name === "threatFeeds") {
    const d = data as { matches: unknown[]; warnings?: string[] };
    if (d.matches.length === 0 && (d.warnings?.length ?? 0) > 0)
      return "neutral";
    return d.matches.length > 0 ? "malicious" : "safe";
  }
  if (name === "mlEnsemble") {
    const d = data as { consensusLabel: string; warnings?: string[] };
    if (d.consensusLabel === "benign" && (d.warnings?.length ?? 0) > 0) {
      return "neutral";
    }
    if (d.consensusLabel === "malicious") return "malicious";
    if (d.consensusLabel === "risky") return "suspicious";
    return "safe";
  }
  if (name === "ssl") {
    const d = data as {
      available: boolean;
      validationState: string;
    };
    if (!d.available) return "neutral";
    if (d.validationState === "warning") return "neutral";
    if (d.validationState === "invalid" || d.validationState === "untrusted") {
      return "suspicious";
    }
    return "safe";
  }
  if (name === "whois") {
    const d = data as { available?: boolean; ageDays: number | null };
    if (d.available === false) return "neutral";
    if (d.ageDays !== null && d.ageDays < 30) return "suspicious";
    return "safe";
  }
  if (name === "redirectChain") {
    const d = data as { totalHops: number; reachable?: boolean };
    if (d.reachable === false) return "neutral";
    if (d.totalHops > 3) return "suspicious";
    return "safe";
  }
  if (name === "dns") {
    const d = data as { anomalies?: string[]; observations?: string[] };
    if ((d.anomalies?.length ?? 0) > 0) return "suspicious";
    if ((d.observations?.length ?? 0) > 0) return "neutral";
    return "safe";
  }
  return "safe";
}

const SEVERITY_LED: Record<Severity, string> = {
  safe: "var(--sx-safe)",
  neutral: "var(--sx-info)",
  suspicious: "var(--sx-suspicious)",
  malicious: "var(--sx-malicious)",
  error: "var(--sx-error)",
  pending: "var(--sx-suspicious)",
  skipped: "var(--sx-border-muted)",
};

const SEVERITY_EDGE: Record<Severity, string> = {
  safe: "sx-edge-safe",
  neutral: "sx-edge-neutral",
  suspicious: "sx-edge-suspicious",
  malicious: "sx-edge-malicious",
  error: "sx-edge-error",
  pending: "sx-edge-pending",
  skipped: "sx-edge-skipped",
};

export function getLedColorFromSeverity(severity: Severity): string {
  return SEVERITY_LED[severity];
}

export function getEdgeClassFromSeverity(severity: Severity): string {
  return SEVERITY_EDGE[severity];
}
