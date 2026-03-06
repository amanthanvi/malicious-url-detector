import { describe, expect, it } from "vitest";

import { buildThreatAssessment } from "@/lib/domain/verdict";
import { createPendingSignalResults } from "@/lib/domain/types";

describe("buildThreatAssessment", () => {
  it("returns error when every signal fails", () => {
    const signals = createPendingSignalResults();
    for (const signal of Object.values(signals)) {
      signal.status = "error";
      signal.error = "failed";
    }

    const result = buildThreatAssessment(signals);

    expect(result.verdict).toBe("error");
    expect(result.threatInfo).toBeNull();
  });

  it("returns safe when only low-risk local signals succeed", () => {
    const signals = createPendingSignalResults();
    signals.ssl = {
      status: "success",
      error: null,
      durationMs: 12,
      data: {
        protocol: "TLSv1.3",
        authorized: true,
        authorizationError: null,
        issuer: "Example CA",
        subject: "example.com",
        validFrom: "2025-01-01T00:00:00.000Z",
        validTo: "2027-01-01T00:00:00.000Z",
        daysRemaining: 180,
        selfSigned: false,
        fingerprint256: "abc",
      },
    };
    signals.dns = {
      status: "success",
      error: null,
      durationMs: 12,
      data: {
        addresses: ["93.184.216.34"],
        cnames: [],
        mx: ["mx.example.com"],
        txt: [],
        nameservers: ["ns1.example.com"],
        anomalies: [],
      },
    };

    const result = buildThreatAssessment(signals);

    expect(result.verdict).toBe("safe");
    expect(result.threatInfo?.summary).toMatch(
      /No strong malicious indicators/,
    );
  });

  it("promotes high-confidence reputation signals to malicious or critical", () => {
    const signals = createPendingSignalResults();
    signals.virusTotal = {
      status: "success",
      error: null,
      durationMs: 20,
      data: {
        malicious: 9,
        suspicious: 2,
        harmless: 1,
        undetected: 12,
        timeout: 0,
        results: [],
        permalink: "https://www.virustotal.com/gui/url/example",
      },
    };
    signals.googleSafeBrowsing = {
      status: "success",
      error: null,
      durationMs: 8,
      data: {
        checkedAt: "2026-03-06T00:00:00.000Z",
        matches: [
          {
            threatType: "SOCIAL_ENGINEERING",
            platformType: "ANY_PLATFORM",
            threatEntryType: "URL",
          },
        ],
      },
    };

    const result = buildThreatAssessment(signals);

    expect(["malicious", "critical"]).toContain(result.verdict);
    expect(result.threatInfo?.reasons.join(" ")).toMatch(
      /VirusTotal|Safe Browsing/,
    );
  });
});
