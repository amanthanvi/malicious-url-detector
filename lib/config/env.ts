import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  VIRUSTOTAL_API_KEY: z.string().min(1).optional(),
  GOOGLE_SAFE_BROWSING_API_KEY: z.string().min(1).optional(),
  HUGGINGFACE_API_KEY: z.string().min(1).optional(),
  URLHAUS_AUTH_KEY: z.string().min(1).optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  HUGGINGFACE_URL_MODEL: z
    .string()
    .min(1)
    .default("DunnBC22/codebert-base-Malicious_URLs"),
  OPENPHISH_FEED_URL: z
    .string()
    .url()
    .default("https://openphish.com/feed.txt"),
});

export type AppEnv = z.infer<typeof envSchema>;

let cachedEnv: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  cachedEnv = envSchema.parse(process.env);
  return cachedEnv;
}

export function resetEnvForTests() {
  cachedEnv = null;
}

export function isProviderConfigured(key: keyof AppEnv) {
  const value = getEnv()[key];
  return typeof value === "string" && value.length > 0;
}
