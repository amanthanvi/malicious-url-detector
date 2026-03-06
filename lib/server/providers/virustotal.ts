import { Buffer } from "node:buffer";

import { getEnv } from "@/lib/config/env";
import type { VirusTotalData } from "@/lib/domain/types";
import { fetchWithTimeout, sleep } from "@/lib/server/http";

const API_BASE = "https://www.virustotal.com/api/v3";

interface VirusTotalEngineResultPayload {
  category?: string;
  result?: string | null;
}

interface VirusTotalStatsPayload {
  malicious?: number;
  suspicious?: number;
  harmless?: number;
  undetected?: number;
  timeout?: number;
}

interface VirusTotalReportPayload {
  data?: {
    attributes?: {
      last_analysis_stats?: VirusTotalStatsPayload;
      last_analysis_results?: Record<string, VirusTotalEngineResultPayload>;
    };
  };
}

interface VirusTotalAnalysisPayload {
  data?: {
    attributes?: {
      status?: string;
      stats?: VirusTotalStatsPayload;
      results?: Record<string, VirusTotalEngineResultPayload>;
    };
  };
}

interface VirusTotalSubmitPayload {
  data?: {
    id?: string;
  };
}

export async function runVirusTotalProvider(
  url: string,
): Promise<VirusTotalData> {
  const env = getEnv();
  const apiKey = env.VIRUSTOTAL_API_KEY;

  if (!apiKey) {
    throw new Error("VirusTotal API key is not configured.");
  }

  const urlId = Buffer.from(url).toString("base64url");
  const reportResponse = await fetchWithTimeout(`${API_BASE}/urls/${urlId}`, {
    headers: {
      "x-apikey": apiKey,
    },
  });

  if (reportResponse.ok) {
    const report = (await reportResponse.json()) as VirusTotalReportPayload;
    return parseVirusTotalReport(report, urlId);
  }

  if (reportResponse.status !== 404) {
    throw new Error(
      `VirusTotal lookup failed with status ${reportResponse.status}.`,
    );
  }

  const submitResponse = await fetchWithTimeout(`${API_BASE}/urls`, {
    method: "POST",
    headers: {
      "x-apikey": apiKey,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ url }),
  });

  if (!submitResponse.ok) {
    throw new Error(
      `VirusTotal submission failed with status ${submitResponse.status}.`,
    );
  }

  const submitPayload =
    (await submitResponse.json()) as VirusTotalSubmitPayload;
  const analysisId = submitPayload.data?.id;
  if (!analysisId) {
    throw new Error("VirusTotal submission did not return an analysis id.");
  }

  for (let attempt = 0; attempt < 4; attempt += 1) {
    await sleep((attempt + 1) * 1_500);

    const analysisResponse = await fetchWithTimeout(
      `${API_BASE}/analyses/${analysisId}`,
      {
        headers: {
          "x-apikey": apiKey,
        },
      },
    );

    if (!analysisResponse.ok) {
      throw new Error(
        `VirusTotal analysis polling failed with status ${analysisResponse.status}.`,
      );
    }

    const analysisPayload =
      (await analysisResponse.json()) as VirusTotalAnalysisPayload;
    if (analysisPayload.data?.attributes?.status === "completed") {
      return parseVirusTotalAnalysis(analysisPayload, urlId);
    }
  }

  throw new Error(
    "VirusTotal analysis did not complete before the timeout budget.",
  );
}

function parseVirusTotalReport(
  payload: VirusTotalReportPayload,
  urlId: string,
): VirusTotalData {
  const stats = payload.data?.attributes?.last_analysis_stats ?? {};
  const results = payload.data?.attributes?.last_analysis_results ?? {};

  return {
    malicious: Number(stats.malicious ?? 0),
    suspicious: Number(stats.suspicious ?? 0),
    harmless: Number(stats.harmless ?? 0),
    undetected: Number(stats.undetected ?? 0),
    timeout: Number(stats.timeout ?? 0),
    results: parseVirusTotalResults(results).filter(
      (entry) => entry.category !== "undetected",
    ),
    permalink: `https://www.virustotal.com/gui/url/${urlId}`,
  };
}

function parseVirusTotalAnalysis(
  payload: VirusTotalAnalysisPayload,
  urlId: string,
): VirusTotalData {
  const stats = payload.data?.attributes?.stats ?? {};
  const results = payload.data?.attributes?.results ?? {};

  return {
    malicious: Number(stats.malicious ?? 0),
    suspicious: Number(stats.suspicious ?? 0),
    harmless: Number(stats.harmless ?? 0),
    undetected: Number(stats.undetected ?? 0),
    timeout: Number(stats.timeout ?? 0),
    results: parseVirusTotalResults(results),
    permalink: `https://www.virustotal.com/gui/url/${urlId}`,
  };
}

function parseVirusTotalResults(
  results: Record<string, VirusTotalEngineResultPayload>,
) {
  return Object.entries(results).map(([engine, data]) => ({
    engine,
    category: String(data.category ?? "unknown"),
    result: data.result ?? null,
  }));
}
