/**
 * Error Handling Utilities for MCP Server
 *
 * Provides standardized error types and handling for NIH API interactions
 */

/**
 * Custom error class for MCP operations
 */
export class MCPError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'MCPError';
    this.code = code;
    this.details = details;
    this.isRetryable = false;
  }
}

/**
 * Standard error codes used throughout the application
 */
export const ErrorCodes = {
  INVALID_PARAMS: 'INVALID_PARAMS',
  API_ERROR: 'API_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  TIMEOUT: 'TIMEOUT',
  NOT_FOUND: 'NOT_FOUND',
  PAGINATION_LIMIT: 'PAGINATION_LIMIT',
  NETWORK_ERROR: 'NETWORK_ERROR',
};

/**
 * Transform axios/API errors into standardized MCPError instances
 *
 * @param {Error} error - Original error from axios or API
 * @param {Object} context - Additional context about the request
 * @returns {MCPError} Standardized error
 */
export function handleAPIError(error, context = {}) {
  // Handle axios response errors
  if (error.response) {
    const status = error.response.status;

    // Rate limit error
    if (status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 60;
      const err = new MCPError(
        ErrorCodes.RATE_LIMIT,
        `Rate limit exceeded. Retry after ${retryAfter} seconds.`,
        { retryAfter, status, context }
      );
      err.isRetryable = true;
      return err;
    }

    // Server errors (5xx) - retryable
    if (status >= 500) {
      const err = new MCPError(
        ErrorCodes.API_ERROR,
        `NIH API server error: ${error.response.statusText}`,
        { status, context, response: error.response.data }
      );
      err.isRetryable = true;
      return err;
    }

    // Not found
    if (status === 404) {
      return new MCPError(
        ErrorCodes.NOT_FOUND,
        `Resource not found: ${context.url || 'unknown'}`,
        { status, context }
      );
    }

    // Client errors (4xx) - not retryable
    return new MCPError(
      ErrorCodes.API_ERROR,
      `API request failed: ${error.response.statusText}`,
      { status, context, response: error.response.data }
    );
  }

  // Handle timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    const err = new MCPError(
      ErrorCodes.TIMEOUT,
      'Request timeout - NIH API did not respond in time',
      { context, timeout: error.config?.timeout }
    );
    err.isRetryable = true;
    return err;
  }

  // Handle network errors
  if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    const err = new MCPError(
      ErrorCodes.NETWORK_ERROR,
      `Network error: ${error.message}`,
      { context, code: error.code }
    );
    err.isRetryable = true;
    return err;
  }

  // Handle already-processed MCPError
  if (error instanceof MCPError) {
    return error;
  }

  // Generic error - not retryable by default
  return new MCPError(
    ErrorCodes.API_ERROR,
    error.message || 'Unknown error occurred',
    { originalError: error, context }
  );
}

/**
 * Format error for MCP response
 *
 * @param {MCPError|Error} error - Error to format
 * @returns {Object} MCP-formatted error response
 */
export function formatErrorResponse(error) {
  if (error instanceof MCPError) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              error: {
                code: error.code,
                message: error.message,
                details: error.details,
                isRetryable: error.isRetryable,
              },
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }

  // Fallback for unexpected errors
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            error: {
              code: 'UNKNOWN_ERROR',
              message: error.message || 'An unexpected error occurred',
            },
          },
          null,
          2
        ),
      },
    ],
    isError: true,
  };
}
