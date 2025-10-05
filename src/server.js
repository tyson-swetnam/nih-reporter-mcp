/**
 * NIH RePORTER MCP Server
 *
 * Main server implementation using Model Context Protocol SDK
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { NIHAPIClient } from './api/client.js';
import { formatErrorResponse } from './utils/error-handler.js';

export class NIHReporterServer {
  constructor(config = {}) {
    // Store server info for logging
    this.serverName = config.name || process.env.MCP_SERVER_NAME || 'nih-reporter-mcp';
    this.serverVersion = config.version || process.env.MCP_SERVER_VERSION || '1.0.0';

    // Initialize MCP server
    this.server = new Server(
      {
        name: this.serverName,
        version: this.serverVersion,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize API client
    this.apiClient = new NIHAPIClient(config.api || {});

    // Initialize tools map (will be populated by tool modules)
    this.tools = new Map();

    // Set up MCP handlers
    this.setupHandlers();
  }

  /**
   * Register a tool with the server
   *
   * @param {string} name - Tool name
   * @param {Object} tool - Tool instance with getSchema() and execute() methods
   */
  registerTool(name, tool) {
    this.tools.set(name, tool);
  }

  /**
   * Set up MCP request handlers
   */
  setupHandlers() {
    // Handle ListTools request - return available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = Array.from(this.tools.values()).map((tool) => tool.getSchema());

      return { tools };
    });

    // Handle CallTool request - execute a tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      const tool = this.tools.get(name);

      if (!tool) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  error: {
                    code: 'UNKNOWN_TOOL',
                    message: `Unknown tool: ${name}`,
                    availableTools: Array.from(this.tools.keys()),
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

      try {
        return await tool.execute(args || {});
      } catch (error) {
        return formatErrorResponse(error);
      }
    });
  }

  /**
   * Start the MCP server
   */
  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    // Log to stderr so it doesn't interfere with MCP protocol on stdout
    console.error('NIH RePORTER MCP Server started');
    console.error(`Server: ${this.serverName} v${this.serverVersion}`);
    console.error(`Tools registered: ${this.tools.size}`);
  }

  /**
   * Get server info for debugging
   */
  getInfo() {
    return {
      name: this.serverName,
      version: this.serverVersion,
      tools: Array.from(this.tools.keys()),
      rateLimiter: this.apiClient.getRateLimiterState(),
    };
  }
}
