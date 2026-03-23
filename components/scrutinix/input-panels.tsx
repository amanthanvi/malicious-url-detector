"use client";

import { useMemo } from "react";
import { ArrowRight, Download, Link2, RefreshCw } from "lucide-react";
import type { AnalysisResult } from "@/lib/domain/types";
import { Badge } from "@/components/ui/badge";
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-[11px] tracking-[0.18em] text-[var(--sx-text-muted)] uppercase">
            Single target
          </h2>
          <p className="sx-font-sans max-w-lg text-sm leading-6 text-[var(--sx-text-muted)]">
            Stream one live verdict, inspect the evidence, then export or share
            the finished result.
          </p>
        </div>

        <Badge variant={streaming ? "active" : hasUrl ? "neutral" : "safe"}>
          {streaming ? "Streaming" : hasUrl ? "Ready" : "Paste URL"}
        </Badge>
      </div>

      <div
        className="rounded-[1.4rem] border bg-[color-mix(in_srgb,var(--sx-surface-strong)_88%,transparent)] p-2"
        style={{
          borderColor: error ? "var(--sx-suspicious)" : "var(--sx-border)",
        }}
      >
        <label htmlFor="sx-url-input" className="sr-only">
          URL to analyze
        </label>
        <div className="flex items-center gap-3 rounded-[1rem] bg-[color-mix(in_srgb,var(--sx-surface)_76%,transparent)] px-3">
          <span
            className="sx-font-hack shrink-0 text-sm text-[var(--sx-accent)]"
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
            placeholder="https://example.com/suspicious"
            aria-label="URL to analyze"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "sx-url-error" : undefined}
            className="h-14 border-0 bg-transparent px-0 text-[var(--sx-text)] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
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

      <p className="text-[11px] leading-5 text-[var(--sx-text-soft)]">
        Press Enter to scan. Scrutinix processes the submitted URL live, while
        local history remains in your browser.
      </p>
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-[11px] tracking-[0.18em] text-[var(--sx-text-muted)] uppercase">
            Batch queue
          </h2>
          <p className="sx-font-sans max-w-lg text-sm leading-6 text-[var(--sx-text-muted)]">
            Queue up to 10 URLs. Scrutinix processes 3 in parallel and isolates
            failures so one broken target does not stop the rest.
          </p>
        </div>
        {urlCount > 0 && (
          <Badge variant={streaming ? "active" : "neutral"}>
            {urlCount} URL{urlCount !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      <label htmlFor="sx-batch-input" className="sr-only">
        URLs to analyze (one per line)
      </label>
      <div
        className="rounded-[1.4rem] border bg-[color-mix(in_srgb,var(--sx-surface-strong)_88%,transparent)] p-2"
        style={{
          borderColor: error ? "var(--sx-suspicious)" : "var(--sx-border)",
        }}
      >
        <div className="flex items-start gap-3 rounded-[1rem] bg-[color-mix(in_srgb,var(--sx-surface)_76%,transparent)] px-3 pt-3">
          <span
            className="sx-font-hack mt-0.5 shrink-0 text-sm text-[var(--sx-accent)]"
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
            className="min-h-0 resize-none border-0 bg-transparent px-0 pb-3 text-[var(--sx-text)] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
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

      <p className="text-[11px] leading-5 text-[var(--sx-text-soft)]">
        Press Cmd/Ctrl+Enter to start. Batch results stream independently and
        export to CSV or JSON when complete.
      </p>
    </div>
  );
}
