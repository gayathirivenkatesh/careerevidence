export class RateLimiter {
  private nextAvailableAt = 0;

  constructor(
    private readonly delayMs: number,
  ) {}

  async wait(): Promise<void> {
    const now = Date.now();

    const waitMs = Math.max(
      0,
      this.nextAvailableAt - now,
    );

    if (waitMs > 0) {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, waitMs);
      });
    }

    this.nextAvailableAt =
      Date.now() + this.delayMs;
  }
}