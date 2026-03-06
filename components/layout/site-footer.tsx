export function SiteFooter() {
  return (
    <footer className="border-t border-black/10 bg-black/[0.02] py-10 dark:border-white/10 dark:bg-white/[0.02]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 text-sm text-[color:var(--muted-foreground)] sm:px-8 lg:flex-row lg:items-center lg:justify-between">
        <p>
          Built for portfolio-grade threat analysis with streamed multi-signal
          results, local history, and quota-conscious defaults.
        </p>
        <p>
          Signals: VirusTotal, Google Safe Browsing, threat feeds, TLS, DNS,
          redirect chain, RDAP, and ML ensemble heuristics.
        </p>
      </div>
    </footer>
  );
}
