import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  runThreatFeedsProvider,
  URLHAUS_NO_LISTING_OBSERVATION,
} from "@/lib/server/providers/threat-feeds";
import { server } from "@/tests/setup/msw.server";

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("URLHAUS_AUTH_KEY", "urlhaus-key");
});

describe("threat feed provider", () => {
  it("uses the documented URLhaus header and the OpenPhish community feed", async () => {
    let urlhausHeader: string | null = null;

    server.use(
      http.post("https://urlhaus-api.abuse.ch/v1/url/", ({ request }) => {
        urlhausHeader = request.headers.get("Auth-Key");
        return HttpResponse.json({ query_status: "no_results" });
      }),
      http.get(
        "https://openphish.com/feed.txt",
        () =>
          new HttpResponse("https://example.com/\nhttps://login.example/\n", {
            status: 200,
          }),
      ),
    );

    const result = await runThreatFeedsProvider("https://example.com/");

    expect(urlhausHeader).toBe("urlhaus-key");
    expect(result.warnings).toEqual([]);
    expect(result.observations).toEqual([URLHAUS_NO_LISTING_OBSERVATION]);
    expect(result.matches).toEqual([
      {
        feed: "openphish",
        matchedUrl: "https://example.com",
        detail: "listed in the OpenPhish community feed",
        confidence: "high",
      },
    ]);
  });

  it("fails the signal only when both URLhaus and OpenPhish fail", async () => {
    server.use(
      http.post("https://urlhaus-api.abuse.ch/v1/url/", () =>
        HttpResponse.json({ error: "Unauthorized" }, { status: 401 }),
      ),
      http.get(
        "https://openphish.com/feed.txt",
        () => new HttpResponse("", { status: 503 }),
      ),
    );

    await expect(
      runThreatFeedsProvider("https://example.com/"),
    ).rejects.toThrow("All threat-feed lookups failed.");
  });
});
