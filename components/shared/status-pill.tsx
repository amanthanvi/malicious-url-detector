import { clsx } from "clsx";

interface StatusPillProps {
  tone: "safe" | "suspicious" | "malicious" | "critical" | "error" | "neutral";
  children: React.ReactNode;
}

export function StatusPill({ tone, children }: StatusPillProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-[0.2em] uppercase",
        tone === "safe" &&
          "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
        tone === "suspicious" &&
          "bg-amber-400/20 text-amber-700 dark:text-amber-300",
        tone === "malicious" &&
          "bg-rose-500/15 text-rose-700 dark:text-rose-300",
        tone === "critical" && "bg-red-600/15 text-red-700 dark:text-red-300",
        tone === "error" &&
          "bg-slate-500/15 text-slate-700 dark:text-slate-300",
        tone === "neutral" &&
          "bg-black/5 text-[color:var(--muted-foreground)] dark:bg-white/10",
      )}
    >
      {children}
    </span>
  );
}
