"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ScrutinixErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[Scrutinix] Unhandled error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="scrutinix-theme flex min-h-screen items-center justify-center">
          <div className="max-w-md rounded border border-[var(--sx-malicious)] bg-[var(--sx-surface)] p-6 text-center">
            <p className="text-sm font-bold tracking-[0.15em] text-[var(--sx-malicious)] uppercase">
              Workspace fault
            </p>
            <p className="mt-3 text-xs leading-relaxed text-[var(--sx-text-muted)]">
              {this.state.error?.message ?? "An unexpected error occurred."}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[var(--sx-text-muted)]">
              Reload the workspace to recover the scanner shell, then retry the
              scan that failed.
            </p>
            <button
              type="button"
              onClick={() => {
                window.location.reload();
              }}
              className="sx-btn-press mt-4 inline-flex min-h-11 items-center justify-center rounded border border-[var(--sx-accent)] bg-[var(--sx-accent)] px-4 py-2.5 text-xs font-bold tracking-[0.14em] text-[var(--sx-accent-fg)] uppercase"
            >
              Reload Workspace
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
