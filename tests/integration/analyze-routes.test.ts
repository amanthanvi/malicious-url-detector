import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "@/tests/setup/msw.server";

vi.mock("@/lib/server/signals/dns", () => ({
  runDnsSignal: vi.fn(async () => ({
    addresses: ["93.184.216.34"],
    cnames: [],
    mx: ["mx.example.com"],
    txt: ["v=spf1 include:_spf.example.com ~all"],
    nameservers: ["ns1.example.com"],
    anomalies: [],
  })),
}));

vi.mock("@/lib/server/signals/ssl", () => ({
  runSslSignal: vi.fn(async () => ({
    protocol: "TLSv1.3",
    authorized: true,
    authorizationError: null,
    issuer: "Example CA",
    subject: "example.com",
    validFrom: "2025-01-01T00:00:00.000Z",
    validTo: "2027-01-01T00:00:00.000Z",
    daysRemaining: 240,
    selfSigned: false,
    fingerprint256: "abc123",
  })),
}));

vi.mock("@/lib/server/signals/redirect-chain", () => ({
  runRedirectSignal: vi.fn(async () => ({
    finalUrl: "https://example.com/",
    totalHops: 1,
    httpsUpgraded: true,
    hops: [
      {
        url: "http://example.com/",
        status: 301,
        location: "https://example.com/",
      },
      { url: "https://example.com/", status: 200 },
    ],
  })),
}));

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("VIRUSTOTAL_API_KEY", "vt-key");
  vi.stubEnv("GOOGLE_SAFE_BROWSING_API_KEY", "gsb-key");
  vi.stubEnv("HUGGINGFACE_API_KEY", "hf-key");
});

describe("analysis routes", () => {
  it("streams single analysis events", async () => {
    const { POST } = await import("@/app/api/analyze/route");
    installHandlers();

    const response = await POST(
      new Request("http://localhost/api/analyze", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ url: "example.com" }),
      }),
    );

    const text = await response.text();
    const events = text
      .trim()
      .split("\n")
      .map(
        (line) =>
          JSON.parse(line) as {
            type: string;
            name?: string;
            result?: { verdict?: string };
          },
      );

    expect(events[0]?.type).toBe("scan_started");
    expect(
      events.filter((event) => event.type === "signal_result"),
    ).toHaveLength(8);
    expect(events.at(-1)?.type).toBe("scan_complete");
  });

  it("streams batch analysis events", async () => {
    const { POST } = await import("@/app/api/analyze/batch/route");
    installHandlers();

    const response = await POST(
      new Request("http://localhost/api/analyze/batch", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ urls: ["example.com", "https://example.org"] }),
      }),
    );

    const text = await response.text();
    const events = text
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line) as { type: string });

    expect(events[0]?.type).toBe("batch_started");
    expect(events.filter((event) => event.type === "url_started")).toHaveLength(
      2,
    );
    expect(
      events.filter((event) => event.type === "url_complete"),
    ).toHaveLength(2);
    expect(events.at(-1)?.type).toBe("batch_complete");
  });
});

function installHandlers() {
  server.use(
    http.get("https://www.virustotal.com/api/v3/urls/:id", () =>
      HttpResponse.json({
        data: {
          attributes: {
            last_analysis_stats: {
              malicious: 0,
              suspicious: 0,
              harmless: 5,
              undetected: 20,
              timeout: 0,
            },
            last_analysis_results: {},
          },
        },
      }),
    ),
    http.post("https://safebrowsing.googleapis.com/v4/threatMatches:find", () =>
      HttpResponse.json({ matches: [] }),
    ),
    http.post("https://urlhaus-api.abuse.ch/v1/url/", () =>
      HttpResponse.json({ query_status: "no_results" }),
    ),
    http.get(
      "https://openphish.com/feed.txt",
      () => new HttpResponse("", { status: 200 }),
    ),
    http.post(
      "https://router.huggingface.co/hf-inference/models/:owner/:model",
      () => HttpResponse.json([[{ label: "benign", score: 0.12 }]]),
    ),
    http.get("https://rdap.org/domain/:hostname", () =>
      HttpResponse.json({
        handle: "EXAMPLE-1",
        country: "US",
        entities: [
          {
            roles: ["registrar"],
            vcardArray: ["vcard", [["fn", {}, "text", "Example Registrar"]]],
          },
        ],
        events: [
          {
            eventAction: "registration",
            eventDate: "2010-01-01T00:00:00.000Z",
          },
          { eventAction: "expiration", eventDate: "2030-01-01T00:00:00.000Z" },
        ],
      }),
    ),
  );
}
