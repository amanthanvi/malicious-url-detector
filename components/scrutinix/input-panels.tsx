"use client";

import { useMemo } from "react";
import { ArrowRight, Download, Link2, RefreshCw } from "lucide-react";
import type { AnalysisResult } from "@/lib/domain/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SingleInputProps {
  url: string;
  onUrlChange: (v: string) => void;
  error?: string | null;
  streaming: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  result: AnalysisResult | null;
  onExport: () => void;
  onShare: () => void;
  onRescan: () => void;
}

export function SingleInput({
  url,
  onUrlChange,
  error,
  streaming,
  onSubmit,
  onCancel,
  result,
  onExport,
  onShare,
  onRescan,
}: SingleInputProps) {
  const hasUrl = url.trim().length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs tracking-[0.15em] text-[var(--sx-text-muted)] uppercase">
        <h2 className="text-xs tracking-[0.15em] text-[var(--sx-text-muted)] uppercase">
          Scan target
        </h2>
        {streaming && (
          <span className="sx-pulse text-[var(--sx-suspicious)]">
            [SCANNING...]
          </span>
        )}
      </div>
      <div
        className="flex items-center rounded border bg-[var(--sx-surface)] px-3 focus-within:border-[var(--sx-accent)]"
        style={{
          borderColor: error ? "var(--sx-suspicious)" : "var(--sx-border)",
        }}
      >
        <label htmlFor="sx-url-input" className="sr-only">
          URL to analyze
        </label>
        <span
          className="mr-2 shrink-0 text-sm text-[var(--sx-accent)]"
          aria-hidden="true"
        >
          {">"}
          <span className="sx-cursor">_</span>
        </span>
        <Input
          id="sx-url-input"
          type="text"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape" && streaming) {
              onCancel();
              return;
            }
            if (e.key === "Enter" && !streaming) onSubmit();
          }}
          placeholder="Paste a suspicious or unexpected URL"
          aria-label="URL to analyze"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "sx-url-error" : undefined}
          className="h-auto border-0 bg-transparent px-0 py-2.5 text-[var(--sx-accent)] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
      {error && (
        <p id="sx-url-error" className="text-xs text-[var(--sx-suspicious)]">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={onSubmit}
          disabled={streaming || !hasUrl}
          variant="terminal"
        >
          {streaming ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <ArrowRight className="h-3 w-3" />
          )}
          Analyze
        </Button>
        {streaming && (
          <Button type="button" onClick={onCancel} variant="ghost" size="sm">
            Cancel
          </Button>
        )}
        <span className="text-[11px] text-[var(--sx-text-muted)]">
          Press Enter to scan
        </span>
        {result && (
          <>
            <Button type="button" onClick={onExport} variant="ghost" size="sm">
              <Download className="h-3 w-3" /> JSON
            </Button>
            <Button type="button" onClick={onShare} variant="ghost" size="sm">
              <Link2 className="h-3 w-3" /> Share
            </Button>
            <Button type="button" onClick={onRescan} variant="ghost" size="sm">
              <RefreshCw className="h-3 w-3" /> Re-scan
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

interface BatchInputProps {
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  streaming: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  hasResults: boolean;
  onCsv: () => void;
  onJson: () => void;
}

export function BatchInput({
  value,
  onChange,
  error,
  streaming,
  onSubmit,
  onCancel,
  hasResults,
  onCsv,
  onJson,
}: BatchInputProps) {
  const urlCount = useMemo(
    () =>
      value
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean).length,
    [value],
  );
  const hasUrls = value.trim().length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs tracking-[0.15em] text-[var(--sx-text-muted)] uppercase">
        <h2 className="text-xs tracking-[0.15em] text-[var(--sx-text-muted)] uppercase">
          Batch queue
        </h2>
        {urlCount > 0 && (
          <span className="rounded-full border border-[var(--sx-border)] px-2 py-1 text-[11px] text-[var(--sx-info)]">
            {urlCount} URL{urlCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      <p className="text-xs text-[var(--sx-text-muted)]">
        One URL per line, up to 10 at a time. Scrutinix processes 3 in parallel
        and keeps each URL isolated if another one fails.
      </p>
      <label htmlFor="sx-batch-input" className="sr-only">
        URLs to analyze (one per line)
      </label>
      {/* Terminal-chrome wrapper for batch textarea */}
      <div
        className="rounded border bg-[var(--sx-surface)] focus-within:border-[var(--sx-accent)]"
        style={{
          borderColor: error ? "var(--sx-suspicious)" : "var(--sx-border)",
        }}
      >
        <div className="flex items-start px-3 pt-2.5">
          <span
            className="mt-0.5 mr-2 shrink-0 text-sm text-[var(--sx-accent)]"
            aria-hidden="true"
          >
            {">"}
            <span className="sx-cursor">_</span>
          </span>
          <Textarea
            id="sx-batch-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && streaming) {
                onCancel();
                return;
              }
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && !streaming)
                onSubmit();
            }}
            rows={5}
            placeholder={"https://example.com\nhttps://malicious.test"}
            aria-label="URLs to analyze, one per line"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "sx-batch-error" : undefined}
            className="min-h-0 resize-none border-0 bg-transparent px-0 pb-2.5 text-[var(--sx-accent)] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      </div>
      {error && (
        <p id="sx-batch-error" className="text-xs text-[var(--sx-suspicious)]">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={onSubmit}
          disabled={streaming || !hasUrls}
          variant="terminal"
        >
          {streaming ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <ArrowRight className="h-3 w-3" />
          )}
          Start Batch
        </Button>
        {streaming && (
          <Button type="button" onClick={onCancel} variant="ghost" size="sm">
            Cancel
          </Button>
        )}
        <span className="text-[11px] text-[var(--sx-text-muted)]">
          Press Cmd/Ctrl+Enter to scan
        </span>
        {hasResults && (
          <>
            <Button type="button" onClick={onCsv} variant="ghost" size="sm">
              <Download className="h-3 w-3" /> CSV
            </Button>
            <Button type="button" onClick={onJson} variant="ghost" size="sm">
              <Download className="h-3 w-3" /> JSON
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
