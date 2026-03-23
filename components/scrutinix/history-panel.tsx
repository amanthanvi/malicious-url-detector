"use client";

import { Download, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  downloadTextFile,
  resultsToCsv,
  resultsToJson,
} from "@/lib/client/export";
import { formatDisplayUrl } from "@/lib/domain/url";
import type { HistoryEntry, Verdict } from "@/lib/domain/types";
import { verdictColor } from "@/components/shared/scrutinix-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HistoryPanelProps {
  entries: HistoryEntry[];
  historyQuery: string;
  onHistoryQueryChange: (value: string) => void;
  filterVerdict: Verdict | "all";
  onFilterVerdictChange: (value: Verdict | "all") => void;
  onSelect: (entry: HistoryEntry) => void;
  onClear: () => void;
  canUndoClear: boolean;
  onUndoClear: () => void;
}

const verdictFilters = [
  "all",
  "safe",
  "suspicious",
  "malicious",
  "critical",
  "error",
] as const;

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (sameDay) {
    return `Today ${time}`;
  }

  if (d.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${time}`;
  }

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HistoryPanel({
  entries,
  historyQuery,
  onHistoryQueryChange,
  filterVerdict,
  onFilterVerdictChange,
  onSelect,
  onClear,
  canUndoClear,
  onUndoClear,
}: HistoryPanelProps) {
  const [confirmClear, setConfirmClear] = useState(false);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
      }
    };
  }, []);

  const handleClear = () => {
    if (confirmClear) {
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
        clearTimerRef.current = null;
      }
      onClear();
      setConfirmClear(false);
      return;
    }

    setConfirmClear(true);
    clearTimerRef.current = setTimeout(() => {
      setConfirmClear(false);
      clearTimerRef.current = null;
    }, 3000);
  };

  const statusText = historyQuery
    ? `Filtering: "${historyQuery}"`
    : `${entries.length} scan${entries.length === 1 ? "" : "s"} archived`;

  return (
    <section
      className="sx-panel flex h-full max-h-[calc(100vh-7.5rem)] min-h-[24rem] flex-col overflow-hidden rounded-[1.8rem] border border-[var(--sx-border)]"
      aria-label="Scan history"
      role="region"
    >
      <div className="border-b border-[var(--sx-border)] px-5 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-[11px] tracking-[0.18em] text-[var(--sx-text-muted)] uppercase">
                History rail
              </p>
              <Badge variant="neutral">{entries.length}</Badge>
            </div>
            <h2 className="sx-font-sans text-xl font-semibold text-[var(--sx-text)]">
              Recent verdicts stay local.
            </h2>
            <p className="text-sm leading-6 text-[var(--sx-text-soft)]">
              {statusText}
            </p>
            {canUndoClear ? (
              <p className="text-sm leading-6 text-[var(--sx-text-soft)]">
                History was cleared locally. Undo restores the previous archive.
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canUndoClear ? (
              <Button
                type="button"
                onClick={onUndoClear}
                variant="ghost"
                size="sm"
                aria-label="Undo clearing scan history"
              >
                Undo clear
              </Button>
            ) : null}
            {entries.length > 0 ? (
              <>
                <Button
                  type="button"
                  onClick={() =>
                    downloadTextFile("scan-history.csv", resultsToCsv(entries))
                  }
                  variant="subtle"
                  size="sm"
                  aria-label="Export history as CSV"
                >
                  <Download className="h-3.5 w-3.5" />
                  CSV
                </Button>
                <Button
                  type="button"
                  onClick={() =>
                    downloadTextFile(
                      "scan-history.json",
                      resultsToJson(entries),
                      "application/json",
                    )
                  }
                  variant="subtle"
                  size="sm"
                  aria-label="Export history as JSON"
                >
                  <Download className="h-3.5 w-3.5" />
                  JSON
                </Button>
                <Button
                  type="button"
                  onClick={handleClear}
                  variant={confirmClear ? "dangerSolid" : "danger"}
                  size="sm"
                  aria-label={
                    confirmClear
                      ? "Confirm clear all history"
                      : "Clear all history"
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {confirmClear ? "Confirm" : "Clear"}
                </Button>
              </>
            ) : null}
          </div>
        </div>

        <div className="mt-4">
          <Input
            value={historyQuery}
            onChange={(event) => onHistoryQueryChange(event.target.value)}
            placeholder="Filter by URL or verdict"
            aria-label="Filter scan history"
            className="h-11"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {verdictFilters.map((tone) => (
            <Button
              key={tone}
              type="button"
              onClick={() => onFilterVerdictChange(tone)}
              aria-pressed={filterVerdict === tone}
              variant={filterVerdict === tone ? "view" : "ghost"}
              size="sm"
              className="rounded-full"
            >
              {tone}
            </Button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 px-3 py-3">
        {entries.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-[1.4rem] border border-dashed border-[var(--sx-border-muted)] px-5 py-8 text-center text-sm leading-6 text-[var(--sx-text-soft)]">
            {historyQuery || filterVerdict !== "all"
              ? "No scans match the current filter."
              : canUndoClear
                ? "History cleared locally. Undo is still available."
                : "Completed scans persist here via IndexedDB."}
          </div>
        ) : (
          <ScrollArea className="h-full pr-1">
            <div className="space-y-2 pr-2">
              {entries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => onSelect(entry)}
                  className="group w-full rounded-[1.35rem] border border-[var(--sx-border)] bg-[color-mix(in_srgb,var(--sx-surface)_76%,transparent)] px-4 py-4 text-left transition hover:border-[var(--sx-active-accent)] hover:bg-[color-mix(in_srgb,var(--sx-surface-strong)_88%,transparent)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[10px] tracking-[0.14em] text-[var(--sx-text-muted)] uppercase">
                      {formatTimestamp(entry.savedAt)}
                    </span>
                    <span
                      className="rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase"
                      style={{
                        color: verdictColor(entry.verdict),
                        backgroundColor: `color-mix(in_srgb, ${verdictColor(entry.verdict)} 12%, transparent)`,
                      }}
                    >
                      {entry.verdict}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--sx-text)] transition-colors group-hover:text-[var(--sx-active-accent)]">
                    {formatDisplayUrl(entry.url)}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[var(--sx-text-soft)]">
                    <span className="sx-font-hack">
                      Score {entry.threatInfo?.score ?? "--"}
                    </span>
                    <span className="uppercase">
                      {entry.threatInfo?.confidenceLabel ?? "n/a"} confidence
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </section>
  );
}
