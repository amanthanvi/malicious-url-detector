import type { RedirectData } from "@/lib/domain/types";
import { fetchWithTimeout } from "@/lib/server/http";

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const MAX_REDIRECTS = 5;

export async function runRedirectSignal(url: string): Promise<RedirectData> {
  const hops: RedirectData["hops"] = [];
  let currentUrl = url;

  for (let attempt = 0; attempt < MAX_REDIRECTS; attempt += 1) {
    const response = await fetchWithTimeout(
      currentUrl,
      {
        redirect: "manual",
        headers: {
          "user-agent": "malicious-url-detector/3.0",
        },
      },
      8_000,
    );

    const location = response.headers.get("location");
    hops.push({
      url: currentUrl,
      status: response.status,
      location: location ?? undefined,
    });

    await response.body?.cancel().catch(() => undefined);

    if (!location || !REDIRECT_STATUSES.has(response.status)) {
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
