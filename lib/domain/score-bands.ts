import type { Verdict } from "@/lib/domain/types";

export const THREAT_SCORE_MARKERS = [
  { value: 25, label: "SUSP" },
  { value: 55, label: "MAL" },
  { value: 80, label: "CRIT" },
] as const;

export function threatScoreToVerdict(score: number): Verdict {
  if (score >= 80) {
    return "critical";
  }

  if (score >= 55) {
    return "malicious";
  }

  if (score >= 25) {
    return "suspicious";
  }

  return "safe";
}

export function threatScoreBandLabel(score: number) {
  if (score >= 80) return "Critical (80-100)";
  if (score >= 55) return "Malicious (55-79)";
  if (score >= 25) return "Suspicious (25-54)";
  return "Safe (0-24)";
}
