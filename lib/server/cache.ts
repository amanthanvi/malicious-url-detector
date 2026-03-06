import type { AnalysisResult } from "@/lib/domain/types";

interface CacheEntry {
  result: AnalysisResult;
  expiresAt: number;
}

export class ResultCache {
  constructor(
    private readonly maxEntries = 200,
    private readonly ttlMs = 1000 * 60 * 15,
    private readonly entries = new Map<string, CacheEntry>(),
  ) {}

  get(key: string) {
    const entry = this.entries.get(key);
    if (!entry) {
      return null;
    }

    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return null;
    }

    this.entries.delete(key);
    this.entries.set(key, entry);
    return clone(entry.result);
  }

  set(key: string, result: AnalysisResult) {
    this.entries.delete(key);
    this.entries.set(key, {
      result: clone(result),
      expiresAt: Date.now() + this.ttlMs,
    });

    while (this.entries.size > this.maxEntries) {
      const oldestKey = this.entries.keys().next().value;
      if (!oldestKey) {
        break;
      }
      this.entries.delete(oldestKey);
    }
  }

  clear() {
    this.entries.clear();
  }
}

declare global {
  var __analysisCache: ResultCache | undefined;
}

export const analysisCache = globalThis.__analysisCache ?? new ResultCache();

if (!globalThis.__analysisCache) {
  globalThis.__analysisCache = analysisCache;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
