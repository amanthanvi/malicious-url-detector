"use client";

import { useCallback, useRef, useState } from "react";

import { readNdjsonStream } from "@/lib/client/ndjson";
import {
  createPendingSignalResults,
  type AnalysisResult,
  type AnalyzeEvent,
  type ApiError,
  type SignalResults,
} from "@/lib/domain/types";

interface ScanState {
  url: string;
  startedAt: string | null;
  scanId: string | null;
  signals: SignalResults;
  result: AnalysisResult | null;
  error: ApiError | null;
  isStreaming: boolean;
}

const initialState = (): ScanState => ({
  url: "",
  startedAt: null,
  scanId: null,
  signals: createPendingSignalResults(),
  result: null,
  error: null,
  isStreaming: false,
});

export function useScanStream(onComplete?: (result: AnalysisResult) => void) {
  const [state, setState] = useState<ScanState>(initialState);
  const abortRef = useRef<AbortController | null>(null);

  const startScan = useCallback(
    async (url: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState({
        url,
        startedAt: null,
        scanId: null,
        signals: createPendingSignalResults(),
        result: null,
        error: null,
        isStreaming: true,
      });

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ url }),
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

      await readNdjsonStream<AnalyzeEvent>(response, (event) => {
        if (event.type === "scan_started") {
          setState((previous) => ({
            ...previous,
            url: event.url,
            scanId: event.scanId,
            startedAt: event.startedAt,
          }));
        }

        if (event.type === "signal_result") {
          setState((previous) => ({
            ...previous,
            signals: {
              ...previous.signals,
              [event.name]: event.result,
            },
          }));
        }

        if (event.type === "scan_complete") {
          setState((previous) => ({
            ...previous,
            result: event.result,
            signals: event.result.signals,
            isStreaming: false,
            error: null,
          }));
          onComplete?.(event.result);
        }

        if (event.type === "scan_error") {
          setState((previous) => ({
            ...previous,
            error: event.error,
            isStreaming: false,
          }));
        }
      });
    },
    [onComplete],
  );

  return {
    state,
    startScan,
  };
}
