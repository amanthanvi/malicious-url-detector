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
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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
    <Card
      className="flex h-full max-h-[calc(100vh-8rem)] min-h-[22rem] flex-col overflow-hidden"
      aria-label="Scan history"
      role="region"
    >
      <div className="border-b border-[var(--sx-border)] px-3 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xs tracking-[0.2em] text-[var(--sx-text-muted)] uppercase">
              Scan log
            </h2>
            <Badge variant="neutral">{entries.length}</Badge>
          </div>
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
        </div>

        {entries.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={() =>
                downloadTextFile("scan-history.csv", resultsToCsv(entries))
              }
              variant="ghost"
              size="sm"
              aria-label="Export history as CSV"
            >
              <Download className="h-3 w-3" />
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
              variant="ghost"
              size="sm"
              aria-label="Export history as JSON"
            >
              <Download className="h-3 w-3" />
              JSON
            </Button>
            <Button
              type="button"
              onClick={handleClear}
              variant={confirmClear ? "dangerSolid" : "danger"}
              size="sm"
              aria-label={
                confirmClear ? "Confirm clear all history" : "Clear all history"
              }
            >
              <Trash2 className="h-3 w-3" />
              {confirmClear ? "Confirm clear" : "Clear all"}
            </Button>
          </div>
        )}
      </div>

      <div className="border-b border-[var(--sx-border)] px-3 py-2">
        <div className="flex items-center rounded-md border border-[var(--sx-border)] bg-[var(--sx-bg)] px-2 transition focus-within:border-[var(--sx-accent)]">
          <span
            className="mr-1 shrink-0 text-xs text-[var(--sx-accent)]"
            aria-hidden="true"
          >
            grep{">"}
          </span>
          <Input
            value={historyQuery}
            onChange={(event) => onHistoryQueryChange(event.target.value)}
            placeholder="filter..."
            aria-label="Filter scan history"
            className="h-8 border-0 bg-transparent px-0 py-1 text-xs shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <p className="mt-1 text-xs text-[var(--sx-text-muted)]">{statusText}</p>
        {canUndoClear ? (
          <p className="mt-1 text-xs text-[var(--sx-text-muted)]">
            History was cleared locally. Use Undo clear to restore the previous
            archive.
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--sx-border)] px-3 py-2">
        <h3 className="sx-font-sans text-[10px] tracking-[0.16em] text-[var(--sx-text-muted)] uppercase">
          Verdict
        </h3>
        <Separator
          orientation="vertical"
          className="mx-1 hidden h-4 sm:block"
        />
        {verdictFilters.map((tone) => (
          <Button
            key={tone}
            type="button"
            onClick={() => onFilterVerdictChange(tone)}
            aria-pressed={filterVerdict === tone}
            variant={filterVerdict === tone ? "terminal" : "ghost"}
            size="sm"
            className="rounded-full"
          >
            {tone}
          </Button>
        ))}
      </div>

      <div className="min-h-0 flex-1 px-2 py-1">
        {entries.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--sx-border-muted)] px-3 py-6 text-center text-xs text-[var(--sx-text-muted)]">
            {historyQuery || filterVerdict !== "all"
              ? "No scans match the current filter."
              : canUndoClear
                ? "History cleared locally. Undo is still available."
                : "Completed scans persist here via IndexedDB."}
          </div>
        ) : (
          <ScrollArea className="h-full pr-2">
            <div className="space-y-1">
              {entries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => onSelect(entry)}
                  className="group flex min-h-11 w-full items-center gap-2 rounded-lg border border-transparent px-2 py-2 text-left transition hover:border-[var(--sx-border)] hover:bg-[var(--sx-surface-elevated)]"
                >
                  <span className="shrink-0 text-[11px] text-[var(--sx-info)]">
                    [{formatTimestamp(entry.savedAt)}]
                  </span>
                  <span className="flex-1 truncate text-xs text-[var(--sx-text)] group-hover:text-[var(--sx-active-accent)]">
                    {formatDisplayUrl(entry.url)}
                  </span>
                  <span
                    className="shrink-0 text-xs font-bold uppercase"
                    style={{ color: verdictColor(entry.verdict) }}
                  >
                    {entry.verdict}
                  </span>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </Card>
  );
}
