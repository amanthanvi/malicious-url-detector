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
import {
  getSignalSummary,
  signalLabels,
} from "@/components/shared/signal-utils";
import {
  getActiveAccent,
  type SharedSnapshot,
} from "@/components/shared/scrutinix-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  downloadTextFile,
  resultsToCsv,
  resultsToJson,
} from "@/lib/client/export";
import type { HistoryEntry } from "@/lib/domain/types";
import { signalNames, type AnalysisResult } from "@/lib/domain/types";
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
        <CardContent className="px-6 py-8 text-xs text-[var(--sx-text-muted)]">
          Initializing batch console...
        </CardContent>
      </Card>
    ),
  },
);

const EducationSection = dynamic(
  () =>
    import("@/components/scrutinix/education-section").then(
      (module) => module.EducationSection,
    ),
  {
    loading: () => (
      <Card>
        <CardContent className="px-4 py-4 text-xs text-[var(--sx-text-muted)]">
          Loading guidance...
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
        <CardContent className="px-4 py-6 text-xs text-[var(--sx-text-muted)]">
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
        <CardContent className="px-4 py-6 text-xs text-[var(--sx-text-muted)]">
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

  try {
    return JSON.parse(decodeURIComponent(atob(payload))) as SharedSnapshot;
  } catch {
    try {
      return JSON.parse(atob(payload)) as SharedSnapshot;
    } catch {
      return null;
    }
  }
}

function fmtTime(date: Date) {
  return date.toLocaleTimeString("en-US", { hour12: false });
}

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
  const scoreColor =
    score > 70
      ? "var(--sx-malicious)"
      : score > 40
        ? "var(--sx-suspicious)"
        : "var(--sx-safe)";
  const accentColor = getActiveAccent(active?.verdict);

  const ticker = useMemo(() => {
    const events: TickerEvent[] = [];
    for (const signalName of signalNames) {
      const signal = signals[signalName];
      if (signal.status === "success" && signal.data) {
        events.push({
          id: `${signalName}-${signal.durationMs}`,
          time: fmtTime(new Date()),
          text: `${signalLabels[signalName]}: ${getSignalSummary(signalName, signal.data)}`,
        });
      }
      if (signal.status === "error" && signal.error) {
        events.push({
          id: `${signalName}-err`,
          time: fmtTime(new Date()),
          text: `${signalLabels[signalName]}: ERROR - ${signal.error}`,
        });
      }
    }
    return events.slice(-8);
  }, [signals]);

  const done = useMemo(
    () =>
      signalNames.filter(
        (signalName) =>
          signals[signalName].status === "success" ||
          signals[signalName].status === "error",
      ).length,
    [signals],
  );

  const summarySignals = useMemo(
    () =>
      summarySignalOrder
        .filter(
          (signalName) =>
            signals[signalName].status === "success" ||
            signals[signalName].status === "error",
        )
        .slice(0, 3),
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
    const payload = JSON.stringify({
      verdict: result.verdict,
      url: result.url,
      summary: result.threatInfo?.summary ?? "",
      capturedAt: result.metadata.completedAt,
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
      <div className="sx-atmosphere" />
      {children}
    </div>
  );
}

const THRESHOLDS = [
  { value: 25, label: "SAFE" },
  { value: 40, label: "SUSP" },
  { value: 55, label: "MAL" },
  { value: 80, label: "CRIT" },
] as const;

export function HeaderMetrics() {
  const { done, live, score, scoreColor } = useAnalyzerRuntime();

  return (
    <div className="flex flex-wrap items-center justify-end gap-4">
      <div className="w-full max-w-44 sm:w-40">
        <div className="flex items-center gap-3">
          <span className="text-xs tracking-[0.15em] text-[var(--sx-text-muted)] uppercase">
            Threat
          </span>
          <div className="w-full">
            <div className="relative h-2 w-full overflow-hidden rounded-sm bg-[var(--sx-border)]">
              <div
                className="sx-threat-fill h-full rounded-sm transition-colors duration-300"
                style={{
                  width: `${Math.min(score, 100)}%`,
                  backgroundColor: scoreColor,
                }}
              />
            </div>
            <div className="relative mt-0.5 h-3">
              {THRESHOLDS.map((threshold) => (
                <div
                  key={threshold.value}
                  className="absolute flex flex-col items-center"
                  style={{
                    left: `${threshold.value}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <div className="h-1.5 w-px bg-[var(--sx-border-muted)]" />
                  <span className="text-[8px] tracking-[0.08em] text-[var(--sx-text-muted)] uppercase">
                    {threshold.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <span className="text-xs text-[var(--sx-text)]">{score}/100</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <span className="text-[10px] tracking-[0.16em] text-[var(--sx-text-muted)] uppercase">
          Scan readiness
        </span>
        <div className="flex items-center gap-2">
          <Badge variant={live ? "malicious" : "safe"}>
            {live ? "Live" : "Ready"}
          </Badge>
          <span className="text-xs tracking-[0.12em] text-[var(--sx-text-muted)]">
            {done}/8 signals
          </span>
        </div>
      </div>
    </div>
  );
}

export function AnalyzerWorkspace() {
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
    setSelectedResult,
    setSingleUrl,
    setViewMode,
    shareResult,
    sharedSnapshot,
    signals,
    singleUrl,
    startBatchScan,
    startSingleScan,
    viewMode,
    visibleSignals,
    done,
  } = useAnalyzerRuntime();

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_minmax(0,1fr)]">
      <div className="order-1 space-y-5 xl:order-2">
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value as Tab);
            setFormError(null);
          }}
          className="gap-4"
        >
          <TabsList aria-label="Scan mode" className="w-fit">
            <TabsTrigger value="single">Single Scan</TabsTrigger>
            <TabsTrigger value="batch">Batch Scan</TabsTrigger>
          </TabsList>

          <Card className="bg-[var(--sx-bg)]">
            <CardContent className="p-4">
              <TabsContent value="single" className="mt-0 outline-none">
                <SingleInput
                  url={singleUrl}
                  onUrlChange={setSingleUrl}
                  streaming={scan.state.isStreaming}
                  onSubmit={() => void startSingleScan()}
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

              <TabsContent value="batch" className="mt-0 outline-none">
                <BatchInput
                  value={batchInput}
                  onChange={setBatchInput}
                  streaming={batch.state.isStreaming}
                  onSubmit={() => void startBatchScan()}
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

              {formError && (
                <div className="mt-3 rounded-lg border border-[var(--sx-suspicious)] bg-[color-mix(in_srgb,var(--sx-suspicious)_8%,transparent)] px-3 py-2 text-xs text-[var(--sx-suspicious)]">
                  {formError}
                </div>
              )}
              {scan.state.error && (
                <div className="mt-3 rounded-lg border border-[var(--sx-malicious)] bg-[color-mix(in_srgb,var(--sx-malicious)_8%,transparent)] px-3 py-2 text-xs text-[var(--sx-malicious)]">
                  {scan.state.error.message}
                </div>
              )}
              {batch.state.error && (
                <div className="mt-3 rounded-lg border border-[var(--sx-malicious)] bg-[color-mix(in_srgb,var(--sx-malicious)_8%,transparent)] px-3 py-2 text-xs text-[var(--sx-malicious)]">
                  {batch.state.error.message}
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs>

        {activeTab === "single" ? (
          <VerdictHero
            result={active}
            isStreaming={scan.state.isStreaming}
            streamUrl={scan.state.url}
            sharedSnapshot={sharedSnapshot}
            completedSignals={done}
          />
        ) : (
          <BatchPanel
            items={batch.state.items}
            isStreaming={batch.state.isStreaming}
            results={batch.state.results}
            onSelectResult={setSelectedResult}
          />
        )}
        <EducationSection />
      </div>

      <div className="order-2 xl:order-1">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs tracking-[0.2em] text-[var(--sx-text-muted)] uppercase">
            Signal Grid
          </p>
          <div
            className="inline-flex rounded-lg border border-[var(--sx-border)] bg-[var(--sx-bg)] p-1"
            role="group"
            aria-label="Signal view mode"
          >
            <Button
              type="button"
              variant="view"
              size="sm"
              aria-pressed={viewMode === "summary"}
              onClick={() => setViewMode("summary")}
              className="min-w-24"
            >
              Summary
            </Button>
            <Button
              type="button"
              variant="view"
              size="sm"
              aria-pressed={viewMode === "full"}
              onClick={() => setViewMode("full")}
              className="min-w-20"
            >
              Full
            </Button>
          </div>
        </div>

        {activeTab === "single" ? (
          <div className="transition-opacity duration-150">
            {visibleSignals.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {visibleSignals.map((signalName, index) => (
                  <SignalCard
                    key={signalName}
                    name={signalName}
                    result={signals[signalName]}
                    viewMode={viewMode}
                    isStreaming={live}
                    onRetry={() => void startSingleScan()}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-dashed bg-[var(--sx-surface)]">
                <CardContent className="px-6 py-12 text-center">
                  <p className="text-xs tracking-[0.12em] text-[var(--sx-text-muted)] uppercase">
                    Awaiting scan — enter a URL to begin analysis
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function HistoryRail() {
  const { historyEvent, selectHistoryEntry } = useAnalyzerRuntime();
  const {
    addResult,
    clearHistory,
    filteredEntries,
    filterVerdict,
    historyQuery,
    setFilterVerdict,
    setHistoryQuery,
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
    />
  );
}

export function FooterTicker() {
  const { live, ticker } = useAnalyzerRuntime();

  return (
    <AppFooter>
      {ticker.length > 0 ? (
        <div className="flex w-full overflow-hidden whitespace-nowrap">
          <div className="sx-marquee flex items-center gap-6 text-xs text-[var(--sx-text-muted)]">
            {[...ticker, ...ticker].map((event, index) => (
              <span key={`${event.id}-${index}`} className="shrink-0">
                <span className="text-[var(--sx-info)]">{event.time}</span>
                <span className="mx-1 text-[var(--sx-border-muted)]">--</span>
                <span>{event.text}</span>
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="sx-font-sans flex items-center gap-4 text-xs text-[var(--sx-text-muted)]">
          <span>SCRUTINIX</span>
          <span className="text-[var(--sx-border-muted)]">|</span>
          <span>8 SIGNALS</span>
          <span className="text-[var(--sx-border-muted)]">|</span>
          <span>NDJSON</span>
          <span className="text-[var(--sx-border-muted)]">|</span>
          <span>{live ? "STREAM ACTIVE" : "AWAITING TARGET"}</span>
        </div>
      )}
    </AppFooter>
  );
}

export function ShellHeader() {
  return (
    <AppHeader>
      <HeaderMetrics />
    </AppHeader>
  );
}
