import type {
  AnalysisResult,
  ClassificationFinding,
  SignalResults,
  ThreatInfo,
  Verdict,
} from "@/lib/domain/types";

interface Contribution {
  score: number;
  category: string;
  reason: string;
}

export function buildThreatAssessment(
  signals: SignalResults,
): Pick<AnalysisResult, "verdict" | "threatInfo"> {
  const successfulSignals = Object.values(signals).filter(
    (signal) => signal.status === "success",
  ).length;
  const failedSignals = Object.values(signals).filter(
    (signal) => signal.status === "error",
  ).length;

  if (successfulSignals === 0) {
    return {
      verdict: "error",
      threatInfo: null,
    };
  }

  const contributions = [
    ...scoreVirusTotal(signals),
    ...scoreGoogleSafeBrowsing(signals),
    ...scoreThreatFeeds(signals),
    ...scoreMlEnsemble(signals),
    ...scoreSsl(signals),
    ...scoreDns(signals),
    ...scoreRedirects(signals),
    ...scoreWhois(signals),
  ];

  const score = clamp(
    contributions.reduce((total, item) => total + item.score, 0),
    0,
    100,
  );
  const verdict = scoreToVerdict(score);
  const reasons = [...new Set(contributions.map((item) => item.reason))];
  const categories = [...new Set(contributions.map((item) => item.category))];
  const recommendations = buildRecommendations(verdict);
  const confidence = clamp(
    0.35 + successfulSignals * 0.08 + score / 220 - failedSignals * 0.03,
    0.2,
    0.99,
  );

  const threatInfo: ThreatInfo = {
    verdict,
    confidence: Number(confidence.toFixed(2)),
    score,
    summary: buildSummary(verdict, categories, reasons),
    categories,
    reasons: reasons.length
      ? reasons
      : ["No strong malicious indicators were found."],
    recommendations,
  };

  return {
    verdict,
    threatInfo,
  };
}

function scoreVirusTotal(signals: SignalResults): Contribution[] {
  const signal = signals.virusTotal;
  if (signal.status !== "success" || !signal.data) {
    return [];
  }

  const { malicious, suspicious } = signal.data;
  const contributions: Contribution[] = [];

  if (malicious > 0) {
    contributions.push({
      score: clamp(malicious * 7, 18, 50),
      category: "Reputation",
      reason: `${malicious} VirusTotal engines marked the URL as malicious.`,
    });
  }

  if (suspicious > 0) {
    contributions.push({
      score: clamp(suspicious * 4, 8, 20),
      category: "Reputation",
      reason: `${suspicious} VirusTotal engines marked the URL as suspicious.`,
    });
  }

  return contributions;
}

function scoreGoogleSafeBrowsing(signals: SignalResults): Contribution[] {
  const signal = signals.googleSafeBrowsing;
  if (
    signal.status !== "success" ||
    !signal.data ||
    signal.data.matches.length === 0
  ) {
    return [];
  }

  return [
    {
      score: 45,
      category: "Google Safe Browsing",
      reason: `Google Safe Browsing reported ${signal.data.matches.length} threat match${signal.data.matches.length === 1 ? "" : "es"}.`,
    },
  ];
}

function scoreThreatFeeds(signals: SignalResults): Contribution[] {
  const signal = signals.threatFeeds;
  if (
    signal.status !== "success" ||
    !signal.data ||
    signal.data.matches.length === 0
  ) {
    return [];
  }

  return signal.data.matches.map((match) => ({
    score: match.confidence === "high" ? 32 : 20,
    category: "Threat Feed",
    reason: `${match.feed} listed the URL as ${match.detail}.`,
  }));
}

function scoreMlEnsemble(signals: SignalResults): Contribution[] {
  const signal = signals.mlEnsemble;
  if (signal.status !== "success" || !signal.data) {
    return [];
  }

  const contributions: Contribution[] = [];

  if (signal.data.consensusLabel === "malicious") {
    contributions.push({
      score: Math.round(signal.data.consensusScore * 28),
      category: "Behavioral Model",
      reason: `The ML ensemble flagged the URL as malicious with ${(signal.data.consensusScore * 100).toFixed(0)}% confidence.`,
    });
  } else if (signal.data.consensusLabel === "risky") {
    contributions.push({
      score: Math.round(signal.data.consensusScore * 16),
      category: "Behavioral Model",
      reason: `The ML ensemble found risky lexical patterns in the URL.`,
    });
  }

  return contributions;
}

