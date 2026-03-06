export const signalNames = [
  "virusTotal",
  "mlEnsemble",
  "googleSafeBrowsing",
  "threatFeeds",
  "ssl",
  "whois",
  "dns",
  "redirectChain",
] as const;

export type SignalName = (typeof signalNames)[number];

export type Verdict =
  | "safe"
  | "suspicious"
  | "malicious"
  | "critical"
  | "error";

export type SignalStatus = "pending" | "success" | "error" | "skipped";

export interface ApiError {
  code: string;
  message: string;
  retryable: boolean;
}

export interface ClassificationFinding {
  label: "benign" | "risky" | "malicious";
  score: number;
  reasons: string[];
  model: string;
}

export interface VirusTotalData {
  malicious: number;
  suspicious: number;
  harmless: number;
  undetected: number;
  timeout: number;
  results: Array<{
    engine: string;
    category: string;
    result: string | null;
  }>;
  permalink: string;
}

export interface MLSignalData {
  hostedModel: ClassificationFinding | null;
  lexicalModel: ClassificationFinding;
  consensusLabel: ClassificationFinding["label"];
  consensusScore: number;
  reasons: string[];
  warnings: string[];
}

export interface GoogleSafeBrowsingData {
  checkedAt: string;
  matches: Array<{
    threatType: string;
    platformType: string;
    threatEntryType: string;
  }>;
}

export interface ThreatFeedsData {
  checkedAt: string;
  matches: Array<{
    feed: "urlhaus" | "openphish";
    matchedUrl: string;
    detail: string;
    confidence: "medium" | "high";
  }>;
  warnings: string[];
}

export interface SSLData {
  protocol: string;
  authorized: boolean;
  authorizationError: string | null;
  issuer: string | null;
  subject: string | null;
  validFrom: string | null;
  validTo: string | null;
  daysRemaining: number | null;
  selfSigned: boolean;
  fingerprint256: string | null;
}

export interface WhoisData {
  registrar: string | null;
  registeredAt: string | null;
  updatedAt: string | null;
  expiresAt: string | null;
  ageDays: number | null;
  country: string | null;
  handle: string | null;
  rdapUrl: string;
}

export interface DNSData {
  addresses: string[];
  cnames: string[];
  mx: string[];
  txt: string[];
  nameservers: string[];
  anomalies: string[];
}

export interface RedirectData {
  finalUrl: string;
  totalHops: number;
  httpsUpgraded: boolean;
  hops: Array<{
    url: string;
    status: number;
    location?: string;
  }>;
}

export type SignalPayloadMap = {
  virusTotal: VirusTotalData;
  mlEnsemble: MLSignalData;
  googleSafeBrowsing: GoogleSafeBrowsingData;
  threatFeeds: ThreatFeedsData;
  ssl: SSLData;
  whois: WhoisData;
  dns: DNSData;
  redirectChain: RedirectData;
};

export interface SignalResult<T> {
  status: SignalStatus;
  data: T | null;
  error: string | null;
  durationMs: number;
}

export type SignalResults = {
  [K in SignalName]: SignalResult<SignalPayloadMap[K]>;
};

export interface ThreatInfo {
  verdict: Verdict;
  confidence: number;
  score: number;
  summary: string;
  categories: string[];
  reasons: string[];
  recommendations: string[];
}

export interface ScanMetadata {
  scanId: string;
  startedAt: string;
  completedAt: string;
  cacheHit: boolean;
  partialFailure: boolean;
  signalCount: number;
  durationMs: number;
}

export interface AnalysisResult {
  id: string;
  url: string;
  verdict: Verdict;
  signals: SignalResults;
  threatInfo: ThreatInfo | null;
  metadata: ScanMetadata;
}

export interface HistoryEntry extends AnalysisResult {
  savedAt: string;
}

export type AnalyzeEvent =
  | {
      type: "scan_started";
      scanId: string;
      url: string;
      cached: boolean;
      startedAt: string;
    }
  | {
      type: "signal_result";
      name: SignalName;
      result: SignalResult<unknown>;
    }
  | {
      type: "scan_complete";
      result: AnalysisResult;
    }
  | {
      type: "scan_error";
      error: ApiError;
    };

export type BatchEvent =
  | {
      type: "batch_started";
      total: number;
      startedAt: string;
    }
  | {
      type: "url_started";
      index: number;
      url: string;
    }
  | {
      type: "url_complete";
      index: number;
      url: string;
      result: AnalysisResult;
    }
  | {
      type: "batch_complete";
      results: AnalysisResult[];
    }
  | {
      type: "batch_error";
      error: ApiError;
    };

export function createPendingSignalResults(): SignalResults {
  return {
    virusTotal: createPendingSignalResult(),
    mlEnsemble: createPendingSignalResult(),
    googleSafeBrowsing: createPendingSignalResult(),
    threatFeeds: createPendingSignalResult(),
    ssl: createPendingSignalResult(),
    whois: createPendingSignalResult(),
    dns: createPendingSignalResult(),
    redirectChain: createPendingSignalResult(),
  };
}

function createPendingSignalResult<T>(): SignalResult<T> {
  return {
    status: "pending",
    data: null,
    error: null,
    durationMs: 0,
  };
}
