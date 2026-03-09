import http from "node:http";
import https from "node:https";

import type { RedirectData } from "@/lib/domain/types";

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const MAX_REDIRECTS = 5;
const REQUEST_TIMEOUT_MS = 8_000;

export async function runRedirectSignal(url: string): Promise<RedirectData> {
  const hops: RedirectData["hops"] = [];
  let currentUrl = url;
  let reachable = true;
  let terminalStatus: number | null = null;
  let terminalError: string | null = null;
  const observations: string[] = [];

  for (let attempt = 0; attempt < MAX_REDIRECTS; attempt += 1) {
    const outcome = await requestRedirectHop(currentUrl);
    if ("error" in outcome) {
      reachable = false;
      terminalError = outcome.error;
      observations.push(outcome.error);
      break;
    }

    const { status, location } = outcome;
    terminalStatus = status;
    hops.push({
      url: currentUrl,
      status,
      location: location ?? undefined,
    });

    if (!location || !REDIRECT_STATUSES.has(status)) {
      break;
    }

    currentUrl = new URL(location, currentUrl).toString();
  }

  return {
    finalUrl: currentUrl,
    totalHops: Math.max(0, hops.length - 1),
    httpsUpgraded:
      new URL(url).protocol === "http:" &&
      new URL(currentUrl).protocol === "https:",
    reachable,
    terminalStatus,
    terminalError,
    hops,
    observations,
  };
}

async function requestRedirectHop(url: string) {
  const target = new URL(url);
  const client = target.protocol === "https:" ? https : http;

  return await new Promise<
    { status: number; location: string | null } | { error: string }
  >((resolve) => {
    const request = client.request(
      target,
      {
        method: "GET",
        rejectUnauthorized: false,
        headers: {
          "user-agent": "malicious-url-detector/3.0",
        },
      },
      (response) => {
        const locationHeader = response.headers.location;
        const location = Array.isArray(locationHeader)
          ? (locationHeader[0] ?? null)
          : (locationHeader ?? null);

        resolve({
          status: response.statusCode ?? 0,
          location,
        });

        response.resume();
      },
    );

    request.once("error", (error) => {
      resolve({
        error: describeRedirectFailure(error),
      });
    });

    request.setTimeout(REQUEST_TIMEOUT_MS, () => {
      request.destroy();
      resolve({
        error: `The host did not respond to the redirect probe within ${REQUEST_TIMEOUT_MS}ms.`,
      });
    });

    request.end();
  });
}

function describeRedirectFailure(error: unknown) {
  if (!(error instanceof Error)) {
    return "The redirect probe failed unexpectedly.";
  }

  const code =
    "code" in error && typeof error.code === "string" ? error.code : null;

  switch (code) {
    case "ECONNREFUSED":
      return "The host refused the redirect probe on the target port.";
    case "ENOTFOUND":
      return "The hostname could not be resolved during the redirect probe.";
    case "ECONNRESET":
      return "The redirect probe connection was reset before a response arrived.";
    case "ETIMEDOUT":
      return "The redirect probe timed out before the host responded.";
    default:
      return error.message || "The redirect probe failed unexpectedly.";
  }
}
