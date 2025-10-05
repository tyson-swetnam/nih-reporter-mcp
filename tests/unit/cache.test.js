/**
 * Unit tests for Cache Manager
 */
import { describe, it, expect, beforeEach } from '@jest/globals';
import { CacheManager } from '../../src/utils/cache.js';

describe('CacheManager', () => {
  let cache;

  beforeEach(() => {
    cache = new CacheManager({ maxSize: 10, ttl: 1000, enabled: true });
  });

  describe('get and set', () => {
    it('should store and retrieve values', () => {
      cache.set('key1', { data: 'value1' });
      const result = cache.get('key1');

      expect(result).toEqual({ data: 'value1' });
    });

    it('should return undefined for missing keys', () => {
      const result = cache.get('nonexistent');
      expect(result).toBeUndefined();
    });

    it('should track cache hits and misses', () => {
      cache.set('key1', 'value1');
      cache.get('key1'); // hit
      cache.get('key2'); // miss

      const stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.sets).toBe(1);
    });
  });

  describe('has', () => {
    it('should check if key exists', () => {
      cache.set('key1', 'value1');

      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should remove key from cache', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);

      cache.delete('key1');
      expect(cache.has('key1')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all entries and reset stats', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.get('key1');

      cache.clear();

      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(false);

      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.sets).toBe(0);
    });
  });

  describe('TTL expiration', () => {
    it('should expire entries after TTL', async () => {
      const shortTTLCache = new CacheManager({ maxSize: 10, ttl: 50, enabled: true });

      shortTTLCache.set('key1', 'value1');
      expect(shortTTLCache.get('key1')).toBe('value1');

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(shortTTLCache.get('key1')).toBeUndefined();
    });
  });

  describe('LRU eviction', () => {
    it('should evict least recently used items when max size exceeded', () => {
      const smallCache = new CacheManager({ maxSize: 3, ttl: 10000, enabled: true });

      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      smallCache.set('key3', 'value3');

      // Access key1 to make it more recently used
      smallCache.get('key1');

      // Add key4, should evict key2 (least recently used)
      smallCache.set('key4', 'value4');

      expect(smallCache.has('key1')).toBe(true);
      expect(smallCache.has('key2')).toBe(false);
      expect(smallCache.has('key3')).toBe(true);
      expect(smallCache.has('key4')).toBe(true);
    });
  });

  describe('disabled cache', () => {
    it('should not cache when disabled', () => {
      const disabledCache = new CacheManager({ enabled: false });

      disabledCache.set('key1', 'value1');
      expect(disabledCache.get('key1')).toBeUndefined();

      const stats = disabledCache.getStats();
      expect(stats.enabled).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should calculate hit rate correctly', () => {
      cache.set('key1', 'value1');
      cache.get('key1'); // hit
      cache.get('key1'); // hit
      cache.get('key2'); // miss
      cache.get('key3'); // miss

      const stats = cache.getStats();
      expect(stats.hitRate).toBe(0.5); // 2 hits / 4 total
    });
  });
});
