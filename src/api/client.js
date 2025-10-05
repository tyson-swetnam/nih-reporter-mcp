/**
 * NIH RePORTER API Client
 *
 * Handles all HTTP communication with the NIH RePORTER API v2.
 * Includes rate limiting, retry logic, and error handling.
 */
import axios from 'axios';
import { TokenBucket } from '../utils/rate-limiter.js';
import { handleAPIError, MCPError, ErrorCodes } from '../utils/error-handler.js';

export class NIHAPIClient {
  constructor(config = {}) {
    this.baseURL = config.baseURL || process.env.NIH_API_BASE_URL || 'https://api.reporter.nih.gov';
    this.timeout = config.timeout || parseInt(process.env.NIH_API_TIMEOUT || '30000', 10);

    // Initialize rate limiter (1 req/sec sustained, burst of 5)
    const requestsPerSecond = config.requestsPerSecond || parseFloat(process.env.RATE_LIMIT_REQUESTS_PER_SECOND || '1');
    const burstCapacity = config.burstCapacity || parseInt(process.env.RATE_LIMIT_BURST_CAPACITY || '5', 10);

    this.rateLimiter = new TokenBucket(burstCapacity, requestsPerSecond);

    // Create axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Set up axios interceptors for rate limiting and error handling
   */
  setupInterceptors() {
    // Request interceptor - enforce rate limiting
    this.client.interceptors.request.use(async (config) => {
      await this.rateLimiter.acquire();
      return config;
    });

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        throw handleAPIError(error, {
          url: error.config?.url,
          method: error.config?.method,
        });
      }
    );
  }

  /**
   * Search for research projects
   *
   * @param {Object} params - Search parameters
   * @param {Object} params.criteria - Search criteria (pi_names, org_names, fiscal_years, etc.)
   * @param {number} params.offset - Pagination offset (max 14,999)
   * @param {number} params.limit - Results per page (max 500)
   * @param {Object} options - Request options (maxRetries, retryDelay)
   * @returns {Promise<Object>} API response with results and metadata
   */
  async searchProjects(params, options = {}) {
    const { offset = 0, limit = 500, ...searchParams } = params;

    // Validate pagination limits per NIH API docs
    if (offset > 14999) {
      throw new MCPError(
        ErrorCodes.PAGINATION_LIMIT,
        'Offset cannot exceed 14,999 for project searches',
        { offset, maxOffset: 14999 }
      );
    }

    if (limit > 500) {
      throw new MCPError(
        ErrorCodes.PAGINATION_LIMIT,
        'Limit cannot exceed 500 records per request',
        { limit, maxLimit: 500 }
      );
    }

    const response = await this.retryableRequest(
      '/v2/projects/search',
      {
        ...searchParams,
        offset,
        limit: Math.min(limit, 500),
      },
      options
    );

    return response.data;
  }

  /**
   * Get a specific project by ID
   *
   * @param {string} projectId - Project number or application ID
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Project details
   */
  async getProject(projectId, options = {}) {
    // NIH API doesn't have a direct GET endpoint, so we search by project number
    const response = await this.searchProjects(
      {
        criteria: {
          project_nums: [projectId],
        },
        limit: 1,
      },
      options
    );

    if (!response.results || response.results.length === 0) {
      throw new MCPError(
        ErrorCodes.NOT_FOUND,
        `Project not found: ${projectId}`,
        { projectId }
      );
    }

    return response.results[0];
  }

  /**
   * Search for publications
   *
   * @param {Object} params - Search parameters
   * @param {Object} params.criteria - Search criteria (pmids, project_nums, etc.)
   * @param {number} params.offset - Pagination offset (max 9,999)
   * @param {number} params.limit - Results per page (max 500)
   * @param {Object} options - Request options
   * @returns {Promise<Object>} API response with publications
   */
  async searchPublications(params, options = {}) {
    const { offset = 0, limit = 500, ...searchParams } = params;

    // Validate pagination limits per NIH API docs
    if (offset > 9999) {
      throw new MCPError(
        ErrorCodes.PAGINATION_LIMIT,
        'Offset cannot exceed 9,999 for publication searches',
        { offset, maxOffset: 9999 }
      );
    }

    if (limit > 500) {
      throw new MCPError(
        ErrorCodes.PAGINATION_LIMIT,
        'Limit cannot exceed 500 records per request',
        { limit, maxLimit: 500 }
      );
    }

    const response = await this.retryableRequest(
      '/v2/publications/search',
      {
        ...searchParams,
        offset,
        limit: Math.min(limit, 500),
      },
      options
    );

    return response.data;
  }

  /**
   * Execute HTTP request with retry logic
   *
   * @param {string} url - API endpoint
   * @param {Object} data - Request body (null for GET requests)
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Axios response
   */
  async retryableRequest(url, data, options = {}) {
    const { method = data ? 'POST' : 'GET', maxRetries = 3, retryDelay = 1000 } = options;

    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const config = { method, url };
        if (data) config.data = data;

        return await this.client.request(config);
      } catch (error) {
        lastError = error;

        // Don't retry if error is not retryable or if this is the last attempt
        if (!error.isRetryable || attempt === maxRetries - 1) {
          throw error;
        }

        // Exponential backoff: 1s, 2s, 4s
        const delay = retryDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Get rate limiter state for debugging
   */
  getRateLimiterState() {
    return this.rateLimiter.getState();
  }
}
