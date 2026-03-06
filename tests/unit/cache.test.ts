import { describe, expect, it, vi } from "vitest";

import { ResultCache } from "@/lib/server/cache";
import {
  createPendingSignalResults,
  type AnalysisResult,
} from "@/lib/domain/types";

describe("ResultCache", () => {
  it("stores and returns cloned results", () => {
    const cache = new ResultCache(2, 60_000);
    const result = buildResult("https://example.com/");

    cache.set("key", result);
    const cached = cache.get("key");

    expect(cached).toEqual(result);
    expect(cached).not.toBe(result);
  });

  it("expires stale entries", () => {
    vi.useFakeTimers();
    const cache = new ResultCache(2, 1_000);
    cache.set("key", buildResult("https://example.com/"));

    vi.advanceTimersByTime(1_500);
    expect(cache.get("key")).toBeNull();
    vi.useRealTimers();
  });
});

function buildResult(url: string): AnalysisResult {
  return {
    id: "scan-1",
    url,
    verdict: "safe",
    signals: createPendingSignalResults(),
    threatInfo: null,
    metadata: {
      scanId: "scan-1",
      startedAt: "2026-03-06T00:00:00.000Z",
      completedAt: "2026-03-06T00:00:01.000Z",
      cacheHit: false,
      partialFailure: false,
      signalCount: 8,
      durationMs: 1_000,
    },
  };
}
