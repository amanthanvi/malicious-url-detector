"use client";

import { ExternalLink } from "lucide-react";

import { formatDisplayUrl } from "@/lib/domain/url";
import type { AnalysisResult } from "@/lib/domain/types";
import { verdictColor } from "@/components/shared/scrutinix-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BatchItem {
  index: number;
  url: string;
  status: "pending" | "complete";
  result: AnalysisResult | null;
}

interface BatchPanelProps {
  items: BatchItem[];
  isStreaming: boolean;
  results: AnalysisResult[];
  onSelectResult: (result: AnalysisResult) => void;
}

export function BatchPanel({
  items,
  isStreaming,
  results,
  onSelectResult,
}: BatchPanelProps) {
  if (items.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="px-6 py-8 text-center">
          <p className="text-xs tracking-[0.15em] text-[var(--sx-text-muted)] uppercase">
            Batch results will appear here
          </p>
          <p className="mt-2 text-xs text-[var(--sx-text-muted)]">
            Enter URLs above and start a batch scan.
          </p>
        </CardContent>
      </Card>
    );
  }

  const progressPct =
    items.length > 0 ? Math.min(100, (results.length / items.length) * 100) : 0;

  return (
    <section aria-label="Batch scan results">
      <Card>
        <CardHeader className="gap-3 border-b border-[var(--sx-border)] py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-xs tracking-[0.15em] text-[var(--sx-text-muted)] uppercase">
              Batch Stream -- {results.length}/{items.length} Complete
            </CardTitle>
            <Badge variant={isStreaming ? "suspicious" : "safe"}>
              {isStreaming ? "In Progress" : "Complete"}
            </Badge>
          </div>
          <div className="h-1 rounded-full bg-[var(--sx-border)]">
            <div
              className="h-full rounded-full bg-[var(--sx-active-accent)]"
              style={{
                width: `${progressPct}%`,
                transition: "width 300ms ease",
              }}
            />
          </div>
        </CardHeader>

        <CardContent className="px-0 pb-0">
          <ScrollArea className="w-full">
            <div className="min-w-[700px]">
              <table
                className="min-w-full text-left text-xs"
                aria-label="Batch scan results"
              >
                <caption className="sr-only">
                  Batch scan results showing {items.length} URLs
                </caption>
                <thead>
                  <tr className="border-b border-[var(--sx-border)] bg-[var(--sx-bg)]">
                    <th className="px-4 py-2 font-semibold tracking-[0.12em] text-[var(--sx-text-muted)] uppercase">
                      #
                    </th>
                    <th className="px-4 py-2 font-semibold tracking-[0.12em] text-[var(--sx-text-muted)] uppercase">
                      URL
                    </th>
                    <th className="px-4 py-2 font-semibold tracking-[0.12em] text-[var(--sx-text-muted)] uppercase">
                      Status
                    </th>
                    <th className="px-4 py-2 font-semibold tracking-[0.12em] text-[var(--sx-text-muted)] uppercase">
                      Verdict
                    </th>
                    <th className="px-4 py-2 font-semibold tracking-[0.12em] text-[var(--sx-text-muted)] uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={`${item.index}-${item.url}`}
                      className="border-b border-[var(--sx-border)] transition hover:bg-[var(--sx-surface-elevated)]"
                    >
                      <td className="px-4 py-2 text-[var(--sx-text-muted)]">
                        {item.index + 1}
                      </td>
                      <td className="max-w-[320px] truncate px-4 py-2 text-[var(--sx-text)]">
                        {formatDisplayUrl(item.url)}
                      </td>
                      <td className="px-4 py-2">
                        <Badge
                          variant={
                            item.status === "complete" ? "safe" : "suspicious"
                          }
                        >
                          {item.status === "complete" ? "Done" : "Wait"}
                        </Badge>
                      </td>
                      <td className="px-4 py-2">
                        {item.result ? (
                          <span
                            className="font-bold uppercase"
                            style={{ color: verdictColor(item.result.verdict) }}
                          >
                            {item.result.verdict}
                          </span>
                        ) : (
                          <span className="text-[var(--sx-text-muted)]">
                            --
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {item.result ? (
                          <Button
                            type="button"
                            onClick={() => {
                              if (item.result) onSelectResult(item.result);
                            }}
                            variant="ghost"
                            size="sm"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Inspect
                          </Button>
                        ) : (
                          <span className="text-[var(--sx-text-muted)]">
                            --
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </section>
  );
}
