"use client";

import { clsx } from "clsx";
import {
  ArrowRight,
  Download,
  Link2,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { startTransition, useMemo, useState } from "react";

import { HistoryPanel } from "@/components/scan/history-panel";
import { SignalCard } from "@/components/scan/signal-card";
import { StatusPill } from "@/components/shared/status-pill";
import { useBatchStream } from "@/hooks/use-batch-stream";
import { useScanHistory } from "@/hooks/use-scan-history";
import { useScanStream } from "@/hooks/use-scan-stream";
import {
  downloadTextFile,
  resultsToCsv,
  resultsToJson,
} from "@/lib/client/export";
import { formatDisplayUrl, normalizeUrlInput } from "@/lib/domain/url";
import { signalNames, type AnalysisResult } from "@/lib/domain/types";

type Tab = "single" | "batch";
type ViewMode = "summary" | "full";

interface SharedSnapshot {
  verdict: string;
  url: string;
  summary: string;
  capturedAt: string;
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

export function AnalyzerApp() {
  const [activeTab, setActiveTab] = useState<Tab>("single");
  const [viewMode, setViewMode] = useState<ViewMode>("summary");
  const [singleUrl, setSingleUrl] = useState("");
  const [batchInput, setBatchInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(
    null,
  );
  const [sharedSnapshot] = useState<SharedSnapshot | null>(() =>
    readSharedSnapshot(),
  );

  const history = useScanHistory();
  const singleScan = useScanStream((result) => {
    startTransition(() => {
      setSelectedResult(result);
    });
    history.addResult(result);
  });
  const batchScan = useBatchStream((result) => {
    history.addResult(result);
  });

  const activeResult = selectedResult ?? singleScan.state.result;
  const displaySignals = activeResult?.signals ?? singleScan.state.signals;
  const topSignals = useMemo(() => {
    return summarySignalOrder
      .map((name) => ({
        name,
        result: displaySignals[name],
      }))
      .filter(
        (entry) =>
          entry.result.status === "success" || entry.result.status === "error",
      )
      .slice(0, 3);
  }, [displaySignals]);

  const handleSingleSubmit = async () => {
    setFormError(null);
    const validation = normalizeUrlInput(singleUrl);
    if (!validation.ok) {
      setFormError(validation.error);
      return;
    }

    await singleScan.startScan(singleUrl);
  };

  const handleBatchSubmit = async () => {
    setFormError(null);
    const urls = batchInput
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    if (urls.length === 0) {
      setFormError("Add at least one URL to the batch.");
      return;
    }

    if (urls.length > 10) {
      setFormError("Batch scans are capped at 10 URLs.");
      return;
    }

    const invalid = urls
      .map((item) => normalizeUrlInput(item))
      .find((result) => !result.ok);
    if (invalid && !invalid.ok) {
      setFormError(invalid.error);
      return;
    }

    await batchScan.startBatch(urls);
  };

  const handleShare = async (result: AnalysisResult) => {
    const payload = btoa(
      JSON.stringify({
        verdict: result.verdict,
        url: result.url,
        summary: result.threatInfo?.summary ?? "No summary available.",
        capturedAt: result.metadata.completedAt,
      }),
    );
    const shareUrl = new URL(window.location.href);
    shareUrl.searchParams.set("shared", payload);
    await navigator.clipboard.writeText(shareUrl.toString());
  };

  const handleRescan = async (url: string) => {
    setFormError(null);
    setSelectedResult(null);
    setSingleUrl(url);
    await singleScan.startScan(url);
  };

  return (
    <div className="min-h-screen">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-8rem] left-[-12rem] h-[28rem] w-[28rem] rounded-full bg-[color:var(--spotlight-a)] blur-3xl" />
        <div className="absolute top-[8rem] right-[-10rem] h-[26rem] w-[26rem] rounded-full bg-[color:var(--spotlight-b)] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_42%),linear-gradient(to_bottom,transparent,rgba(0,0,0,0.04))]" />
      </div>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <section className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
          <div className="space-y-8">
            <div className="rounded-[36px] border border-black/10 bg-[color:var(--hero-surface)] px-6 py-8 shadow-[0_28px_90px_-60px_rgba(22,35,30,0.85)] sm:px-8">
              <div className="flex flex-wrap items-center gap-3">
                <StatusPill tone="neutral">8 signals</StatusPill>
                <StatusPill tone="neutral">NDJSON streaming</StatusPill>
                <StatusPill tone="neutral">IndexedDB history</StatusPill>
              </div>
              <div className="mt-6 max-w-3xl">
                <p className="text-sm tracking-[0.28em] text-[color:var(--muted-foreground)] uppercase">
                  Portfolio-grade malicious link triage
                </p>
                <h1 className="mt-4 text-5xl font-semibold tracking-[-0.04em] text-[color:var(--foreground)] sm:text-6xl">
                  Scan links in layers, not guesses.
                </h1>
                <p className="mt-5 max-w-2xl text-lg text-[color:var(--muted-foreground)]">
                  VirusTotal, Safe Browsing, community feeds, TLS, DNS, redirect
                  chain, registration data, and ML heuristics arrive as they
                  resolve so you can decide fast without hiding the raw signal
                  quality.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("single")}
                  className={tabButton(activeTab === "single")}
                >
                  Single scan
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("batch")}
                  className={tabButton(activeTab === "batch")}
                >
                  Batch scan
                </button>
                <div className="ml-auto inline-flex rounded-full border border-black/10 bg-white/60 p-1 dark:border-white/10 dark:bg-white/5">
                  <button
                    type="button"
                    onClick={() => setViewMode("summary")}
                    className={viewModeButton(viewMode === "summary")}
                  >
                    Summary
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("full")}
                    className={viewModeButton(viewMode === "full")}
                  >
                    Full report
                  </button>
                </div>
              </div>
            </div>

            <section className="rounded-[32px] border border-black/10 bg-[color:var(--card)] p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.8)]">
              {activeTab === "single" ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs tracking-[0.2em] text-[color:var(--muted-foreground)] uppercase">
                      Single URL
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">
                      Stream a live multi-signal report
                    </h2>
                  </div>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-[color:var(--foreground)]">
                      URL to inspect
                    </span>
                    <input
                      value={singleUrl}
                      onChange={(event) => setSingleUrl(event.target.value)}
                      placeholder="example.com, https://login.example.org, https://xn--pple-43d.com"
                      className="w-full rounded-[24px] border border-black/10 bg-white/70 px-5 py-4 text-base transition outline-none focus:border-[color:var(--accent)] dark:border-white/10 dark:bg-white/[0.04]"
                    />
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSingleSubmit}
                      disabled={singleScan.state.isStreaming}
                      className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold tracking-[0.18em] text-[color:var(--accent-foreground)] uppercase transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {singleScan.state.isStreaming ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                      Analyze URL
                    </button>
                    {activeResult ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            downloadTextFile(
                              "single-scan.json",
                              JSON.stringify(activeResult, null, 2),
                              "application/json",
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-3 text-xs font-semibold tracking-[0.18em] uppercase dark:border-white/10"
                        >
                          <Download className="h-3.5 w-3.5" />
                          JSON
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShare(activeResult)}
                          className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-3 text-xs font-semibold tracking-[0.18em] uppercase dark:border-white/10"
                        >
                          <Link2 className="h-3.5 w-3.5" />
                          Share link
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleRescan(activeResult.url)}
                          className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-3 text-xs font-semibold tracking-[0.18em] uppercase dark:border-white/10"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Re-scan
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs tracking-[0.2em] text-[color:var(--muted-foreground)] uppercase">
                      Batch
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">
                      Stream up to 10 URLs with a concurrency cap of 3
                    </h2>
                  </div>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-[color:var(--foreground)]">
                      One URL per line
                    </span>
                    <textarea
                      value={batchInput}
                      onChange={(event) => setBatchInput(event.target.value)}
                      rows={7}
                      placeholder={
                        "https://example.com\nhttps://malicious.test\nhttps://suspicious.example"
                      }
                      className="w-full rounded-[24px] border border-black/10 bg-white/70 px-5 py-4 text-base transition outline-none focus:border-[color:var(--accent)] dark:border-white/10 dark:bg-white/[0.04]"
                    />
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleBatchSubmit}
                      disabled={batchScan.state.isStreaming}
                      className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold tracking-[0.18em] text-[color:var(--accent-foreground)] uppercase transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {batchScan.state.isStreaming ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                      Start batch
                    </button>
                    {batchScan.state.results.length > 0 ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            downloadTextFile(
                              "batch-results.csv",
                              resultsToCsv(batchScan.state.results),
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-3 text-xs font-semibold tracking-[0.18em] uppercase dark:border-white/10"
                        >
                          <Download className="h-3.5 w-3.5" />
                          CSV
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            downloadTextFile(
                              "batch-results.json",
                              resultsToJson(batchScan.state.results),
                              "application/json",
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-3 text-xs font-semibold tracking-[0.18em] uppercase dark:border-white/10"
                        >
                          <Download className="h-3.5 w-3.5" />
                          JSON
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              )}

              {formError ? (
                <div className="mt-5 rounded-[24px] border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
                  {formError}
                </div>
              ) : null}
              {singleScan.state.error ? (
                <div className="mt-5 rounded-[24px] border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
                  {singleScan.state.error.message}
                </div>
              ) : null}
              {batchScan.state.error ? (
                <div className="mt-5 rounded-[24px] border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
                  {batchScan.state.error.message}
                </div>
              ) : null}
            </section>

            {activeTab === "single" ? (
              <section className="space-y-6">
                <ResultHero
                  result={activeResult}
                  isStreaming={singleScan.state.isStreaming}
                  streamUrl={singleScan.state.url}
                  sharedSnapshot={sharedSnapshot}
                />
                {viewMode === "summary" ? (
                  <div className="grid gap-4 md:grid-cols-3">
                    {topSignals.length > 0
                      ? topSignals.map((signal) => (
                          <SignalCard
                            key={signal.name}
                            name={signal.name}
                            result={signal.result}
                            viewMode="summary"
                            onRetry={() => void handleSingleSubmit()}
                          />
                        ))
                      : signalNames
                          .slice(0, 3)
                          .map((name) => (
                            <SignalCard
                              key={name}
                              name={name}
                              result={displaySignals[name]}
                              viewMode="summary"
                              onRetry={() => void handleSingleSubmit()}
                            />
                          ))}
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {signalNames.map((name) => (
                      <SignalCard
                        key={name}
                        name={name}
                        result={displaySignals[name]}
                        viewMode="full"
                        onRetry={() => void handleSingleSubmit()}
                      />
                    ))}
                  </div>
                )}
              </section>
            ) : (
              <BatchResultsPanel
                items={batchScan.state.items}
                isStreaming={batchScan.state.isStreaming}
                onSelectResult={setSelectedResult}
              />
            )}
          </div>

          <div className="space-y-8">
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

            <section
              aria-labelledby="reading-results-heading"
              className="rounded-[32px] border border-black/10 bg-[color:var(--card)] p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.8)] dark:border-white/10"
            >
              <p className="text-xs tracking-[0.22em] text-[color:var(--muted-foreground)] uppercase">
                Reading the results
              </p>
              <h2
                id="reading-results-heading"
                className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]"
              >
                Summary mode for triage. Full report for evidence.
              </h2>
              <div className="mt-5 space-y-4 text-sm text-[color:var(--muted-foreground)]">
                <div className="rounded-[24px] bg-black/[0.03] px-4 py-4 dark:bg-white/[0.04]">
                  <div className="flex items-center gap-2 text-[color:var(--foreground)]">
                    <ShieldAlert className="h-4 w-4" />
                    High-confidence indicators
                  </div>
                  <p className="mt-2">
                    Safe Browsing, threat feeds, and multi-engine detections
                    outweigh cosmetic signals.
                  </p>
                </div>
                <div className="rounded-[24px] bg-black/[0.03] px-4 py-4 dark:bg-white/[0.04]">
                  <div className="flex items-center gap-2 text-[color:var(--foreground)]">
                    <Sparkles className="h-4 w-4" />
                    Local-only resilience
                  </div>
                  <p className="mt-2">
                    DNS, TLS, redirect chain, and registration data still
                    provide value even when third-party APIs are unavailable.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}

function readSharedSnapshot(): SharedSnapshot | null {
  if (typeof window === "undefined") {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  const shared = params.get("shared");
  if (!shared) {
    return null;
  }

  try {
    return JSON.parse(atob(shared)) as SharedSnapshot;
  } catch {
    return null;
  }
}

function ResultHero({
  result,
  isStreaming,
  streamUrl,
  sharedSnapshot,
}: {
  result: AnalysisResult | null;
  isStreaming: boolean;
  streamUrl: string;
  sharedSnapshot: SharedSnapshot | null;
}) {
  if (!result && !isStreaming && !sharedSnapshot) {
    return (
      <section className="rounded-[32px] border border-dashed border-black/10 bg-[color:var(--card)] px-6 py-7 text-[color:var(--muted-foreground)] dark:border-white/10">
        Submit a link to start a streamed scan. Local signals arrive even when
        third-party providers are missing or rate-limited.
      </section>
    );
  }

  const verdictTone = result
    ? result.verdict === "safe"
      ? "safe"
      : result.verdict === "suspicious"
        ? "suspicious"
        : result.verdict === "malicious"
          ? "malicious"
          : result.verdict === "critical"
            ? "critical"
            : "error"
    : "neutral";

  return (
    <section className="rounded-[32px] border border-black/10 bg-[color:var(--card)] px-6 py-7 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.8)] dark:border-white/10">
      <div className="flex flex-wrap items-center gap-3">
        <StatusPill tone={verdictTone}>
          {result
            ? result.verdict
            : isStreaming
              ? "streaming"
              : "shared snapshot"}
        </StatusPill>
        {isStreaming ? (
          <StatusPill tone="neutral">Receiving signal updates</StatusPill>
        ) : null}
      </div>
      <h2 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">
        {result
          ? formatDisplayUrl(result.url)
          : sharedSnapshot
            ? formatDisplayUrl(sharedSnapshot.url)
            : formatDisplayUrl(streamUrl)}
      </h2>
      <p className="mt-3 max-w-3xl text-base text-[color:var(--muted-foreground)]">
        {result?.threatInfo?.summary ??
          sharedSnapshot?.summary ??
          "Signal cards will populate independently as each provider finishes."}
      </p>
      {result?.threatInfo?.reasons?.length ? (
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {result.threatInfo.reasons.slice(0, 4).map((reason) => (
            <li
              key={reason}
              className="rounded-[22px] bg-black/[0.03] px-4 py-4 text-sm text-[color:var(--foreground)] dark:bg-white/[0.04]"
            >
              {reason}
            </li>
          ))}
        </ul>
      ) : null}
      {result ? (
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-[color:var(--muted-foreground)]">
          <span>Score: {result.threatInfo?.score ?? 0}</span>
          <span>
            Confidence:{" "}
            {((result.threatInfo?.confidence ?? 0) * 100).toFixed(0)}%
          </span>
          <span>
            Completed: {new Date(result.metadata.completedAt).toLocaleString()}
          </span>
        </div>
      ) : null}
    </section>
  );
}

function BatchResultsPanel({
  items,
  isStreaming,
  onSelectResult,
}: {
  items: Array<{
    index: number;
    url: string;
    status: "pending" | "complete";
    result: AnalysisResult | null;
  }>;
  isStreaming: boolean;
  onSelectResult: (result: AnalysisResult) => void;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[32px] border border-black/10 bg-[color:var(--card)] p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.8)] dark:border-white/10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.2em] text-[color:var(--muted-foreground)] uppercase">
            Batch stream
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">
            Per-URL completion status
          </h2>
        </div>
        {isStreaming ? (
          <StatusPill tone="neutral">In progress</StatusPill>
        ) : (
          <StatusPill tone="safe">Complete</StatusPill>
        )}
      </div>
      <div className="mt-5 overflow-hidden rounded-[28px] border border-black/10 dark:border-white/10">
        <table className="min-w-full divide-y divide-black/10 text-left text-sm dark:divide-white/10">
          <thead className="bg-black/[0.03] dark:bg-white/[0.04]">
            <tr>
              <th className="px-4 py-3 font-medium text-[color:var(--muted-foreground)]">
                URL
              </th>
              <th className="px-4 py-3 font-medium text-[color:var(--muted-foreground)]">
                Verdict
              </th>
              <th className="px-4 py-3 font-medium text-[color:var(--muted-foreground)]">
                Status
              </th>
              <th className="px-4 py-3 font-medium text-[color:var(--muted-foreground)]">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10 dark:divide-white/10">
            {items.map((item) => (
              <tr key={`${item.index}-${item.url}`}>
                <td className="px-4 py-4 text-[color:var(--foreground)]">
                  {formatDisplayUrl(item.url)}
                </td>
                <td className="px-4 py-4">
                  {item.result ? (
                    <StatusPill
                      tone={
                        item.result.verdict === "safe"
                          ? "safe"
                          : item.result.verdict === "suspicious"
                            ? "suspicious"
                            : item.result.verdict === "malicious"
                              ? "malicious"
                              : item.result.verdict === "critical"
                                ? "critical"
                                : "error"
                      }
                    >
                      {item.result.verdict}
                    </StatusPill>
                  ) : (
                    <StatusPill tone="neutral">pending</StatusPill>
                  )}
                </td>
                <td className="px-4 py-4 text-[color:var(--muted-foreground)]">
                  {item.status}
                </td>
                <td className="px-4 py-4">
                  {item.result ? (
                    <button
                      type="button"
                      onClick={() => onSelectResult(item.result!)}
                      className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-2 text-xs font-semibold tracking-[0.18em] uppercase dark:border-white/10"
                    >
                      Inspect
                    </button>
                  ) : (
                    <span className="text-xs tracking-[0.18em] text-[color:var(--muted-foreground)] uppercase">
                      Waiting
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function tabButton(active: boolean) {
  return clsx(
    "rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em] transition",
    active
      ? "bg-[color:var(--foreground)] text-[color:var(--background)]"
      : "bg-black/5 text-[color:var(--muted-foreground)] dark:bg-white/10",
  );
}

function viewModeButton(active: boolean) {
  return clsx(
    "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition",
    active
      ? "bg-[color:var(--accent)] text-[color:var(--accent-foreground)]"
      : "text-[color:var(--muted-foreground)]",
  );
}
