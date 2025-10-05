# MCP Client Configuration Guide

This guide explains how to configure various MCP clients to use the NIH RePORTER MCP server.

## Claude Desktop

### macOS/Linux

Add the following to your Claude Desktop configuration file:

**Location:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "nih-reporter": {
      "command": "npx",
      "args": ["-y", "nih-reporter-mcp"],
      "env": {
        "RATE_LIMIT_REQUESTS_PER_SECOND": "1",
        "CACHE_ENABLED": "true"
      }
    }
  }
}
```

### Windows

**Location:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "nih-reporter": {
      "command": "npx.cmd",
      "args": ["-y", "nih-reporter-mcp"],
      "env": {
        "RATE_LIMIT_REQUESTS_PER_SECOND": "1",
        "CACHE_ENABLED": "true"
      }
    }
  }
}
```

### Using Local Development Version

If you're developing locally and want to use your local version:

```json
{
  "mcpServers": {
    "nih-reporter": {
      "command": "node",
      "args": ["/absolute/path/to/nih-reporter-mcp/src/index.js"],
      "env": {
        "NODE_ENV": "development",
        "RATE_LIMIT_REQUESTS_PER_SECOND": "2"
      }
    }
  }
}
```

## VS Code with Cline Extension

Add to your Cline MCP settings:

**Location:** VS Code Settings → Cline → MCP Servers

```json
{
  "mcpServers": {
    "nih-reporter": {
      "command": "npx",
      "args": ["-y", "nih-reporter-mcp"]
    }
  }
}
```

Or for local development:

```json
{
  "mcpServers": {
    "nih-reporter": {
      "command": "node",
      "args": ["<workspace_root>/nih-reporter-mcp/src/index.js"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

## Zed Editor

Add to your Zed configuration:

**Location:** `~/.config/zed/settings.json`

```json
{
  "context_servers": {
    "nih-reporter": {
      "command": {
        "path": "npx",
        "args": ["-y", "nih-reporter-mcp"]
      }
    }
  }
}
```

## Continue.dev

Add to Continue configuration:

**Location:** `~/.continue/config.json`

```json
{
  "mcpServers": [
    {
      "name": "nih-reporter",
      "command": "npx",
      "args": ["-y", "nih-reporter-mcp"]
    }
  ]
}
```

## Custom MCP Client

If you're building your own MCP client:

```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

// Spawn the server process
const serverProcess = spawn('npx', ['-y', 'nih-reporter-mcp'], {
  env: {
    ...process.env,
    RATE_LIMIT_REQUESTS_PER_SECOND: '1',
    CACHE_ENABLED: 'true',
  },
});

// Create transport
const transport = new StdioClientTransport({
  stdin: serverProcess.stdin,
  stdout: serverProcess.stdout,
});

// Create client
const client = new Client(
  {
    name: 'my-mcp-client',
    version: '1.0.0',
  },
  {
    capabilities: {},
  }
);

// Connect
await client.connect(transport);

// List available tools
const tools = await client.listTools();
console.log('Available tools:', tools);

// Call a tool
const result = await client.callTool({
  name: 'search_awards',
  arguments: {
    criteria: {
      pi_names: ['Fauci, Anthony'],
      fiscal_years: [2023],
    },
    pagination: {
      limit: 10,
    },
  },
});

console.log('Results:', result);
```

## Environment Variables

All MCP clients support passing environment variables to configure the server:

| Variable | Default | Description |
|----------|---------|-------------|
| `NIH_API_BASE_URL` | `https://api.reporter.nih.gov` | NIH API base URL |
| `NIH_API_TIMEOUT` | `30000` | Request timeout (ms) |
| `RATE_LIMIT_REQUESTS_PER_SECOND` | `1` | Max requests per second |
| `RATE_LIMIT_BURST_CAPACITY` | `5` | Burst capacity |
| `CACHE_ENABLED` | `true` | Enable/disable caching |
| `CACHE_TTL` | `3600000` | Cache TTL (ms) |
| `CACHE_MAX_SIZE` | `1000` | Max cache entries |
| `LOG_LEVEL` | `info` | Logging level |

### Example with Custom Environment

```json
{
  "mcpServers": {
    "nih-reporter": {
      "command": "npx",
      "args": ["-y", "nih-reporter-mcp"],
      "env": {
        "RATE_LIMIT_REQUESTS_PER_SECOND": "0.5",
        "CACHE_TTL": "7200000",
        "CACHE_MAX_SIZE": "2000",
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```

## Verifying Installation

After configuring your MCP client, verify the server is working:

1. **Check server starts**: Look for "NIH RePORTER MCP Server started" in logs
2. **List tools**: The client should show 4 tools:
   - `search_awards`
   - `get_project`
   - `search_pis`
   - `get_publications`
3. **Test a simple query**: Try searching for a well-known PI

### Example Verification Query

```json
{
  "name": "search_awards",
  "arguments": {
    "criteria": {
      "fiscal_years": [2023]
    },
    "pagination": {
      "limit": 1
    }
  }
}
```

Should return 1 award from fiscal year 2023.

## Troubleshooting

### Server not starting
- Verify Node.js >= 18.0.0: `node --version`
- Check npx is available: `npx --version`
- Try running manually: `npx -y nih-reporter-mcp`

### No tools showing up
- Restart your MCP client
- Check server logs for errors
- Verify JSON configuration syntax

### Permission errors
- Ensure npx has execute permissions
- Check file permissions on local installation
- Try running with sudo (not recommended for production)

### Rate limit issues
- Default is 1 req/sec per NIH guidelines
- Reduce `RATE_LIMIT_REQUESTS_PER_SECOND` if needed
- Check NIH API status: https://api.reporter.nih.gov/

## Advanced Configuration

### Using with PM2 (Production)

```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'nih-reporter-mcp',
    script: 'npx',
    args: '-y nih-reporter-mcp',
    env: {
      NODE_ENV: 'production',
      RATE_LIMIT_REQUESTS_PER_SECOND: '1',
      CACHE_ENABLED: 'true'
    }
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
```

### Using with Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

RUN npm install -g nih-reporter-mcp

ENV RATE_LIMIT_REQUESTS_PER_SECOND=1
ENV CACHE_ENABLED=true

CMD ["nih-reporter-mcp"]
```

Build and run:

```bash
docker build -t nih-reporter-mcp .
docker run -it nih-reporter-mcp
```
