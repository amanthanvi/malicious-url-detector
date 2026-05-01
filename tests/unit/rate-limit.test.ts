import { beforeEach, describe, expect, it, vi } from "vitest";

const redisConstructor = vi.hoisted(() =>
  vi.fn(function Redis() {
    return {};
  }),
);

vi.mock("@upstash/redis", () => ({
  Redis: redisConstructor,
}));

vi.mock("@upstash/ratelimit", () => {
  class MockRatelimit {
    static slidingWindow(limit: number, window: string) {
      return { limit, window };
    }

    async limit() {
      return {
        success: true,
        remaining: 9,
        reset: 1_900_000_000_000,
      };
    }
  }

  return {
    Ratelimit: MockRatelimit,
  };
});

import { applyRateLimit, getRedisRestConfig } from "@/lib/server/rate-limit";

describe("applyRateLimit", () => {
  beforeEach(() => {
    redisConstructor.mockClear();
  });

  it("enforces the per-minute limit in development mode", async () => {
    vi.stubEnv("NODE_ENV", "development");

    let lastResult = await applyRateLimit("127.0.0.1");
    for (let index = 1; index < 10; index += 1) {
      lastResult = await applyRateLimit("127.0.0.1");
    }

    expect(lastResult.success).toBe(true);

    const blocked = await applyRateLimit("127.0.0.1");
    expect(blocked.success).toBe(false);
    if (!blocked.success) {
      expect(blocked.status).toBe(429);
    }
  });

  it("falls back to in-memory limits when Upstash is missing in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;

    const result = await applyRateLimit("203.0.113.10");

    expect(result.success).toBe(true);
  });

  it("accepts Vercel KV aliases for Upstash REST config", () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    vi.stubEnv("KV_REST_API_URL", "https://example-kv.upstash.io");
    vi.stubEnv("KV_REST_API_TOKEN", "kv-token");

    expect(getRedisRestConfig()).toEqual({
      url: "https://example-kv.upstash.io",
      token: "kv-token",
    });
  });

  it("constructs Redis from Vercel KV aliases in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    vi.stubEnv("KV_REST_API_URL", "https://example-kv.upstash.io");
    vi.stubEnv("KV_REST_API_TOKEN", "kv-token");

    const result = await applyRateLimit("203.0.113.20");

    expect(result.success).toBe(true);
    expect(redisConstructor).toHaveBeenCalledWith({
      url: "https://example-kv.upstash.io",
      token: "kv-token",
    });
  });
});
