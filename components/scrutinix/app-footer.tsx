interface TickerEvent {
  id: string;
  time: string;
  text: string;
}

interface AppFooterProps {
  ticker: TickerEvent[];
  live: boolean;
}

export function AppFooter({ ticker, live }: AppFooterProps) {
  return (
    <footer
      className="relative z-10 border-t border-[var(--sx-border)] bg-[var(--sx-surface)]"
      aria-live="polite"
    >
      <div
        className="mx-auto flex h-8 max-w-[1600px] items-center overflow-hidden border-t border-transparent px-6 xl:px-8"
        style={{
          borderImage:
            "linear-gradient(90deg, transparent, var(--sx-border), transparent) 1",
        }}
      >
        {ticker.length > 0 ? (
          <div className="flex w-full overflow-hidden whitespace-nowrap">
            <div className="sx-marquee flex items-center gap-6 text-xs text-[var(--sx-text-muted)]">
              {/* Duplicate content for seamless loop */}
              {[...ticker, ...ticker].map((t, i) => (
                <span key={`${t.id}-${i}`} className="shrink-0">
                  <span className="text-[var(--sx-info)]">{t.time}</span>
                  <span className="mx-1 text-[var(--sx-border-muted)]">--</span>
                  <span>{t.text}</span>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="sx-font-sans flex items-center gap-4 text-xs text-[var(--sx-text-muted)]">
            <span>SCRUTINIX</span>
            <span className="text-[var(--sx-border-muted)]">|</span>
            <span>8 SIGNALS</span>
            <span className="text-[var(--sx-border-muted)]">|</span>
            <span>NDJSON</span>
            <span className="text-[var(--sx-border-muted)]">|</span>
            <span>{live ? "STREAM ACTIVE" : "AWAITING TARGET"}</span>
          </div>
        )}
      </div>
    </footer>
  );
}
