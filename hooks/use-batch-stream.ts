"use client";

import { useCallback, useRef, useState } from "react";

import { readNdjsonStream } from "@/lib/client/ndjson";
import type { AnalysisResult, ApiError, BatchEvent } from "@/lib/domain/types";

interface BatchItem {
  index: number;
  url: string;
  status: "pending" | "complete";
  result: AnalysisResult | null;
}

interface BatchState {
  items: BatchItem[];
  isStreaming: boolean;
  error: ApiError | null;
  results: AnalysisResult[];
}

export function useBatchStream(
  onUrlComplete?: (result: AnalysisResult) => void,
) {
  const [state, setState] = useState<BatchState>({
    items: [],
    isStreaming: false,
    error: null,
    results: [],
  });
  const abortRef = useRef<AbortController | null>(null);

  const startBatch = useCallback(
    async (urls: string[]) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState({
        items: urls.map((url, index) => ({
          index,
          url,
          status: "pending",
          result: null,
        })),
        isStreaming: true,
        error: null,
        results: [],
      });

      const response = await fetch("/api/analyze/batch", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ urls }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error: ApiError };
        setState((previous) => ({
          ...previous,
          error: payload.error,
          isStreaming: false,
        }));
        return;
      }

      await readNdjsonStream<BatchEvent>(response, (event) => {
        if (event.type === "url_complete") {
          setState((previous) => ({
            ...previous,
            items: previous.items.map((item) =>
              item.index === event.index
                ? {
                    ...item,
                    url: event.result.url,
                    status: "complete",
                    result: event.result,
                  }
                : item,
            ),
            results: [
              ...previous.results.filter(
                (result) => result.id !== event.result.id,
              ),
              event.result,
            ],
          }));
          onUrlComplete?.(event.result);
        }

        if (event.type === "batch_complete") {
          setState((previous) => ({
            ...previous,
            isStreaming: false,
            results: event.results,
          }));
        }

        if (event.type === "batch_error") {
          setState((previous) => ({
            ...previous,
            isStreaming: false,
            error: event.error,
          }));
        }
      });
    },
    [onUrlComplete],
  );

  return {
    state,
    startBatch,
  };
}
