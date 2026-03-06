import { describe, expect, it } from "vitest";

import {
  getEnv,
  isProviderConfigured,
  resetEnvForTests,
} from "@/lib/config/env";

describe("env parsing", () => {
  it("applies defaults for optional values", () => {
    delete process.env.HUGGINGFACE_URL_MODEL;
    delete process.env.OPENPHISH_FEED_URL;
    resetEnvForTests();

    const env = getEnv();

    expect(env.HUGGINGFACE_URL_MODEL).toBe(
      "DunnBC22/codebert-base-Malicious_URLs",
    );
    expect(env.OPENPHISH_FEED_URL).toBe("https://openphish.com/feed.txt");
  });

  it("reports provider availability", () => {
    process.env.VIRUSTOTAL_API_KEY = "vt-test-key";
    resetEnvForTests();

    expect(isProviderConfigured("VIRUSTOTAL_API_KEY")).toBe(true);
  });
});
