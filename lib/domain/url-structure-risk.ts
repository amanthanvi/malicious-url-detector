import { isIP } from "node:net";

import { normalizeUrlInput } from "@/lib/domain/url";

export interface UrlStructureRisk {
  /** Added to the lexical ensemble score before label thresholds (0–1 scale). */
  scoreDelta: number;
  reasons: string[];
}

const SCRIPT_INDICATORS = [".sh", ".bash", ".py", ".pl", ".ps1"] as const;

/**
 * Structural URL signals (non-default ports, script-like paths) used by lexical
 * heuristics so they stay aligned with a single definition.
 */
export function getUrlStructureRisk(url: string): UrlStructureRisk {
  const parsed = normalizeUrlInput(url);
  if (!parsed.ok) {
    return { scoreDelta: 0, reasons: [] };
  }

  const u = new URL(parsed.value.normalizedUrl);
  const hostname = u.hostname.toLowerCase();
  /** Script extensions must not be matched in the hostname (e.g. .pl, .py, .sh ccTLDs). */
  const pathSearchHash = `${u.pathname}${u.search}${u.hash}`.toLowerCase();

  let scoreDelta = 0;
  const reasons: string[] = [];

  const scriptMatches = SCRIPT_INDICATORS.filter((indicator) =>
    pathSearchHash.includes(indicator),
  );
  if (scriptMatches.length > 0) {
    scoreDelta += Math.min(0.24, 0.12 + scriptMatches.length * 0.06);
    reasons.push(
      `The URL references script or shell content such as ${scriptMatches.slice(0, 3).join(", ")}.`,
    );
  }

  const literalIp = isIP(hostname);
  const explicitPort = u.port !== "";

  if (u.protocol === "https:" && explicitPort && u.port !== "443") {
    let bump = 0.18;
    if (literalIp) bump += 0.08;
    scoreDelta += bump;
    reasons.push(
      `The URL uses a non-standard HTTPS port (${u.port}), which is uncommon for typical web services.`,
    );
  } else if (u.protocol === "http:" && explicitPort && u.port !== "80") {
    let bump = 0.12;
    if (literalIp) bump += 0.06;
    scoreDelta += bump;
    reasons.push(
      `The URL uses a non-standard HTTP port (${u.port}), which is uncommon for typical web services.`,
    );
  }

  return { scoreDelta, reasons };
}
