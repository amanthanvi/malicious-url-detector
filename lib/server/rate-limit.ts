import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { createApiError } from "@/lib/server/api-error";

type LimitResult =
  | {
      success: true;
      remaining: number;
      reset: number;
    }
  | {
      success: false;
      remaining: number;
      reset: number;
      status: number;
      error: ReturnType<typeof createApiError>;
    };

type WindowRecord = {
  count: number;
  resetAt: number;
};

declare global {
  var __devRateLimitStore: Map<string, WindowRecord> | undefined;
}

const MINUTE_LIMIT = 10;
const DAY_LIMIT = 50;

export async function applyRateLimit(identifier: string): Promise<LimitResult> {
  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test"
  ) {
    return applyInMemoryLimit(identifier);
  }

  const { url: redisUrl, token: redisToken } = getRedisRestConfig();

  if (!redisUrl || !redisToken) {
    console.warn(
      JSON.stringify({
        level: "warn",
        event: "rate_limit.degraded",
        mode: "in-memory",
        message:
          "Upstash credentials are missing; falling back to process-local rate limiting.",
      }),
    );

    return applyInMemoryLimit(identifier);
  }

  const redis = Redis.fromEnv();
  const minuteLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(MINUTE_LIMIT, "1 m"),
    prefix: "mud:minute",
  });
  const dayLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(DAY_LIMIT, "1 d"),
    prefix: "mud:day",
  });

  const [minute, day] = await Promise.all([
    minuteLimiter.limit(identifier),
    dayLimiter.limit(identifier),
  ]);

  if (!minute.success || !day.success) {
    const reset = Math.min(minute.reset, day.reset);
    return {
      success: false,
      remaining: Math.min(minute.remaining, day.remaining),
      reset,
      status: 429,
      error: createApiError(
        "rate_limited",
        "Rate limit exceeded. Please retry after the cooldown window.",
        true,
      ),
    };
  }

  return {
    success: true,
    remaining: Math.min(minute.remaining, day.remaining),
    reset: Math.min(minute.reset, day.reset),
  };
}

export function getRedisRestConfig() {
  return {
    url: process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL,
    token:
      process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN,
  };
}

function applyInMemoryLimit(identifier: string): LimitResult {
  const store =
    globalThis.__devRateLimitStore ?? new Map<string, WindowRecord>();
  globalThis.__devRateLimitStore = store;
  const now = Date.now();

  const minute = incrementWindow(
    store,
    `minute:${identifier}`,
    MINUTE_LIMIT,
    60_000,
    now,
  );
  const day = incrementWindow(
    store,
    `day:${identifier}`,
    DAY_LIMIT,
    86_400_000,
    now,
  );

  if (!minute.success || !day.success) {
    return {
      success: false,
      remaining: Math.min(minute.remaining, day.remaining),
      reset: Math.min(minute.reset, day.reset),
      status: 429,
      error: createApiError(
        "rate_limited",
        "Rate limit exceeded. Please retry after the cooldown window.",
        true,
      ),
    };
  }

  return {
    success: true,
    remaining: Math.min(minute.remaining, day.remaining),
    reset: Math.min(minute.reset, day.reset),
  };
}

function incrementWindow(
  store: Map<string, WindowRecord>,
  key: string,
  limit: number,
  windowMs: number,
  now: number,
) {
  const current = store.get(key);
  if (!current || current.resetAt <= now) {
    const next = {
      count: 1,
      resetAt: now + windowMs,
    };
    store.set(key, next);
    return {
      success: true,
      remaining: limit - 1,
      reset: next.resetAt,
    };
  }

  current.count += 1;
  store.set(key, current);

  return {
    success: current.count <= limit,
    remaining: Math.max(0, limit - current.count),
    reset: current.resetAt,
  };
}
