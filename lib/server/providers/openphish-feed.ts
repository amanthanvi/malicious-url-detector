import { getEnv } from "@/lib/config/env";
import { simplifyUrlForMatching } from "@/lib/domain/url";
import { fetchWithTimeout } from "@/lib/server/http";

interface FeedCache {
  fetchedAt: number;
  values: Set<string>;
}

declare global {
  var __openPhishFeedCache: FeedCache | undefined;
}

const TTL_MS = 1000 * 60 * 15;

export async function checkOpenPhishFeed(url: string) {
  const feed = await getOpenPhishFeed();
  const normalized = simplifyUrlForMatching(url);

  if (!feed.values.has(normalized)) {
    return null;
  }

  return {
    feed: "openphish" as const,
    matchedUrl: normalized,
    detail: "listed in the OpenPhish community feed",
    confidence: "high" as const,
  };
}

async function getOpenPhishFeed() {
  const cached = globalThis.__openPhishFeedCache;
  if (cached && cached.fetchedAt + TTL_MS > Date.now()) {
    return cached;
  }

  const env = getEnv();
  const response = await fetchWithTimeout(env.OPENPHISH_FEED_URL, {}, 8_000);
  if (!response.ok) {
    throw new Error(
      `OpenPhish feed download failed with status ${response.status}.`,
    );
  }

  const text = await response.text();
  const values = new Set(
    text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => simplifyUrlForMatching(line)),
  );

  const nextCache = {
    fetchedAt: Date.now(),
    values,
  };

  globalThis.__openPhishFeedCache = nextCache;
  return nextCache;
}
