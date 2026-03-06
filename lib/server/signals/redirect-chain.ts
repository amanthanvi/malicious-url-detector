import http from "node:http";
import https from "node:https";

import type { RedirectData } from "@/lib/domain/types";

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const MAX_REDIRECTS = 5;
const REQUEST_TIMEOUT_MS = 8_000;

export async function runRedirectSignal(url: string): Promise<RedirectData> {
  const hops: RedirectData["hops"] = [];
  let currentUrl = url;

  for (let attempt = 0; attempt < MAX_REDIRECTS; attempt += 1) {
    const { status, location } = await requestRedirectHop(currentUrl);
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
    hops,
  };
}

async function requestRedirectHop(url: string) {
  const target = new URL(url);
  const client = target.protocol === "https:" ? https : http;

  return await new Promise<{ status: number; location: string | null }>(
    (resolve, reject) => {
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

          response.destroy();
        },
      );

      request.once("error", (error) => {
        reject(error);
      });

      request.setTimeout(REQUEST_TIMEOUT_MS, () => {
        request.destroy(new Error(`Timed out after ${REQUEST_TIMEOUT_MS}ms`));
      });

      request.end();
    },
  );
}
