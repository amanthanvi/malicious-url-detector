import tls from "node:tls";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getTlsProbeTarget, runSslSignal } from "@/lib/server/signals/ssl";

describe("getTlsProbeTarget", () => {
  it("uses explicit https port when present", () => {
    const { hostname, port } = getTlsProbeTarget(
      "https://15.58.86.110:38376/bin.sh",
    );
    expect(hostname).toBe("15.58.86.110");
    expect(port).toBe(38376);
  });

  it("defaults https to 443 when port omitted", () => {
    const { port } = getTlsProbeTarget("https://example.com/path");
    expect(port).toBe(443);
  });

  it("defaults http to 80 when port omitted", () => {
    const { port } = getTlsProbeTarget("http://example.com/path");
    expect(port).toBe(80);
  });
});

describe("runSslSignal", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("passes resolved port into tls.connect", async () => {
    const connectSpy = vi.spyOn(tls, "connect").mockImplementation(() => {
      const socket = {
        setTimeout: vi.fn(),
        once: vi.fn((event: string, handler: (err?: Error) => void) => {
          if (event === "error") {
            queueMicrotask(() => {
              const err = new Error("connect ECONNREFUSED") as Error & {
                code?: string;
              };
              err.code = "ECONNREFUSED";
              handler(err);
            });
          }
        }),
        destroy: vi.fn(),
        end: vi.fn(),
      };
      return socket as unknown as tls.TLSSocket;
    });

    const result = await runSslSignal("https://15.58.86.110:38376/bin.sh");

    expect(connectSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        host: "15.58.86.110",
        port: 38376,
      }),
    );
    expect(result.available).toBe(false);
    expect(result.observations[0]).toContain("38376");
  });

  it("blocks private literal IPs before opening a TLS socket", async () => {
    const connectSpy = vi.spyOn(tls, "connect");

    const result = await runSslSignal("https://127.0.0.1:443/");

    expect(connectSpy).not.toHaveBeenCalled();
    expect(result.available).toBe(false);
    expect(result.observations[0]).toContain("private");
  });
});
