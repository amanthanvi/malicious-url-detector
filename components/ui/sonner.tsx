"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";

export function AppToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      theme={resolvedTheme === "light" ? "light" : "dark"}
      position="bottom-center"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "sx-font-sans rounded-xl border border-[var(--sx-border)] bg-[var(--sx-surface)] text-[var(--sx-text)] shadow-lg",
          title: "text-sm font-semibold text-[var(--sx-text)]",
          description: "text-xs text-[var(--sx-text-muted)]",
          actionButton:
            "rounded-md bg-[var(--sx-active-accent)] text-[var(--sx-accent-fg)]",
          cancelButton:
            "rounded-md border border-[var(--sx-border)] bg-transparent text-[var(--sx-text)]",
        },
      }}
    />
  );
}
