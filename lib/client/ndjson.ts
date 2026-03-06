export async function readNdjsonStream<T>(
  response: Response,
  onEvent: (event: T) => void,
) {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Readable response body is not available.");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) {
        continue;
      }

      onEvent(JSON.parse(line) as T);
    }
  }

  if (buffer.trim()) {
    onEvent(JSON.parse(buffer) as T);
  }
}
