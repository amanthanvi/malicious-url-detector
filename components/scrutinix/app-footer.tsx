import type { ReactNode } from "react";

interface AppFooterProps {
  children: ReactNode;
}

export function AppFooter({ children }: AppFooterProps) {
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
        {children}
      </div>
    </footer>
  );
}
