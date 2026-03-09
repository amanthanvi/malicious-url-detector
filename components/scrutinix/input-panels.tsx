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
        <span>Target Acquisition</span>
        {streaming && (
          <span className="sx-pulse text-[var(--sx-suspicious)]">
            [SCANNING...]
          </span>
        )}
      </div>
      <div className="flex items-center rounded border border-[var(--sx-border)] bg-[var(--sx-surface)] px-3 focus-within:border-[var(--sx-active-accent)]">
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
          placeholder="example.com, https://login.example.org"
          aria-label="URL to analyze"
          className="h-auto border-0 bg-transparent px-0 py-2.5 text-[var(--sx-accent)] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
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
        <span>Batch -- One URL per line (max 10, scans 3 at a time)</span>
        {urlCount > 0 && (
          <span className="text-[var(--sx-info)]">
            {urlCount} URL{urlCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      <label htmlFor="sx-batch-input" className="sr-only">
        URLs to analyze (one per line)
      </label>
      {/* Terminal-chrome wrapper for batch textarea */}
      <div className="rounded border border-[var(--sx-border)] bg-[var(--sx-surface)] focus-within:border-[var(--sx-active-accent)]">
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
              if (e.key === "Enter" && e.metaKey && !streaming) onSubmit();
            }}
            rows={5}
            placeholder={"https://example.com\nhttps://malicious.test"}
            aria-label="URLs to analyze, one per line"
            className="min-h-0 resize-none border-0 bg-transparent px-0 pb-2.5 text-[var(--sx-accent)] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      </div>
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
