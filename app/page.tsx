import {
  AnalyzerChrome,
  AnalyzerRuntimeProvider,
  AnalyzerWorkspace,
  FooterTicker,
  HistoryRail,
  ShellHeader,
} from "@/components/scrutinix/analyzer-app";
import { ScrutinixErrorBoundary } from "@/components/scrutinix/error-boundary";
import { IntroPanel } from "@/components/scrutinix/intro-panel";

export default function HomePage() {
  return (
    <AnalyzerRuntimeProvider>
      <AnalyzerChrome>
        <ShellHeader />

        <main
          id="main-content"
          className="relative z-10 flex-1 px-4 py-5 sm:px-6 xl:px-8"
        >
          <div className="mx-auto flex max-w-[1600px] flex-col gap-5">
            <IntroPanel />

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
              <ScrutinixErrorBoundary>
                <AnalyzerWorkspace />
              </ScrutinixErrorBoundary>

              <ScrutinixErrorBoundary>
                <HistoryRail />
              </ScrutinixErrorBoundary>
            </div>
          </div>
        </main>

        <FooterTicker />
      </AnalyzerChrome>
    </AnalyzerRuntimeProvider>
  );
}
