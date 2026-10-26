import { describe, expect, it } from 'vitest';
import { RateLimiter } from '../modules/jobs/collection/rate-limiter';

describe('RateLimiter', () => {
  it('waits between consecutive requests', async () => {
    const limiter = new RateLimiter(10);

    await limiter.wait();

    const start = Date.now();

    await limiter.wait();

    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThanOrEqual(8);
  });
});