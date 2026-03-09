export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 8_000,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort(new Error(`Timed out after ${timeoutMs}ms`));
  }, timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: init.signal ?? controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  label: string,
) {
  let timeoutId: NodeJS.Timeout | undefined;

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error(`${label} timed out after ${timeoutMs}ms`)),
      timeoutMs,
    );
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
