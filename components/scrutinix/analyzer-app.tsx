"use client";

import { clsx } from "clsx";
import dynamic from "next/dynamic";
import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { AppFooter } from "@/components/scrutinix/app-footer";
import { AppHeader } from "@/components/scrutinix/app-header";
import { BatchInput, SingleInput } from "@/components/scrutinix/input-panels";
import { VerdictHero } from "@/components/scrutinix/verdict-hero";
import { getSignalSummary } from "@/components/shared/signal-utils";
import {
  getActiveAccent,
  getSignalSeverity,
  type SharedSnapshot,
} from "@/components/shared/scrutinix-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  downloadTextFile,
  resultsToCsv,
  resultsToJson,
} from "@/lib/client/export";
import type { HistoryEntry } from "@/lib/domain/types";
import {
  signalLabels,
  signalNames,
  type AnalysisResult,
  type Verdict,
} from "@/lib/domain/types";
import {
  threatScoreToVerdict,
} from "@/lib/domain/score-bands";
import { normalizeUrlInput } from "@/lib/domain/url";
import { useBatchStream } from "@/hooks/use-batch-stream";
import { useScanHistory } from "@/hooks/use-scan-history";
import { useScanStream } from "@/hooks/use-scan-stream";

type Tab = "single" | "batch";
type ViewMode = "summary" | "full";

interface TickerEvent {
  id: string;
  time: string;
  text: string;
}

interface HistoryEvent {
  nonce: number;
  result: AnalysisResult;
}

const summarySignalOrder = [
  "googleSafeBrowsing",
  "threatFeeds",
  "virusTotal",
  "mlEnsemble",
  "ssl",
  "redirectChain",
  "whois",
  "dns",
] as const;

const BatchPanel = dynamic(
  () =>
    import("@/components/scrutinix/batch-panel").then(
      (module) => module.BatchPanel,
    ),
  {
    loading: () => (
      <Card>
        <CardContent className="px-5 py-6 text-xs text-[var(--sx-text-muted)]">
          Initializing batch console...
        </CardContent>
      </Card>
    ),
  },
);

const HistoryPanel = dynamic(
  () =>
    import("@/components/scrutinix/history-panel").then(
      (module) => module.HistoryPanel,
    ),
  {
    loading: () => (
      <Card role="region" aria-label="Scan history" className="min-h-[22rem]">
        <CardContent className="px-5 py-6 text-xs text-[var(--sx-text-muted)]">
          Loading history console...
        </CardContent>
      </Card>
    ),
  },
);

const SignalCard = dynamic(
  () =>
    import("@/components/scrutinix/signal-card").then(
      (module) => module.SignalCard,
    ),
  {
    loading: () => (
      <Card className="border-dashed">
        <CardContent className="px-5 py-6 text-xs text-[var(--sx-text-muted)]">
          Resolving signal...
        </CardContent>
      </Card>
    ),
  },
);

function readSnapshot(): SharedSnapshot | null {
  if (typeof window === "undefined") return null;
  const payload = new URLSearchParams(window.location.search).get("shared");
  if (!payload) return null;

  const validVerdicts: Verdict[] = [
    "safe",
    "suspicious",
    "malicious",
    "critical",
    "error",
  ];
  const maxUrlLength = 2048;
  const maxSummaryLength = 600;
  const maxCapturedAtLength = 128;
  const toSnapshot = (value: unknown): SharedSnapshot | null => {
    if (
      !value ||
      typeof value !== "object" ||
      typeof (value as { url?: unknown }).url !== "string" ||
      typeof (value as { summary?: unknown }).summary !== "string" ||
      typeof (value as { capturedAt?: unknown }).capturedAt !== "string" ||
      typeof (value as { verdict?: unknown }).verdict !== "string"
    ) {
      return null;
    }

    const verdict = (value as { verdict: string }).verdict;
    if (!validVerdicts.includes(verdict as Verdict)) {
      return null;
    }

    const url = (value as { url: string }).url;
    const summary = (value as { summary: string }).summary;
    const capturedAt = (value as { capturedAt: string }).capturedAt;
    if (
      url.length > maxUrlLength ||
      summary.length > maxSummaryLength ||
      capturedAt.length > maxCapturedAtLength
    ) {
      return null;
    }

    return {
      verdict: verdict as Verdict,
      url,
      summary,
      capturedAt,
    };
  };

  try {
    return toSnapshot(JSON.parse(decodeURIComponent(atob(payload))));
  } catch {
    try {
      return toSnapshot(JSON.parse(atob(payload)));
    } catch {
      return null;
    }
  }
}

