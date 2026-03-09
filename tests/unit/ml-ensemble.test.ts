import { afterEach, describe, expect, it, vi } from "vitest";

import { runMlEnsembleProvider } from "@/lib/server/providers/ml-ensemble";

describe("runMlEnsembleProvider", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps the supported Hugging Face router payload to a malicious verdict", async () => {
    vi.stubEnv("HUGGINGFACE_API_KEY", "hf-test-key");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify([
          [
            { label: "phishing", score: 0.91 },
            { label: "benign", score: 0.09 },
          ],
        ]),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    const result = await runMlEnsembleProvider(
      "https://xn--secure-account.top/login/verify/update?token=%2Fabc",
    );

    expect(result.hostedModel).toMatchObject({
      label: "malicious",
      model: "huggingface",
    });
    expect(result.lexicalModel.label).toBe("risky");
    expect(result.consensusLabel).toBe("malicious");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "https://router.huggingface.co/hf-inference/models/",
      ),
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("surfaces an explicit warning when the configured model is not hosted", async () => {
    vi.stubEnv("HUGGINGFACE_API_KEY", "hf-test-key");
    vi.stubEnv("HUGGINGFACE_URL_MODEL", "missing/model");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Not Found", { status: 404 }),
    );

    const result = await runMlEnsembleProvider("https://example.com/");

    expect(result.hostedModel).toBeNull();
    expect(result.warnings[0]).toContain("is not available");
  });

  it("keeps benign hosted predictions benign even when their class confidence is above 45%", async () => {
    vi.stubEnv("HUGGINGFACE_API_KEY", "hf-test-key");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify([
          [
            { label: "benign", score: 0.59 },
            { label: "phishing", score: 0.41 },
          ],
        ]),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    const result = await runMlEnsembleProvider("https://example.com/");

    expect(result.hostedModel).toMatchObject({
      label: "benign",
    });
    expect(result.consensusLabel).toBe("benign");
  });

  it("elevates literal-IP executable paths even when the hosted model is unavailable", async () => {
    vi.stubEnv("HUGGINGFACE_API_KEY", "hf-test-key");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("gateway error", { status: 502 }),
    );

    const result = await runMlEnsembleProvider(
      "https://45.151.155.223/x86_64?download=setup",
    );

    expect(result.hostedModel).toBeNull();
    expect(result.lexicalModel.label).toBe("malicious");
    expect(result.consensusLabel).toBe("malicious");
    expect(result.lexicalModel.reasons.join(" ")).toMatch(
      /literal IP address|executable-style content/i,
    );
  });
});
