import type {
  DNSData,
  GoogleSafeBrowsingData,
  MLSignalData,
  RedirectData,
  SignalName,
  SignalPayloadMap,
  SSLData,
  ThreatFeedsData,
  Verdict,
  VirusTotalData,
  WhoisData,
} from "@/lib/domain/types";

export const signalLabels: Record<SignalName, string> = {
  virusTotal: "VirusTotal",
  mlEnsemble: "ML Ensemble",
  googleSafeBrowsing: "Google Safe Browsing",
  threatFeeds: "Threat Feeds",
  ssl: "TLS Certificate",
  whois: "Domain Registration",
  dns: "DNS Profile",
  redirectChain: "Redirect Chain",
};

export const signalIcons: Record<SignalName, string> = {
  virusTotal: "Shield",
  mlEnsemble: "Brain",
  googleSafeBrowsing: "Search",
  threatFeeds: "Rss",
  ssl: "Lock",
  whois: "Globe",
  dns: "Server",
  redirectChain: "ArrowRightLeft",
};

export function getSignalSummary(
  name: SignalName,
  data: SignalPayloadMap[SignalName],
): string {
  switch (name) {
    case "virusTotal": {
      const d = data as VirusTotalData;
      return `${d.malicious} malicious and ${d.suspicious} suspicious engines across the last analysis run.`;
    }
    case "mlEnsemble": {
      const d = data as MLSignalData;
      return `Consensus verdict: ${d.consensusLabel} at ${(d.consensusScore * 100).toFixed(0)}% confidence.`;
    }
    case "googleSafeBrowsing": {
      const d = data as GoogleSafeBrowsingData;
      return d.matches.length
        ? `${d.matches.length} Safe Browsing threat match${d.matches.length === 1 ? "" : "es"} found.`
        : "No Safe Browsing threat matches were reported.";
    }
    case "threatFeeds": {
      const d = data as ThreatFeedsData;
      return d.matches.length
        ? `${d.matches.length} community feed match${d.matches.length === 1 ? "" : "es"} found.`
        : "No matches were found in the checked community feeds.";
    }
    case "ssl": {
      const d = data as SSLData;
      return d.authorized
        ? `TLS is available via ${d.protocol}.`
        : `TLS is reachable but not fully authorized: ${d.authorizationError ?? "unknown issue"}.`;
    }
    case "whois": {
      const d = data as WhoisData;
      return d.ageDays !== null
        ? `The domain was first registered ${d.ageDays} day${d.ageDays === 1 ? "" : "s"} ago.`
        : "Registration data was returned without a domain age.";
    }
    case "dns": {
      const d = data as DNSData;
      return `${d.addresses.length} address${d.addresses.length === 1 ? "" : "es"} and ${d.mx.length} mail exchange record${d.mx.length === 1 ? "" : "s"} were found.`;
    }
    case "redirectChain": {
      const d = data as RedirectData;
      return d.totalHops === 0
        ? `The URL resolved without redirects to ${d.finalUrl}.`
        : `${d.totalHops} redirect hop${d.totalHops === 1 ? "" : "s"} led to ${d.finalUrl}.`;
    }
    default:
      return "Signal complete.";
  }
}

export interface DetailEntry {
  label: string;
  value: string;
}

export function getSignalDetailEntries(
  name: SignalName,
  data: SignalPayloadMap[SignalName],
): DetailEntry[] {
  switch (name) {
    case "virusTotal": {
      const d = data as VirusTotalData;
      return d.results.slice(0, 5).map((r) => ({
        label: r.engine,
        value: r.result ?? r.category,
      }));
    }
    case "mlEnsemble": {
      const d = data as MLSignalData;
      const entries: DetailEntry[] = [
        {
          label: "Lexical model",
          value: `${(d.lexicalModel.score * 100).toFixed(0)}%`,
        },
      ];
      if (d.hostedModel) {
        entries.push({
          label: "Hosted model",
          value: `${((d.hostedModel.score ?? 0) * 100).toFixed(0)}%`,
        });
      }
      if (d.warnings.length) {
        entries.push({ label: "Warnings", value: d.warnings.join(" ") });
      }
      return entries;
    }
    case "googleSafeBrowsing": {
      const d = data as GoogleSafeBrowsingData;
      return d.matches.map((m) => ({
        label: m.threatType,
        value: `${m.platformType} / ${m.threatEntryType}`,
      }));
    }
    case "threatFeeds": {
      const d = data as ThreatFeedsData;
      const entries: DetailEntry[] = d.matches.map((m) => ({
        label: m.feed,
        value: m.detail,
      }));
      if (d.warnings.length) {
        entries.push({ label: "Warnings", value: d.warnings.join(" ") });
      }
      return entries;
    }
    case "ssl": {
      const d = data as SSLData;
      return [
        { label: "Issuer", value: d.issuer ?? "Unknown" },
        { label: "Subject", value: d.subject ?? "Unknown" },
        {
          label: "Valid from",
          value: d.validFrom
            ? new Date(d.validFrom).toLocaleDateString()
            : "Unknown",
        },
        {
          label: "Valid to",
          value: d.validTo
            ? new Date(d.validTo).toLocaleDateString()
            : "Unknown",
        },
      ];
    }
    case "whois": {
      const d = data as WhoisData;
      return [
        { label: "Registrar", value: d.registrar ?? "Unknown" },
        { label: "Country", value: d.country ?? "Unknown" },
        {
          label: "Registered",
          value: d.registeredAt
            ? new Date(d.registeredAt).toLocaleDateString()
            : "Unknown",
        },
        {
          label: "Expires",
          value: d.expiresAt
            ? new Date(d.expiresAt).toLocaleDateString()
            : "Unknown",
        },
      ];
    }
    case "dns": {
      const d = data as DNSData;
      const entries: DetailEntry[] = [
        { label: "A records", value: d.addresses.join(", ") || "None" },
        { label: "MX records", value: d.mx.join(", ") || "None" },
      ];
      if (d.anomalies.length) {
        entries.push({ label: "Anomalies", value: d.anomalies.join(" ") });
      }
      return entries;
    }
    case "redirectChain": {
      const d = data as RedirectData;
      return d.hops.map((hop) => ({
        label: `${hop.status}`,
        value: hop.location ? `${hop.url} → ${hop.location}` : hop.url,
      }));
    }
    default:
      return [];
  }
}

export function verdictToTone(
  verdict: Verdict | string,
): "safe" | "suspicious" | "malicious" | "critical" | "error" {
  switch (verdict) {
    case "safe":
      return "safe";
    case "suspicious":
      return "suspicious";
    case "malicious":
      return "malicious";
    case "critical":
      return "critical";
    default:
      return "error";
  }
}