function fmtTime(date: Date) {
  return date.toLocaleTimeString("en-US", { hour12: false });
}

function deriveTickerTime(
  durationMs: number,
  startedAt: string | null,
  completedAt: string | null,
) {
  if (startedAt) {
    const started = new Date(startedAt).getTime();
    if (!Number.isNaN(started)) {
      return fmtTime(new Date(started + durationMs));
    }
  }

  if (completedAt) {
    const completed = new Date(completedAt);
    if (!Number.isNaN(completed.getTime())) {
      return fmtTime(completed);
    }
  }

  return fmtTime(new Date());
}

const severityRank = {
  malicious: 5,
  suspicious: 4,
  error: 3,
  neutral: 2,
  skipped: 1,
  safe: 0,
  pending: -1,
} as const;

function useCreateAnalyzerRuntime() {
  const [activeTab, setActiveTab] = useState<Tab>("single");
  const [viewMode, setViewMode] = useState<ViewMode>("summary");
  const [singleUrl, setSingleUrl] = useState("");
  const [batchInput, setBatchInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(
    null,
  );
  const [sharedSnapshot] = useState<SharedSnapshot | null>(() =>
    readSnapshot(),
  );
  const [historyEvent, setHistoryEvent] = useState<HistoryEvent | null>(null);

  const pushHistoryEvent = useCallback((result: AnalysisResult) => {
    setHistoryEvent((previous) => ({
      nonce: (previous?.nonce ?? 0) + 1,
      result,
    }));
  }, []);

  const scan = useScanStream((result) => {
    startTransition(() => setSelectedResult(result));
    pushHistoryEvent(result);
  });

  const batch = useBatchStream((result) => {
    pushHistoryEvent(result);
  });

  const active = selectedResult ?? scan.state.result;
  const signals = active?.signals ?? scan.state.signals;

  const live = scan.state.isStreaming || batch.state.isStreaming;
  const isMalicious =
    active?.verdict === "malicious" || active?.verdict === "critical";
  const score = active?.threatInfo?.score ?? 0;
  const scoreColor = getActiveAccent(threatScoreToVerdict(score));
  const accentColor = getActiveAccent(active?.verdict);
  const scanStartedAt = active?.metadata?.startedAt ?? scan.state.startedAt;
  const scanCompletedAt = active?.metadata?.completedAt ?? null;

  const ticker = useMemo(() => {
    const events: TickerEvent[] = [];
    for (const signalName of signalNames) {
      const signal = signals[signalName];
      if (signal.status === "success" && signal.data) {
        events.push({
          id: `${signalName}-${signal.durationMs}`,
          time: deriveTickerTime(
            signal.durationMs,
            scanStartedAt,
            scanCompletedAt,
          ),
          text: `${signalLabels[signalName]}: ${getSignalSummary(signalName, signal.data)}`,
        });
      }
      if (signal.status === "error" && signal.error) {
        events.push({
          id: `${signalName}-err`,
          time: deriveTickerTime(
            signal.durationMs,
            scanStartedAt,
            scanCompletedAt,
          ),
          text: `${signalLabels[signalName]}: ERROR - ${signal.error}`,
        });
      }
    }
    return events.slice(-8);
  }, [scanCompletedAt, scanStartedAt, signals]);

  const done = useMemo(
    () =>
      signalNames.filter(
        (signalName) =>
          signals[signalName].status === "success" ||
          signals[signalName].status === "error" ||
          signals[signalName].status === "skipped",
      ).length,
    [signals],
  );

  const summarySignals = useMemo(
    () =>
      [...summarySignalOrder]
        .filter((signalName) => signals[signalName].status !== "pending")
        .sort((left, right) => {
          const leftSeverity = getSignalSeverity(
            signals[left].status,
            signals[left].data,
            left,
          );
          const rightSeverity = getSignalSeverity(
            signals[right].status,
            signals[right].data,
            right,
          );
          return severityRank[rightSeverity] - severityRank[leftSeverity];
        })
        .slice(0, 3),
    [signals],
  );
  const successfulSignalCount = useMemo(
    () =>
      signalNames.filter(
        (signalName) => signals[signalName].status === "success",
      ).length,
    [signals],
  );
  const caveatSignalCount = useMemo(
    () =>
      signalNames.filter((signalName) => {
        const severity = getSignalSeverity(
          signals[signalName].status,
          signals[signalName].data,
          signalName,
        );
        return severity === "neutral";
      }).length,
    [signals],
  );
  const unavailableSignalCount = useMemo(
    () =>
      signalNames.filter((signalName) => {
        const status = signals[signalName].status;
        return status === "error" || status === "skipped";
      }).length,
    [signals],
  );

  const hasActivity = live || active !== null;
  const visibleSignals =
    viewMode === "summary" && summarySignals.length > 0
      ? summarySignals
      : hasActivity
        ? signalNames
        : [];

  const startSingleScan = useCallback(async () => {
    setFormError(null);
    setSelectedResult(null);
    const value = normalizeUrlInput(singleUrl);
    if (!value.ok) {
      setFormError(value.error);
      return;
    }
    await scan.startScan(value.value.normalizedUrl);
  }, [scan, singleUrl]);

  const startBatchScan = useCallback(async () => {
    setFormError(null);
    const urls = batchInput
      .split("\n")
      .map((segment) => segment.trim())
      .filter(Boolean);

    if (!urls.length) {
      setFormError("Add at least one URL.");
      return;
    }

    if (urls.length > 10) {
      setFormError("Batch capped at 10 URLs.");
      return;
    }

    const invalid = urls
      .map((url) => normalizeUrlInput(url))
      .find((result) => !result.ok);
    if (invalid && !invalid.ok) {
      setFormError(invalid.error);
      return;
    }

    await batch.startBatch(urls);
  }, [batch, batchInput]);

  const shareResult = useCallback(async (result: AnalysisResult) => {
    const capturedAt =
      result.metadata?.completedAt ?? new Date().toISOString();
    const payload = JSON.stringify({
      verdict: result.verdict,
      url: result.url,
      summary: result.threatInfo?.summary ?? "",
      capturedAt,
    });
    const encodedPayload = btoa(encodeURIComponent(payload));
    const targetUrl = new URL(window.location.href);
    targetUrl.searchParams.set("shared", encodedPayload);

    try {
      await navigator.clipboard.writeText(targetUrl.toString());
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Clipboard access was blocked");
    }
  }, []);

  const rescanUrl = useCallback(
    async (url: string) => {
      setFormError(null);
      setSelectedResult(null);
      setSingleUrl(url);
      setActiveTab("single");
      await scan.startScan(url);
    },
    [scan],
  );

  const selectHistoryEntry = useCallback((entry: HistoryEntry) => {
    setSelectedResult(entry);
    setSingleUrl(entry.url);
    setActiveTab("single");
  }, []);

  return {
    active,
    accentColor,
    activeTab,
    batch,
    batchInput,
    done,
    formError,
    hasActivity,
    historyEvent,
    isMalicious,
    live,
    scan,
    score,
    scoreColor,
    selectedResult,
    setActiveTab,
    setBatchInput,
    setFormError,
    setSelectedResult,
    setSingleUrl,
    setViewMode,
    shareResult,
    sharedSnapshot,
    signals,
    singleUrl,
    startBatchScan,
    startSingleScan,
    summarySignals,
    ticker,
    viewMode,
    visibleSignals,
    rescanUrl,
    selectHistoryEntry,
    successfulSignalCount,
    caveatSignalCount,
    unavailableSignalCount,
  };
}

type AnalyzerRuntimeValue = ReturnType<typeof useCreateAnalyzerRuntime>;

const AnalyzerRuntimeContext = createContext<AnalyzerRuntimeValue | null>(null);

function useAnalyzerRuntime() {
  const context = useContext(AnalyzerRuntimeContext);
  if (!context) {
    throw new Error("Analyzer runtime context is unavailable.");
  }
  return context;
}

export function AnalyzerRuntimeProvider({ children }: { children: ReactNode }) {
  const value = useCreateAnalyzerRuntime();
  return (
    <AnalyzerRuntimeContext.Provider value={value}>
      {children}
    </AnalyzerRuntimeContext.Provider>
  );
}

export function AnalyzerChrome({ children }: { children: ReactNode }) {
  const { accentColor, isMalicious } = useAnalyzerRuntime();

  return (
    <div
      className={clsx(
        "sx-radar-bg flex min-h-screen flex-col",
        isMalicious && "sx-alert",
      )}
      style={{ "--sx-active-accent": accentColor } as CSSProperties}
    >
      {children}
    </div>
  );
}

export function HeaderMetrics() {
  const { done, live, score, scoreColor } = useAnalyzerRuntime();
  const hasActivity = live || done > 0;
  const clampedScore = Math.min(Math.max(score, 0), 100);
  const readinessLabel = live ? "Live" : hasActivity ? "Complete" : "Idle";
  const readinessVariant = live
    ? ("active" as const)
    : hasActivity
      ? ("safe" as const)
      : ("neutral" as const);
  const coverageText = hasActivity ? `${done}/8 signals` : "Awaiting scan";
  const meterLabel = hasActivity ? `${clampedScore}/100` : "Awaiting scan";
  const meterValueText = hasActivity
    ? `${clampedScore} out of 100`
    : "Awaiting scan";

  return (
    <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-0">
      <div className="flex min-w-0 flex-1 flex-col justify-center sm:pr-6">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-[var(--sx-text-muted)]">
            Threat score
          </span>
          <span className="sx-font-hack tabular-nums text-xs text-[var(--sx-text)]">
            {meterLabel}
          </span>
        </div>
        <div
          role="meter"
          aria-label="Threat score"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={hasActivity ? clampedScore : 0}
          aria-valuetext={meterValueText}
          className={clsx(
            "relative mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[var(--sx-border)]",
            !hasActivity && "ring-1 ring-dashed ring-[var(--sx-border-muted)] ring-inset",
          )}
        >
          <div
            className="sx-threat-fill absolute inset-y-0 left-0 rounded-full transition-[width,background-color] duration-500 ease-out"
            style={{
              width: `${hasActivity ? clampedScore : 0}%`,
              backgroundColor: hasActivity
                ? scoreColor
                : "var(--sx-border-muted)",
            }}
          />
        </div>
      </div>

      <div
        className="hidden w-px shrink-0 bg-border sm:block sm:self-stretch"
        aria-hidden="true"
      />

      <div className="flex flex-wrap items-center gap-2 sm:min-w-[11rem] sm:flex-none sm:justify-end sm:self-center sm:pl-6">
        <Badge variant={readinessVariant}>{readinessLabel}</Badge>
        <span className="sx-font-hack tabular-nums text-xs tracking-[0.08em] text-[var(--sx-text-muted)]">
          {coverageText}
        </span>
      </div>
    </div>
  );
}

export function ScanDock() {
  const {
    active,
    activeTab,
    batch,
    batchInput,
    formError,
    live,
    rescanUrl,
    scan,
    setActiveTab,
    setBatchInput,
    setFormError,
    setSingleUrl,
    shareResult,
    singleUrl,
    startBatchScan,
    startSingleScan,
  } = useAnalyzerRuntime();

  return (
    <section
      id="scan-console"
      className="sx-stage-in sx-panel flex flex-col overflow-hidden rounded-xl border border-border"
      data-delay="3"
      aria-labelledby="scan-dock-heading"
    >
      <div className="flex flex-col p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs text-[var(--sx-text-muted)]">
              Scan console
            </p>
            <h2
              id="scan-dock-heading"
              className="text-xl font-semibold text-[var(--sx-text)]"
            >
              Scan one link or a short batch.
            </h2>
            <p className="max-w-xl text-sm leading-6 text-[var(--sx-text-muted)]">
              Results stream into the workspace below as providers resolve.
            </p>
          </div>

          <Badge
            variant={
              live
                ? "active"
                : active
                  ? "safe"
                  : activeTab === "batch"
                    ? "neutral"
                    : "safe"
            }
          >
            {live ? "Live stream" : active ? "Result ready" : "Ready"}
          </Badge>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value as Tab);
            setFormError(null);
          }}
          className="mt-7 gap-4"
        >
          <TabsList
            aria-label="Scan mode"
            className="w-full justify-start sm:w-fit"
          >
            <TabsTrigger value="single">Single Scan</TabsTrigger>
            <TabsTrigger value="batch">Batch Scan</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="mt-0">
            <SingleInput
              url={singleUrl}
              onUrlChange={(value) => {
                setFormError(null);
                setSingleUrl(value);
              }}
              error={activeTab === "single" ? formError : null}
              streaming={scan.state.isStreaming}
              onSubmit={() => void startSingleScan()}
              onCancel={scan.cancelScan}
              result={active}
              onExport={() => {
                if (!active) return;
                downloadTextFile(
                  "scan.json",
                  JSON.stringify(active, null, 2),
                  "application/json",
                );
                toast.success("Exported scan.json");
              }}
              onShare={() => active && void shareResult(active)}
              onRescan={() => active && void rescanUrl(active.url)}
            />
          </TabsContent>

          <TabsContent value="batch" className="mt-0">
            <BatchInput
              value={batchInput}
              onChange={(value) => {
                setFormError(null);
                setBatchInput(value);
              }}
              error={activeTab === "batch" ? formError : null}
              streaming={batch.state.isStreaming}
              onSubmit={() => void startBatchScan()}
              onCancel={batch.cancelBatch}
              hasResults={batch.state.results.length > 0}
              onCsv={() => {
                downloadTextFile(
                  "batch.csv",
                  resultsToCsv(batch.state.results),
                );
                toast.success("Exported batch.csv");
              }}
              onJson={() => {
                downloadTextFile(
                  "batch.json",
                  resultsToJson(batch.state.results),
                  "application/json",
                );
                toast.success("Exported batch.json");
              }}
            />
          </TabsContent>
        </Tabs>

        {scan.state.error && (
          <div className="mt-4 rounded-lg border border-[var(--sx-malicious)] bg-[color-mix(in_srgb,var(--sx-malicious)_8%,transparent)] px-4 py-3 text-xs text-[var(--sx-malicious)]">
            {scan.state.error.message}
          </div>
        )}
        {batch.state.error && (
          <div className="mt-4 rounded-lg border border-[var(--sx-malicious)] bg-[color-mix(in_srgb,var(--sx-malicious)_8%,transparent)] px-4 py-3 text-xs text-[var(--sx-malicious)]">
            {batch.state.error.message}
          </div>
        )}
      </div>

      <footer className="mt-auto border-t border-border bg-[color-mix(in_srgb,var(--sx-border-muted)_12%,transparent)] px-6 py-4 sm:px-8">
        <div className="mb-3 flex flex-wrap gap-x-4 gap-y-2 text-[0.68rem] text-[var(--sx-text-soft)]">
          <span>8 live signals</span>
          <span>NDJSON stream</span>
          <span>Browser-only history</span>
        </div>
        <HeaderMetrics />
      </footer>
    </section>
  );
}

