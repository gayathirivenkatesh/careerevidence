import { describe, expect, it } from 'vitest';
import { withRetry } from '../modules/jobs/collection/retry';

describe('withRetry', () => {
  it('returns immediately when operation succeeds', async () => {
    const operation = async () => 'success';

    const result = await withRetry(operation, {
      retries: 2,
      delayMs: 1,
    });

    expect(result).toBe('success');
  });

  it('retries when operation fails', async () => {
    let attempts = 0;

    const operation = async () => {
      attempts += 1;

      if (attempts < 3) {
        throw new Error('temporary failure');
      }

      return 'success';
    };

    const result = await withRetry(operation, {
      retries: 3,
      delayMs: 1,
    });

    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });

  it('throws after retries are exhausted', async () => {
    let attempts = 0;

    const operation = async () => {
      attempts += 1;
      throw new Error('failure');
    };

    await expect(
      withRetry(operation, {
        retries: 2,
        delayMs: 1,
      }),
    ).rejects.toThrow('failure');

    expect(attempts).toBe(3);
  });
});