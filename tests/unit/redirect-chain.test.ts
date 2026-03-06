import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { runRedirectSignal } from "@/lib/server/signals/redirect-chain";

const fixturesDir = path.join(process.cwd(), "tests/fixtures");
const key = fs.readFileSync(
  path.join(fixturesDir, "localhost-self-signed.key.pem"),
  "utf8",
);
const cert = fs.readFileSync(
  path.join(fixturesDir, "localhost-self-signed.cert.pem"),
  "utf8",
);

let httpServer: http.Server | undefined;
let httpsServer: https.Server | undefined;
let httpUrl = "";
let httpsUrl = "";

beforeAll(async () => {
  httpsServer = https.createServer({ key, cert }, (_request, response) => {
    response.writeHead(200, {
      "content-type": "text/plain",
    });
    response.end("ok");
  });

  await new Promise<void>((resolve) => {
    httpsServer?.listen(0, "127.0.0.1", () => {
      resolve();
    });
  });

  const httpsAddress = httpsServer.address();
  if (!httpsAddress || typeof httpsAddress === "string") {
    throw new Error("Failed to determine HTTPS test server port.");
  }

  httpsUrl = `https://127.0.0.1:${httpsAddress.port}/secure`;

  httpServer = http.createServer((_request, response) => {
    response.writeHead(301, {
      location: httpsUrl,
    });
    response.end();
  });

  await new Promise<void>((resolve) => {
    httpServer?.listen(0, "127.0.0.1", () => {
      resolve();
    });
  });

  const httpAddress = httpServer.address();
  if (!httpAddress || typeof httpAddress === "string") {
    throw new Error("Failed to determine HTTP test server port.");
  }

  httpUrl = `http://127.0.0.1:${httpAddress.port}/start`;
});

afterAll(async () => {
  await Promise.all([
    new Promise<void>((resolve, reject) => {
      httpServer?.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    }),
    new Promise<void>((resolve, reject) => {
      httpsServer?.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    }),
  ]);
});

describe("runRedirectSignal", () => {
  it("follows an HTTP redirect into a self-signed HTTPS endpoint", async () => {
    const result = await runRedirectSignal(httpUrl);

    expect(result.finalUrl).toBe(httpsUrl);
    expect(result.totalHops).toBe(1);
    expect(result.httpsUpgraded).toBe(true);
    expect(result.hops).toEqual([
      {
        url: httpUrl,
        status: 301,
        location: httpsUrl,
      },
      {
        url: httpsUrl,
        status: 200,
      },
    ]);
  });

  it("can inspect a self-signed HTTPS URL without failing the signal", async () => {
    const result = await runRedirectSignal(httpsUrl);

    expect(result.finalUrl).toBe(httpsUrl);
    expect(result.totalHops).toBe(0);
    expect(result.httpsUpgraded).toBe(false);
    expect(result.hops).toEqual([
      {
        url: httpsUrl,
        status: 200,
      },
    ]);
  });
});
