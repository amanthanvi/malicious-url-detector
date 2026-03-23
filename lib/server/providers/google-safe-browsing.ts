import { getEnv } from "@/lib/config/env";
import type { GoogleSafeBrowsingData } from "@/lib/domain/types";
import { fetchWithTimeout } from "@/lib/server/http";

export async function runGoogleSafeBrowsingProvider(
  url: string,
): Promise<GoogleSafeBrowsingData> {
  const env = getEnv();
  const apiKey = env.GOOGLE_SAFE_BROWSING_API_KEY;

  if (!apiKey) {
    throw new Error("Google Safe Browsing API key is not configured.");
  }

  const response = await fetchWithTimeout(
    `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        client: {
          clientId: "scrutinix",
          clientVersion: "3.0.0",
        },
        threatInfo: {
          threatTypes: [
            "MALWARE",
            "SOCIAL_ENGINEERING",
            "UNWANTED_SOFTWARE",
            "POTENTIALLY_HARMFUL_APPLICATION",
          ],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url }],
        },
      }),
    },
    8_000,
  );

  if (!response.ok) {
    throw new Error(
      `Google Safe Browsing lookup failed with status ${response.status}.`,
    );
  }

  const payload = (await response.json()) as {
    matches?: Array<{
      threatType: string;
      platformType: string;
      threatEntryType: string;
    }>;
  };

  return {
    checkedAt: new Date().toISOString(),
    matches: payload.matches ?? [],
  };
}
