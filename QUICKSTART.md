# Quick Start Guide

Get the NIH RePORTER MCP server up and running in 5 minutes.

## Prerequisites

- Node.js >= 18.0.0
- npm or npx

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment (Optional)

```bash
cp .env.example .env
# Edit .env if you want to customize settings
```

Default configuration works out of the box!

### 3. Test the Server

```bash
# Run tests
npm test

# Start the server locally
npm start
```

## Using with Claude Desktop

### macOS/Linux

1. Edit your Claude Desktop config:

```bash
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

2. Add the server:

```json
{
  "mcpServers": {
    "nih-reporter": {
      "command": "node",
      "args": ["/absolute/path/to/nih-reporter-mcp/src/index.js"]
    }
  }
}
```

3. Restart Claude Desktop

4. Test with this prompt:

```
Search for NIH grants about COVID-19 from 2023
```

### Windows

1. Edit: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add:

```json
{
  "mcpServers": {
    "nih-reporter": {
      "command": "node",
      "args": ["C:\\path\\to\\nih-reporter-mcp\\src\\index.js"]
    }
  }
}
```

## Example Queries

Once configured, try these prompts in Claude Desktop:

### Search for Awards

```
Find all R01 grants from Stanford University in 2023
```

```
Search for grants with "machine learning" in the title, funded over $500k
```

### Find Researchers

```
Search for all grants by principal investigator named "Garcia"
```

```
Show me projects from Johns Hopkins University in 2024
```

### Get Project Details

```
Get detailed information about project 5R01AI123456-03
```

### Find Publications

```
Find all publications linked to project number 5R01AI123456-03
```

## Available Tools

The server provides 4 tools:

1. **search_awards** - Search NIH grants by various criteria
2. **get_project** - Get detailed project information
3. **search_pis** - Search for principal investigators
4. **get_publications** - Find publications linked to grants

## Troubleshooting

### Server won't start
```bash
# Check Node version
node --version  # Should be >= 18.0.0

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### No tools showing in Claude
- Restart Claude Desktop
- Check server logs in Claude Desktop's developer tools
- Verify the path in config is absolute (not relative)

### Rate limit errors
- NIH API limits to 1 request/second (automatic)
- Requests are queued when limit reached
- Check `RATE_LIMIT_REQUESTS_PER_SECOND` in .env

## Next Steps

- Read [USAGE.md](docs/USAGE.md) for detailed tool documentation
- See [MCP_CLIENT_CONFIG.md](docs/MCP_CLIENT_CONFIG.md) for other MCP clients
- Check [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for architecture details

## Quick Reference

### NPM Scripts

```bash
npm start              # Start the server
npm test               # Run tests
npm run test:coverage  # Run tests with coverage
npm run lint           # Lint code
npm run format         # Format code
```

### Environment Variables

```bash
NIH_API_BASE_URL=https://api.reporter.nih.gov
RATE_LIMIT_REQUESTS_PER_SECOND=1
CACHE_ENABLED=true
CACHE_TTL=3600000
```

### Useful Commands

```bash
# Check if server works
node src/index.js

# Run a single test
npm test -- tests/unit/cache.test.js

# Check git status
git status

# View recent commits
git log --oneline -5
```

## Support

- 📖 Full documentation: [docs/](docs/)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/nih-reporter-mcp/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/nih-reporter-mcp/discussions)

---

**You're ready to search NIH grants with AI! 🚀**
