import type { AnalyzeEvent, BatchEvent } from "@/lib/domain/types";

type StreamEvent = AnalyzeEvent | BatchEvent;

export function createNdjsonResponse(
  run: (writer: NdjsonWriter) => Promise<void>,
) {
  const encoder = new TextEncoder();

  return new Response(
    new ReadableStream({
      async start(controller) {
        const writer = new NdjsonWriter(controller, encoder);
        try {
          await run(writer);
        } catch (error) {
          controller.error(error);
          return;
        }
        writer.close();
      },
    }),
    {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-store",
      },
    },
  );
}

export class NdjsonWriter {
  private closed = false;

  constructor(
    private readonly controller: ReadableStreamDefaultController<Uint8Array>,
    private readonly encoder: TextEncoder,
  ) {}

  send(event: StreamEvent) {
    if (this.closed) {
      return;
    }
    this.controller.enqueue(this.encoder.encode(`${JSON.stringify(event)}\n`));
  }

  close() {
    if (this.closed) {
      return;
    }
    this.closed = true;
    this.controller.close();
  }
}
