import { spawn } from "node:child_process";

const HOST = "127.0.0.1";
const PORT = "3000";
const BASE_URL = `http://${HOST}:${PORT}/`;
const TIMEOUT_MS = 60_000;
const POLL_INTERVAL_MS = 1_000;

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";
const server = spawn(
  npmCommand,
  ["run", "start", "--", "--hostname", HOST, "--port", PORT],
  {
    env: process.env,
    stdio: "inherit",
  },
);

let cleanedUp = false;

const cleanup = () => {
  if (cleanedUp) {
    return;
  }

  cleanedUp = true;
  if (!server.killed) {
    server.kill("SIGTERM");
  }
};

process.on("exit", cleanup);
process.on("SIGINT", () => {
  cleanup();
  process.exit(130);
});
process.on("SIGTERM", () => {
  cleanup();
  process.exit(143);
});

server.once("exit", (code) => {
  if (!cleanedUp) {
    console.error(
      `E2E server exited unexpectedly with code ${code ?? "unknown"}.`,
    );
    process.exit(code ?? 1);
  }
});

await waitForServer();

const testRunner = spawn(
  npxCommand,
  ["playwright", "test", ...process.argv.slice(2)],
  {
    env: process.env,
    stdio: "inherit",
  },
);

const testExitCode = await new Promise((resolve) => {
  testRunner.once("exit", (code) => {
    resolve(code ?? 1);
  });
});

cleanup();
process.exit(testExitCode);

async function waitForServer() {
  const startedAt = Date.now();

  while (Date.now() - startedAt < TIMEOUT_MS) {
    try {
      const response = await fetch(BASE_URL, {
        method: "HEAD",
        headers: {
          accept: "text/html",
        },
        signal: AbortSignal.timeout(2_000),
      });

      if (response.ok) {
        return;
      }
    } catch {
      // The server is still booting.
    }

    await sleep(POLL_INTERVAL_MS);
  }

  cleanup();
  throw new Error(`Timed out waiting for ${BASE_URL} after ${TIMEOUT_MS}ms.`);
}

function sleep(durationMs) {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
}
