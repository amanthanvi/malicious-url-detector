import type { AnalysisResult } from "@/lib/domain/types";

export function downloadTextFile(
  filename: string,
  content: string,
  type = "text/plain;charset=utf-8",
) {
  const blob = new Blob([content], { type });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(href);
}

export function resultsToCsv(results: AnalysisResult[]) {
  const rows = [
    [
      "URL",
      "Verdict",
      "Score",
      "Confidence",
      "Cache Hit",
      "Completed At",
      "Top Reasons",
    ],
    ...results.map((result) => [
      result.url,
      result.verdict,
      String(result.threatInfo?.score ?? 0),
      String(result.threatInfo?.confidence ?? 0),
      String(result.metadata.cacheHit),
      result.metadata.completedAt,
      (result.threatInfo?.reasons ?? []).slice(0, 3).join(" | "),
    ]),
  ];

  return rows
    .map((row) =>
      row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");
}

export function resultsToJson(results: AnalysisResult[]) {
  return JSON.stringify(results, null, 2);
}