function scoreSsl(signals: SignalResults): Contribution[] {
  const signal = signals.ssl;
  if (signal.status !== "success" || !signal.data) {
    return [];
  }

  const contributions: Contribution[] = [];

  if (!signal.data.authorized) {
    contributions.push({
      score: 8,
      category: "TLS",
      reason: "The TLS certificate could not be validated cleanly.",
    });
  }

  if (signal.data.daysRemaining !== null && signal.data.daysRemaining < 0) {
    contributions.push({
      score: 12,
      category: "TLS",
      reason: "The TLS certificate is expired.",
    });
  }

  if (signal.data.selfSigned) {
    contributions.push({
      score: 10,
      category: "TLS",
      reason: "The endpoint appears to use a self-signed certificate.",
    });
  }

  return contributions;
}

function scoreDns(signals: SignalResults): Contribution[] {
  const signal = signals.dns;
  if (signal.status !== "success" || !signal.data) {
    return [];
  }

  return signal.data.anomalies.map((anomaly) => ({
    score: 4,
    category: "DNS",
    reason: anomaly,
  }));
}

function scoreRedirects(signals: SignalResults): Contribution[] {
  const signal = signals.redirectChain;
  if (signal.status !== "success" || !signal.data) {
    return [];
  }

  const contributions: Contribution[] = [];

  if (signal.data.totalHops >= 3) {
    contributions.push({
      score: 8,
      category: "Redirects",
      reason: `The URL redirected through ${signal.data.totalHops} hops before settling.`,
    });
  }

  const downgradedToHttp = signal.data.hops.some((hop) =>
    hop.location?.startsWith("http://"),
  );
  if (downgradedToHttp) {
    contributions.push({
      score: 10,
      category: "Redirects",
      reason: "The redirect chain downgrades or stays on HTTP.",
    });
  }

  return contributions;
}

function scoreWhois(signals: SignalResults): Contribution[] {
  const signal = signals.whois;
  if (signal.status !== "success" || !signal.data) {
    return [];
  }

  const contributions: Contribution[] = [];

  if (signal.data.ageDays !== null && signal.data.ageDays < 30) {
    contributions.push({
      score: 15,
      category: "Domain Age",
      reason: `The domain is only ${signal.data.ageDays} day${signal.data.ageDays === 1 ? "" : "s"} old.`,
    });
  } else if (signal.data.ageDays !== null && signal.data.ageDays < 180) {
    contributions.push({
      score: 8,
      category: "Domain Age",
      reason: `The domain is relatively new at ${signal.data.ageDays} days old.`,
    });
  }

  return contributions;
}

function buildRecommendations(verdict: Verdict) {
  switch (verdict) {
    case "critical":
    case "malicious":
      return [
        "Do not open the link outside an isolated environment.",
        "Do not enter credentials, payment details, or MFA codes.",
        "If you already visited it, clear browser state and run a device malware scan.",
      ];
    case "suspicious":
      return [
        "Verify the sender and business context before opening the link.",
        "Open only in a disposable browser profile or sandbox if you must inspect it.",
        "Avoid submitting credentials or downloading files until trust is established.",
      ];
    case "safe":
      return [
        "No high-confidence malicious indicators were found in this scan.",
        "Continue normal caution for unfamiliar links, especially shortened or time-sensitive ones.",
      ];
    default:
      return [
        "The scan could not gather enough data to determine a safe verdict.",
      ];
  }
}

function buildSummary(
  verdict: Verdict,
  categories: string[],
  reasons: string[],
) {
  if (verdict === "safe") {
    return "No strong malicious indicators were found across the available signals.";
  }

  if (verdict === "error") {
    return "The scan failed before enough signals completed.";
  }

  if (categories.length > 0) {
    return `${capitalize(verdict)} risk based on ${categories.slice(0, 2).join(" and ")} signals.`;
  }

  return reasons[0] ?? "The scan found suspicious behavior.";
}

function scoreToVerdict(score: number): Verdict {
  if (score >= 80) {
    return "critical";
  }

  if (score >= 55) {
    return "malicious";
  }

  if (score >= 25) {
    return "suspicious";
  }

  return "safe";
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function classifyConsensus(
  hosted: ClassificationFinding | null,
  lexical: ClassificationFinding,
) {
  if (!hosted) {
    return lexical;
  }

  const combinedScore = hosted.score * 0.65 + lexical.score * 0.35;

  return {
    label:
      combinedScore >= 0.74
        ? "malicious"
        : combinedScore >= 0.45
          ? "risky"
          : "benign",
    score: Number(combinedScore.toFixed(2)),
    reasons: [...new Set([...hosted.reasons, ...lexical.reasons])],
    model: "ensemble",
  } satisfies ClassificationFinding;
}
