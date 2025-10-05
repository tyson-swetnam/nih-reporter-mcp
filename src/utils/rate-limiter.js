/**
 * Token Bucket Rate Limiter
 *
 * Implements a token bucket algorithm for rate limiting API requests.
 * Allows bursts up to capacity while maintaining sustained rate over time.
 */
export class TokenBucket {
  constructor(capacity = 5, refillRate = 1) {
    this.capacity = capacity;        // Max burst capacity
    this.tokens = capacity;          // Current available tokens
    this.refillRate = refillRate;    // Tokens added per second
    this.lastRefill = Date.now();
    this.queue = [];
  }

  /**
   * Acquire a token for making a request.
   * Returns immediately if token available, otherwise queues the request.
   * @returns {Promise<void>}
   */
  async acquire() {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return Promise.resolve();
    }

    // Queue the request
    return new Promise((resolve) => {
      this.queue.push({ resolve, timestamp: Date.now() });
      this.processQueue();
    });
  }

  /**
   * Refill tokens based on elapsed time
   */
  refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    const tokensToAdd = elapsed * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Process queued requests when tokens become available
   */
  processQueue() {
    if (this.queue.length === 0) return;

    this.refill();

    while (this.tokens >= 1 && this.queue.length > 0) {
      const { resolve } = this.queue.shift();
      this.tokens -= 1;
      resolve();
    }

    // Schedule next queue processing if items remain
    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), 1000 / this.refillRate);
    }
  }

  /**
   * Get current state for debugging
   */
  getState() {
    return {
      tokens: this.tokens,
      capacity: this.capacity,
      queueLength: this.queue.length,
      refillRate: this.refillRate,
    };
  }
}
