/**
 * Unit tests for Token Bucket Rate Limiter
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { TokenBucket } from '../../src/utils/rate-limiter.js';

describe('TokenBucket', () => {
  let rateLimiter;

  beforeEach(() => {
    rateLimiter = new TokenBucket(5, 10); // Capacity 5, refill 10 tokens/sec (fast for tests)
  });

  describe('constructor', () => {
    it('should initialize with correct capacity and refill rate', () => {
      const state = rateLimiter.getState();
      expect(state.capacity).toBe(5);
      expect(state.tokens).toBe(5);
      expect(state.refillRate).toBe(10);
      expect(state.queueLength).toBe(0);
    });
  });

  describe('acquire', () => {
    it('should immediately grant token when available', async () => {
      const startTime = Date.now();
      await rateLimiter.acquire();
      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeLessThan(10); // Should be immediate
      expect(rateLimiter.getState().tokens).toBe(4);
    });

    it('should allow burst up to capacity', async () => {
      // Acquire 5 tokens (full capacity)
      for (let i = 0; i < 5; i++) {
        await rateLimiter.acquire();
      }

      expect(rateLimiter.getState().tokens).toBe(0);
    });

    it('should queue requests when tokens exhausted', async () => {
      // Exhaust all tokens
      for (let i = 0; i < 5; i++) {
        await rateLimiter.acquire();
      }

      // This should be queued
      const promise = rateLimiter.acquire();
      expect(rateLimiter.getState().queueLength).toBe(1);

      await promise;
    });

    it('should refill tokens over time', async () => {
      // Exhaust tokens
      for (let i = 0; i < 5; i++) {
        await rateLimiter.acquire();
      }

      // Wait for refill (100ms = 1 token at 10 tokens/sec)
      await new Promise((resolve) => setTimeout(resolve, 150));

      const state = rateLimiter.getState();
      expect(state.tokens).toBeGreaterThan(0);
    });
  });

  describe('refill', () => {
    it('should not exceed capacity when refilling', async () => {
      // Wait for potential refill
      await new Promise((resolve) => setTimeout(resolve, 200));

      rateLimiter.refill();
      const state = rateLimiter.getState();

      expect(state.tokens).toBeLessThanOrEqual(state.capacity);
      expect(state.tokens).toBe(5); // Should cap at capacity
    });
  });
});
