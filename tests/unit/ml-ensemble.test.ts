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
});
