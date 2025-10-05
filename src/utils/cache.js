/**
 * Cache Manager
 *
 * LRU cache implementation for storing API responses
 */
import { LRUCache } from 'lru-cache';

export class CacheManager {
  constructor(options = {}) {
    const maxSize = options.maxSize || parseInt(process.env.CACHE_MAX_SIZE || '1000', 10);
    const ttl = options.ttl || parseInt(process.env.CACHE_TTL || '3600000', 10);
    const enabled = options.enabled !== undefined ? options.enabled : process.env.CACHE_ENABLED !== 'false';

    this.enabled = enabled;

    if (this.enabled) {
      this.cache = new LRUCache({
        max: maxSize,
        ttl: ttl,
        updateAgeOnGet: true,
        updateAgeOnHas: false,
      });

      this.stats = {
        hits: 0,
        misses: 0,
        sets: 0,
      };
    }
  }

  /**
   * Get value from cache
   *
   * @param {string} key - Cache key
   * @returns {any} Cached value or undefined
   */
  get(key) {
    if (!this.enabled) return undefined;

    const value = this.cache.get(key);
    if (value !== undefined) {
      this.stats.hits++;
      return value;
    }
    this.stats.misses++;
    return undefined;
  }

  /**
   * Set value in cache
   *
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Optional TTL override
   */
  set(key, value, ttl) {
    if (!this.enabled) return;

    this.stats.sets++;
    if (ttl) {
      this.cache.set(key, value, { ttl });
    } else {
      this.cache.set(key, value);
    }
  }

  /**
   * Check if key exists in cache
   *
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    if (!this.enabled) return false;
    return this.cache.has(key);
  }

  /**
   * Delete key from cache
   *
   * @param {string} key - Cache key
   * @returns {boolean} True if key was deleted
   */
  delete(key) {
    if (!this.enabled) return false;
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear() {
    if (!this.enabled) return;
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, sets: 0 };
  }

  /**
   * Get cache statistics
   *
   * @returns {Object} Stats object with hits, misses, sets, size, and hit rate
   */
  getStats() {
    if (!this.enabled) {
      return {
        enabled: false,
        hits: 0,
        misses: 0,
        sets: 0,
        size: 0,
        hitRate: 0,
      };
    }

    return {
      enabled: true,
      hits: this.stats.hits,
      misses: this.stats.misses,
      sets: this.stats.sets,
      size: this.cache.size,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
    };
  }
}
