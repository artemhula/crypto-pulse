export const DEFAULT_MAX_SEND_ATTEMPTS = 3;
export const DEFAULT_BASE_DELAY_MS = 1000;

export function sleep(delayMs: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, delayMs));
}

export function exponentialBackoffDelay(
  attempt: number,
  baseDelayMs: number = DEFAULT_BASE_DELAY_MS,
): number {
  return baseDelayMs * 2 ** (attempt - 1);
}

export function getErrorStatusCode(error: unknown): number | undefined {
  if (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    typeof (error as { statusCode: unknown }).statusCode === 'number'
  ) {
    return (error as { statusCode: number }).statusCode;
  }
  return undefined;
}

export function getErrorRetryAfterSeconds(error: unknown): number | undefined {
  if (
    typeof error !== 'object' ||
    error === null ||
    !('headers' in error) ||
    typeof (error as { headers: unknown }).headers !== 'object'
  ) {
    return undefined;
  }

  const headers = (error as { headers: Record<string, unknown> }).headers;
  const retryAfter = headers?.['retry-after'];
  if (retryAfter === undefined || retryAfter === null) {
    return undefined;
  }

  const seconds = Number(retryAfter);
  return Number.isNaN(seconds) ? undefined : seconds;
}

export interface RetryAfterLimit {
  attempts: number;
  delayMs: number;
}

export function computeRetryDelay(
  attempt: number,
  error: unknown,
  opts: {
    baseDelayMs?: number;
    statusCode?: number;
    rateLimitStatus?: number;
    fallbackRateLimitDelayMs?: number;
  } = {},
): number {
  const statusCode = opts.statusCode ?? getErrorStatusCode(error);

  if (opts.rateLimitStatus !== undefined && statusCode === opts.rateLimitStatus) {
    const retryAfter = getErrorRetryAfterSeconds(error);
    if (retryAfter !== undefined) {
      return retryAfter * 1000;
    }
    if (opts.fallbackRateLimitDelayMs !== undefined) {
      return opts.fallbackRateLimitDelayMs;
    }
  }

  return exponentialBackoffDelay(attempt, opts.baseDelayMs);
}
