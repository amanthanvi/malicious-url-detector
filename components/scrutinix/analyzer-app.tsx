"use client";

import { clsx } from "clsx";
import dynamic from "next/dynamic";
import { startTransition, useMemo, useState } from "react";
import { toast } from "sonner";

import { AppFooter } from "@/components/scrutinix/app-footer";
import { AppHeader } from "@/components/scrutinix/app-header";
import { ScrutinixErrorBoundary } from "@/components/scrutinix/error-boundary";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  downloadTextFile,
  resultsToCsv,
  resultsToJson,
} from "@/lib/client/export";
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
  const p = new URLSearchParams(window.location.search).get("shared");
  if (!p) return null;
  try {
    return JSON.parse(decodeURIComponent(atob(p))) as SharedSnapshot;
  } catch {
    try {
      return JSON.parse(atob(p)) as SharedSnapshot;
    } catch {
      return null;
    }
  }
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour12: false });
}

function AnalyzerAppInner() {
  const [activeTab, setActiveTab] = useState<Tab>("single");
  const [viewMode, setViewMode] = useState<ViewMode>("summary");
  const [singleUrl, setSingleUrl] = useState("");
  const [batchInput, setBatchInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(
    null,
  );
  const [sharedSnap] = useState<SharedSnapshot | null>(() => readSnapshot());

  const history = useScanHistory();
  const scan1 = useScanStream((result) => {
    startTransition(() => setSelectedResult(result));
    history.addResult(result);
  });
  const scanN = useBatchStream((result) => history.addResult(result));
  const active = selectedResult ?? scan1.state.result;
  const sigs = active?.signals ?? scan1.state.signals;

  const ticker = useMemo(() => {
    const events: TickerEvent[] = [];
    for (const signalName of signalNames) {
      const signal = sigs[signalName];
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
  }, [sigs]);

  const done = useMemo(
    () =>
      signalNames.filter(
        (signalName) =>
          sigs[signalName].status === "success" ||
          sigs[signalName].status === "error",
      ).length,
    [sigs],
  );

  const summarySignals = useMemo(
    () =>
      summarySignalOrder
        .filter(
          (signalName) =>
            sigs[signalName].status === "success" ||
            sigs[signalName].status === "error",
        )
        .slice(0, 3),
    [sigs],
  );

  const goSingle = async () => {
    setFormError(null);
    const value = normalizeUrlInput(singleUrl);
    if (!value.ok) {
      setFormError(value.error);
      return;
    }
    await scan1.startScan(value.value.normalizedUrl);
  };

  const goBatch = async () => {
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
    await scanN.startBatch(urls);
  };

  const goShare = async (result: AnalysisResult) => {
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
  };

  const goRescan = async (url: string) => {
    setFormError(null);
    setSelectedResult(null);
    setSingleUrl(url);
    setActiveTab("single");
    await scan1.startScan(url);
  };

  const live = scan1.state.isStreaming || scanN.state.isStreaming;
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
  const hasActivity = live || active !== null;
  const visibleSignals =
    viewMode === "summary" && summarySignals.length > 0
      ? summarySignals
      : hasActivity
        ? signalNames
        : [];

  return (
    <div
      className={clsx(
        "sx-radar-bg flex min-h-screen flex-col",
        isMalicious && "sx-alert",
      )}
      style={{ "--sx-active-accent": accentColor } as React.CSSProperties}
    >
      <div className="sx-atmosphere" />

      <AppHeader
        score={score}
        scoreColor={scoreColor}
        done={done}
        live={live}
      />

      <main className="relative z-10 flex-1 px-4 py-5 sm:px-6 xl:px-8">
        <div className="mx-auto grid max-w-[1600px] gap-5 md:grid-cols-[minmax(0,1fr)_280px] lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[1fr_minmax(0,2fr)_320px]">
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
                      streaming={scan1.state.isStreaming}
                      onSubmit={() => void goSingle()}
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
                      onShare={() => active && void goShare(active)}
                      onRescan={() => active && void goRescan(active.url)}
                    />
                  </TabsContent>

                  <TabsContent value="batch" className="mt-0 outline-none">
                    <BatchInput
                      value={batchInput}
                      onChange={setBatchInput}
                      streaming={scanN.state.isStreaming}
                      onSubmit={() => void goBatch()}
                      hasResults={scanN.state.results.length > 0}
                      onCsv={() => {
                        downloadTextFile(
                          "batch.csv",
                          resultsToCsv(scanN.state.results),
                        );
                        toast.success("Exported batch.csv");
                      }}
                      onJson={() => {
                        downloadTextFile(
                          "batch.json",
                          resultsToJson(scanN.state.results),
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
                  {scan1.state.error && (
                    <div className="mt-3 rounded-lg border border-[var(--sx-malicious)] bg-[color-mix(in_srgb,var(--sx-malicious)_8%,transparent)] px-3 py-2 text-xs text-[var(--sx-malicious)]">
                      {scan1.state.error.message}
                    </div>
                  )}
                  {scanN.state.error && (
                    <div className="mt-3 rounded-lg border border-[var(--sx-malicious)] bg-[color-mix(in_srgb,var(--sx-malicious)_8%,transparent)] px-3 py-2 text-xs text-[var(--sx-malicious)]">
                      {scanN.state.error.message}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Tabs>

            {activeTab === "single" ? (
              <VerdictHero
                result={active}
                isStreaming={scan1.state.isStreaming}
                streamUrl={scan1.state.url}
                sharedSnapshot={sharedSnap}
                completedSignals={done}
              />
            ) : (
              <BatchPanel
                items={scanN.state.items}
                isStreaming={scanN.state.isStreaming}
                results={scanN.state.results}
                onSelectResult={setSelectedResult}
              />
            )}
            <EducationSection />
          </div>

          <div className="order-3 xl:order-1">
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
                        result={sigs[signalName]}
                        viewMode={viewMode}
                        isStreaming={live}
                        onRetry={() => void goSingle()}
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

          <div className="order-2 xl:order-3">
            <HistoryPanel
              entries={history.filteredEntries}
              historyQuery={history.historyQuery}
              onHistoryQueryChange={history.setHistoryQuery}
              filterVerdict={history.filterVerdict}
              onFilterVerdictChange={history.setFilterVerdict}
              onSelect={(entry) => {
                setSelectedResult(entry);
                setSingleUrl(entry.url);
                setActiveTab("single");
              }}
              onClear={() => void history.clearHistory()}
            />
          </div>
        </div>
      </main>

      <AppFooter ticker={ticker} live={live} />
    </div>
  );
}

export function AnalyzerApp() {
  return (
    <ScrutinixErrorBoundary>
      <AnalyzerAppInner />
    </ScrutinixErrorBoundary>
  );
}
