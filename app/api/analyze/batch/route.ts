import { normalizeUrlInput } from "@/lib/domain/url";
import { runAnalysis } from "@/lib/server/analyze";
import { createApiError } from "@/lib/server/api-error";
import { createNdjsonResponse } from "@/lib/server/stream";

export const runtime = "nodejs";

const MAX_BATCH_SIZE = 10;
const CONCURRENCY = 3;

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (!body || !Array.isArray(body.urls)) {
    return Response.json(
      {
        error: createApiError(
          "invalid_request",
          "Request body must include a urls array.",
          false,
        ),
      },
      { status: 400 },
    );
  }

  const urls = body.urls;

  if (urls.length === 0 || urls.length > MAX_BATCH_SIZE) {
    return Response.json(
      {
        error: createApiError(
          "invalid_batch_size",
          `Batch scans must contain between 1 and ${MAX_BATCH_SIZE} URLs.`,
          false,
        ),
      },
      { status: 400 },
    );
  }

  if (!urls.every((item): item is string => typeof item === "string")) {
    return Response.json(
      {
        error: createApiError(
          "invalid_request",
          "Each batch item must be a string URL.",
          false,
        ),
      },
      { status: 400 },
    );
  }

  const validated = urls.map((item) => normalizeUrlInput(item));
  const invalid = validated.find((result) => !result.ok);
  if (invalid && !invalid.ok) {
    return Response.json(
      {
        error: createApiError("invalid_url", invalid.error, false),
      },
      { status: 400 },
    );
  }

  return createNdjsonResponse(async (writer) => {
    writer.send({
      type: "batch_started",
      total: urls.length,
      startedAt: new Date().toISOString(),
    });

    const results = await mapWithConcurrency(
      urls,
      CONCURRENCY,
      async (url, index) => {
        writer.send({
          type: "url_started",
          index,
          url,
        });

        const outcome = await runAnalysis(url, {
          scanId: crypto.randomUUID(),
          startedAt: new Date().toISOString(),
        });

        if (!outcome.ok) {
          throw new Error(outcome.error.message);
        }

        writer.send({
          type: "url_complete",
          index,
          url: outcome.result.url,
          result: outcome.result,
        });

        return outcome.result;
      },
    );

    writer.send({
      type: "batch_complete",
      results,
    });
  });
}

async function readJsonBody(request: Request) {
  try {
    return (await request.json()) as { urls?: unknown[] } | null;
  } catch {
    return null;
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
) {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  const runners = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (nextIndex < items.length) {
        const currentIndex = nextIndex;
        nextIndex += 1;
        const item = items[currentIndex];
        if (item === undefined) {
          continue;
        }

        results[currentIndex] = await worker(item, currentIndex);
      }
    },
  );

  await Promise.all(runners);
  return results;
}
