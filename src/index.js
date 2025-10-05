#!/usr/bin/env node

/**
 * NIH RePORTER MCP Server Entry Point
 *
 * Initializes and starts the MCP server with all tools
 */
import 'dotenv/config';
import { NIHReporterServer } from './server.js';
import { CacheManager } from './utils/cache.js';
import { SearchAwardsTool } from './tools/search-awards.js';
import { GetProjectTool } from './tools/get-project.js';
import { SearchPIsTool } from './tools/search-pis.js';
import { GetPublicationsTool } from './tools/get-publications.js';

async function main() {
  try {
    // Create cache manager
    const cache = new CacheManager({
      maxSize: process.env.CACHE_MAX_SIZE ? parseInt(process.env.CACHE_MAX_SIZE, 10) : undefined,
      ttl: process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL, 10) : undefined,
      enabled: process.env.CACHE_ENABLED ? process.env.CACHE_ENABLED !== 'false' : undefined,
    });

    // Create server instance
    const server = new NIHReporterServer({
      name: process.env.MCP_SERVER_NAME,
      version: process.env.MCP_SERVER_VERSION,
      api: {
        baseURL: process.env.NIH_API_BASE_URL,
        timeout: process.env.NIH_API_TIMEOUT ? parseInt(process.env.NIH_API_TIMEOUT, 10) : undefined,
        requestsPerSecond: process.env.RATE_LIMIT_REQUESTS_PER_SECOND ? parseFloat(process.env.RATE_LIMIT_REQUESTS_PER_SECOND) : undefined,
        burstCapacity: process.env.RATE_LIMIT_BURST_CAPACITY ? parseInt(process.env.RATE_LIMIT_BURST_CAPACITY, 10) : undefined,
      },
    });

    // Register all tools
    server.registerTool('search_awards', new SearchAwardsTool(server.apiClient, cache));
    server.registerTool('get_project', new GetProjectTool(server.apiClient, cache));
    server.registerTool('search_pis', new SearchPIsTool(server.apiClient, cache));
    server.registerTool('get_publications', new GetPublicationsTool(server.apiClient, cache));

    // Start the server
    await server.start();
  } catch (error) {
    console.error('Fatal error starting NIH RePORTER MCP Server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.error('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

main();
