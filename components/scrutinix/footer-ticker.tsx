"use client";

import { AppFooter } from "@/components/scrutinix/app-footer";
import { useAnalyzerRuntime } from "@/components/scrutinix/analyzer-runtime";
import { SIGNAL_COUNT } from "@/components/shared/scrutinix-types";

export function FooterTicker() {
  const { live, ticker } = useAnalyzerRuntime();

  return (
    <AppFooter>
      {ticker.length > 0 ? (
        live ? (
          <div className="flex w-full overflow-hidden whitespace-nowrap transition-opacity duration-300">
            <div className="sx-marquee flex items-center gap-10 text-[11px] text-[var(--sx-text-muted)]">
              {[...ticker, ...ticker].map((event, index) => (
                <span key={`${event.id}-${index}`} className="shrink-0">
                  <span className="text-[var(--sx-info)]">{event.time}</span>
                  <span className="mx-1 text-[var(--sx-border-muted)]">/</span>
                  <span>{event.text}</span>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex w-full flex-wrap items-center justify-end gap-x-5 gap-y-1 py-1 text-[11px] text-[var(--sx-text-muted)] transition-opacity duration-300">
            {ticker.slice(-4).map((event) => (
              <span key={event.id}>
                <span className="text-[var(--sx-info)]">{event.time}</span>
                <span className="mx-1 text-[var(--sx-border-muted)]">/</span>
                <span>{event.text}</span>
              </span>
            ))}
          </div>
        )
      ) : (
        <div className="flex w-full flex-wrap items-center justify-end gap-x-5 gap-y-1 text-[11px] text-[var(--sx-text-muted)] transition-opacity duration-300">
          <span>{SIGNAL_COUNT} SIGNALS</span>
          <span className="text-[var(--sx-border-muted)]">/</span>
          <span>STREAMED VERDICTS</span>
          <span className="text-[var(--sx-border-muted)]">/</span>
          <span>BROWSER-ONLY HISTORY</span>
          <span className="text-[var(--sx-border-muted)]">/</span>
          <span>{live ? "STREAM ACTIVE" : "AWAITING TARGET"}</span>
        </div>
      )}
    </AppFooter>
  );
}