export function AnalyzerWorkspace() {
  const {
    active,
    activeTab,
    batch,
    live,
    rescanUrl,
    scan,
    setActiveTab,
    setSelectedResult,
    setSingleUrl,
    setViewMode,
    sharedSnapshot,
    signals,
    viewMode,
    visibleSignals,
    done,
  } = useAnalyzerRuntime();

  return (
    <section className="space-y-7">
      <div className="min-w-0">
        {activeTab === "single" ? (
          <VerdictHero
            result={active}
            isStreaming={scan.state.isStreaming}
            streamUrl={scan.state.url}
            sharedSnapshot={sharedSnapshot}
            completedSignals={done}
            onRunSharedScan={
              sharedSnapshot
                ? () => {
                    setSingleUrl(sharedSnapshot.url);
                    void rescanUrl(sharedSnapshot.url);
                  }
                : undefined
            }
          />
        ) : (
          <BatchPanel
            items={batch.state.items}
            isStreaming={batch.state.isStreaming}
            results={batch.state.results}
            onSelectResult={(result) => {
              setSelectedResult(result);
              setSingleUrl(result.url);
              setActiveTab("single");
            }}
          />
        )}
      </div>

      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-xs text-[var(--sx-text-muted)]">
              {activeTab === "single" ? "Signal surface" : "Batch inspection"}
            </p>
            <h2 className="text-2xl font-semibold text-[var(--sx-text)]">
              {activeTab === "single"
                ? "Evidence arrives in independent lanes."
                : "Keep the queue moving, inspect a finished row when it matters."}
            </h2>
          </div>

          {activeTab === "single" ? (
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <span
                className="text-xs font-medium text-[var(--sx-text-muted)]"
                id="signal-lanes-view-label"
              >
                Signal lanes
              </span>
              <div
                className="flex items-center gap-2"
                role="group"
                aria-labelledby="signal-lanes-view-label"
              >
                <span
                  className={clsx(
                    "text-xs tabular-nums",
                    viewMode === "summary"
                      ? "font-semibold text-[var(--sx-text)]"
                      : "text-[var(--sx-text-muted)]",
                  )}
                >
                  Summary
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={viewMode === "full"}
                  aria-labelledby="signal-lanes-view-label"
                  onClick={() =>
                    setViewMode(viewMode === "summary" ? "full" : "summary")
                  }
                  className={clsx(
                    "relative inline-block h-7 w-12 shrink-0 cursor-pointer rounded-full border border-border transition-colors",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sx-active-accent)]",
                    viewMode === "full"
                      ? "bg-[color-mix(in_srgb,var(--sx-active-accent)_22%,transparent)]"
                      : "bg-muted",
                  )}
                >
                  <span
                    aria-hidden
                    className={clsx(
                      "pointer-events-none absolute top-1 left-1 h-5 w-5 rounded-full bg-[var(--sx-text)] shadow transition-transform duration-200 ease-out",
                      viewMode === "full" ? "translate-x-5" : "translate-x-0",
                    )}
                  />
                </button>
                <span
                  className={clsx(
                    "text-xs tabular-nums",
                    viewMode === "full"
                      ? "font-semibold text-[var(--sx-text)]"
                      : "text-[var(--sx-text-muted)]",
                  )}
                >
                  Full
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {activeTab === "single" ? (
          <div className="transition-opacity duration-150">
            <p className="sr-only" aria-live="polite">
              {live
                ? `${done} of 8 signals acquired so far.`
                : active
                  ? `${done} of 8 signals completed for the current result.`
                  : "Awaiting scan."}
            </p>
            {visibleSignals.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {visibleSignals.map((signalName, index) => (
                  <SignalCard
                    key={signalName}
                    name={signalName}
                    result={signals[signalName]}
                    viewMode={viewMode}
                    isStreaming={live}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="sx-panel rounded-xl border border-dashed border-[var(--sx-border-muted)] px-6 py-14 text-center">
                <p className="text-xs text-[var(--sx-text-muted)]">
                  Awaiting scan
                </p>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--sx-text-muted)]">
                  Enter a target above to start the stream. Completed signals
                  will take over this surface as soon as providers resolve.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="sx-panel rounded-xl border border-dashed border-[var(--sx-border-muted)] px-6 py-14 text-center">
            <p className="text-xs text-[var(--sx-text-muted)]">
              Batch rows stay isolated
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--sx-text-muted)]">
              Every queued URL can finish cleanly, fail independently, or
              surface a verdict error without aborting the rest of the batch.
              Pick any completed item in the stream table to open its full
              evidence surface in single-scan mode.
            </p>
          </div>
        )}
      </section>
    </section>
  );
}

