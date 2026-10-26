export interface RetryOptions {
  retries: number;
  delayMs: number;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  let lastError: unknown;

  for (
    let attempt = 0;
    attempt <= options.retries;
    attempt += 1
  ) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === options.retries) {
        break;
      }

      const delay = options.delayMs * 2 ** attempt;

      await new Promise<void>((resolve) => {
        setTimeout(resolve, delay);
      });
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Operation failed after retries.');
}