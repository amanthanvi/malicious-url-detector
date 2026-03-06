import type { ApiError } from "@/lib/domain/types";

export function createApiError(
  code: string,
  message: string,
  retryable: boolean,
): ApiError {
  return { code, message, retryable };
}
