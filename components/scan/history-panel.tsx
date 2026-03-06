"use client";

import { Download, Search, Trash2 } from "lucide-react";
import { useDeferredValue } from "react";

import { StatusPill } from "@/components/shared/status-pill";
import {
  downloadTextFile,
  resultsToCsv,
  resultsToJson,
} from "@/lib/client/export";
import { formatDisplayUrl } from "@/lib/domain/url";
import type { HistoryEntry, Verdict } from "@/lib/domain/types";

interface HistoryPanelProps {
  entries: HistoryEntry[];
  historyQuery: string;
  onHistoryQueryChange: (value: string) => void;
  filterVerdict: Verdict | "all";
  onFilterVerdictChange: (value: Verdict | "all") => void;
  onSelect: (entry: HistoryEntry) => void;
  onClear: () => void;
}

export function HistoryPanel({
  entries,
  historyQuery,
  onHistoryQueryChange,
  filterVerdict,
  onFilterVerdictChange,
  onSelect,
  onClear,
}: HistoryPanelProps) {
  const deferredQuery = useDeferredValue(historyQuery);
  const headingId = "history-panel-heading";

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-[32px] border border-black/10 bg-[color:var(--card)] p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.8)] dark:border-white/10"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.22em] text-[color:var(--muted-foreground)] uppercase">
            History
          </p>
          <h2
            id={headingId}
            className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]"
          >
            IndexedDB scan archive
          </h2>
        </div>
        {entries.length > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-2 text-xs font-semibold tracking-[0.18em] text-[color:var(--foreground)] uppercase dark:border-white/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
        ) : null}
      </div>

      <div className="mt-5 space-y-3">
        <label className="relative block">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[color:var(--muted-foreground)]" />
          <input
            value={historyQuery}
            onChange={(event) => onHistoryQueryChange(event.target.value)}
            placeholder="Search scanned URLs"
            className="w-full rounded-2xl border border-black/10 bg-white/70 px-10 py-3 text-sm ring-0 transition outline-none placeholder:text-[color:var(--muted-foreground)] focus:border-[color:var(--accent)] dark:border-white/10 dark:bg-white/[0.04]"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {(
            [
              "all",
              "safe",
              "suspicious",
              "malicious",
              "critical",
              "error",
            ] as const
          ).map((tone) => (
            <button
              key={tone}
              type="button"
              onClick={() => onFilterVerdictChange(tone)}
              className={`rounded-full px-3 py-2 text-xs font-semibold tracking-[0.18em] uppercase transition ${
                filterVerdict === tone
                  ? "bg-[color:var(--accent)] text-[color:var(--accent-foreground)]"
                  : "bg-black/5 text-[color:var(--muted-foreground)] dark:bg-white/10"
              }`}
            >
              {tone}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() =>
            downloadTextFile("scan-history.csv", resultsToCsv(entries))
          }
          className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-2 text-xs font-semibold tracking-[0.18em] uppercase dark:border-white/10"
        >
          <Download className="h-3.5 w-3.5" />
          CSV
        </button>
        <button
          type="button"
          onClick={() =>
            downloadTextFile(
              "scan-history.json",
              resultsToJson(entries),
              "application/json",
            )
          }
          className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-2 text-xs font-semibold tracking-[0.18em] uppercase dark:border-white/10"
        >
          <Download className="h-3.5 w-3.5" />
          JSON
        </button>
      </div>

      <p className="mt-4 text-sm text-[color:var(--muted-foreground)]">
        {deferredQuery
          ? `Filtering results for "${deferredQuery}".`
          : "Search by URL or summary text."}
      </p>

      <div className="mt-5 space-y-3">
        {entries.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-black/10 px-4 py-6 text-sm text-[color:var(--muted-foreground)] dark:border-white/10">
            Completed scans will persist here on this device only.
          </div>
        ) : (
          entries.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => onSelect(entry)}
              className="w-full rounded-[24px] border border-black/10 bg-black/[0.02] px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-[color:var(--accent)] dark:border-white/10 dark:bg-white/[0.03]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-[color:var(--foreground)]">
                    {formatDisplayUrl(entry.url)}
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                    {entry.threatInfo?.summary ?? "No summary"}
                  </p>
                  <p className="mt-2 text-xs tracking-[0.16em] text-[color:var(--muted-foreground)] uppercase">
                    {new Date(entry.savedAt).toLocaleString()}
                  </p>
                </div>
                <StatusPill
                  tone={
                    entry.verdict === "safe"
                      ? "safe"
                      : entry.verdict === "suspicious"
                        ? "suspicious"
                        : entry.verdict === "malicious"
                          ? "malicious"
                          : entry.verdict === "critical"
                            ? "critical"
                            : "error"
                  }
                >
                  {entry.verdict}
                </StatusPill>
              </div>
            </button>
          ))
        )}
      </div>
    </section>
  );
}
