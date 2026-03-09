import { Shield } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";

const THRESHOLDS = [
  { value: 25, label: "SAFE" },
  { value: 40, label: "SUSP" },
  { value: 55, label: "MAL" },
  { value: 80, label: "CRIT" },
] as const;

interface AppHeaderProps {
  score: number;
  scoreColor: string;
  done: number;
  live: boolean;
}

export function AppHeader({ score, scoreColor, done, live }: AppHeaderProps) {
  return (
    <header className="relative z-10 border-b border-[var(--sx-border)] bg-[var(--sx-surface)]">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-6 xl:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-[var(--sx-accent)]" />
          <div className="flex flex-col gap-0.5">
            <h1 className="sx-font-sans text-sm font-bold tracking-[0.12em] text-[var(--sx-accent)]">
              SCRUTINIX
            </h1>
            <span className="sx-font-sans text-[10px] tracking-[0.16em] text-[var(--sx-text-muted)] uppercase">
              Multi-signal URL triage
            </span>
          </div>
        </div>

        {/* Threat Elevation Bar with threshold markers */}
        <div className="order-3 w-full sm:order-2 sm:block sm:w-auto">
          <div className="flex items-center gap-3">
            <span className="text-xs tracking-[0.15em] text-[var(--sx-text-muted)] uppercase">
              Threat
            </span>
            <div className="w-full max-w-40 sm:w-36">
              <div className="relative h-2 w-full overflow-hidden rounded-sm bg-[var(--sx-border)]">
                <div
                  className="sx-threat-fill h-full rounded-sm transition-colors duration-300"
                  style={{
                    width: `${Math.min(score, 100)}%`,
                    backgroundColor: scoreColor,
                  }}
                />
              </div>
              {/* Threshold tick marks */}
              <div className="relative mt-0.5 h-3">
                {THRESHOLDS.map((t) => (
                  <div
                    key={t.value}
                    className="absolute flex flex-col items-center"
                    style={{
                      left: `${t.value}%`,
                      transform: "translateX(-50%)",
                    }}
                  >
                    <div className="h-1.5 w-px bg-[var(--sx-border-muted)]" />
                    <span className="text-[8px] tracking-[0.08em] text-[var(--sx-text-muted)] uppercase">
                      {t.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <span className="text-xs text-[var(--sx-text)]">{score}/100</span>
          </div>
        </div>

        {/* Status */}
        <div className="order-2 flex items-center gap-3 sm:order-3">
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] tracking-[0.16em] text-[var(--sx-text-muted)] uppercase">
              Scan readiness
            </span>
            <div className="flex items-center gap-2">
              <Badge variant={live ? "malicious" : "safe"}>
                {live ? "Live" : "Ready"}
              </Badge>
              <span className="text-xs tracking-[0.12em] text-[var(--sx-text-muted)]">
                {done}/8 signals
              </span>
            </div>
          </div>
          <ThemeToggle />
          <span className="sr-only">{done}/8 SIGNALS</span>
        </div>
      </div>
    </header>
  );
}