export function HistoryRail() {
  const { historyEvent, selectHistoryEntry } = useAnalyzerRuntime();
  const {
    addResult,
    canUndoClear,
    clearHistory,
    filteredEntries,
    filterVerdict,
    historyQuery,
    setFilterVerdict,
    setHistoryQuery,
    undoClearHistory,
  } = useScanHistory();

  useEffect(() => {
    if (!historyEvent) return;
    void addResult(historyEvent.result);
  }, [addResult, historyEvent]);

  return (
    <HistoryPanel
      entries={filteredEntries}
      historyQuery={historyQuery}
      onHistoryQueryChange={setHistoryQuery}
      filterVerdict={filterVerdict}
      onFilterVerdictChange={setFilterVerdict}
      onSelect={selectHistoryEntry}
      onClear={() => void clearHistory()}
      canUndoClear={canUndoClear}
      onUndoClear={() => void undoClearHistory()}
    />
  );
}

export function FooterTicker() {
  const { live, ticker } = useAnalyzerRuntime();

  return (
    <AppFooter>
      {ticker.length > 0 ? (
        live ? (
          <div className="flex w-full overflow-hidden whitespace-nowrap transition-opacity duration-300">
            <div className="sx-marquee flex items-center gap-10 text-[11px] text-[var(--sx-text-muted)]">
              {[...ticker, ...ticker].map((event, index) => (
                <span key={`${event.id}-${index}`} className="shrink-0">
                  <span className="text-[var(--sx-info)]">{event.time}</span>
                  <span className="mx-1 text-[var(--sx-border-muted)]">/</span>
                  <span>{event.text}</span>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex w-full flex-wrap items-center justify-end gap-x-5 gap-y-1 py-1 text-[11px] text-[var(--sx-text-muted)] transition-opacity duration-300">
            {ticker.slice(-4).map((event) => (
              <span key={event.id}>
                <span className="text-[var(--sx-info)]">{event.time}</span>
                <span className="mx-1 text-[var(--sx-border-muted)]">/</span>
                <span>{event.text}</span>
              </span>
            ))}
          </div>
        )
      ) : (
        <div className="flex w-full flex-wrap items-center justify-end gap-x-5 gap-y-1 text-[11px] text-[var(--sx-text-muted)] transition-opacity duration-300">
          <span>8 SIGNALS</span>
          <span className="text-[var(--sx-border-muted)]">/</span>
          <span>STREAMED VERDICTS</span>
          <span className="text-[var(--sx-border-muted)]">/</span>
          <span>BROWSER-ONLY HISTORY</span>
          <span className="text-[var(--sx-border-muted)]">/</span>
          <span>{live ? "STREAM ACTIVE" : "AWAITING TARGET"}</span>
        </div>
      )}
    </AppFooter>
  );
}

export function ShellHeader() {
  const { done, live, score, scoreColor } = useAnalyzerRuntime();
  const hasActivity = live || done > 0;

  return (
    <AppHeader
      threatScore={Math.min(Math.max(score, 0), 100)}
      scoreColor={hasActivity ? scoreColor : undefined}
      hasActivity={hasActivity}
    />
  );
}
