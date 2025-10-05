# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) server implementation for accessing NIH RePORTER APIs. The server enables AI assistants to search and analyze federal research grant data from NIH and other agencies through https://api.reporter.nih.gov/.

## Critical: Git Commit Policy

**IMPORTANT**: After completing ANY task that modifies files, you MUST create a git commit with a comprehensive message. This ensures we maintain a robust git history for reverting breaking changes.

### Commit Requirements

1. **Always commit after successful task completion** - Every prompt that results in file changes must end with a git commit
2. **Stage all relevant changes** - Use `git add` for all modified files
3. **Write verbose commit messages** that include:
   - Summary line (50 chars or less)
   - Blank line
   - Detailed description of ALL changes
   - List of files modified
   - Rationale for changes
   - Any potential impacts or dependencies

### Commit Message Template

```bash
git add .
git commit -m "$(cat <<'EOF'
<action>: <brief summary>

Detailed changes:
- <specific change 1>
- <specific change 2>
- <specific change 3>

Files modified:
- path/to/file1.js: <what changed>
- path/to/file2.js: <what changed>

Rationale:
<why these changes were made>

Impact:
<any breaking changes or new dependencies>

Request context:
<brief summary of user request>

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### Example Workflow

```bash
# After implementing a new MCP tool
git add src/tools/search-awards.js src/schemas/tool-schemas.js
git commit -m "$(cat <<'EOF'
feat: Implement search-awards MCP tool for NIH project queries

Detailed changes:
- Created search-awards.js with full parameter validation
- Added JSON schema for award search parameters
- Implemented NIH API query builder with pagination
- Added response transformation for MCP format
- Included error handling for API failures

Files modified:
- src/tools/search-awards.js: New tool implementation
- src/schemas/tool-schemas.js: Added search-awards schema

Rationale:
User requested implementation of core MCP tool for searching NIH awards.
This is the primary tool users will interact with for grant discovery.

Impact:
No breaking changes. This is a new feature addition.
Requires npm install for new dependencies (axios, joi).

Request context:
User asked to implement the search-awards tool as part of initial MCP server setup.

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

## Development Commands

### Initial Setup
```bash
# Install dependencies (not yet implemented - will need package.json)
npm install

# Set up environment variables
cp .env.example .env
# Configure NIH_API_BASE_URL, MCP_PORT, etc.
```

### Running the Server
```bash
# Start the MCP server (once implemented)
npm start

# Development mode with auto-reload
npm run dev

# Run in production
NODE_ENV=production npm start
```

### Testing
```bash
# Run all tests (once test suite is implemented)
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage

# Run a specific test file
npm test -- src/tools/__tests__/search-awards.test.js
```

## Architecture Overview

### MCP Server Structure

The server follows the Model Context Protocol specification with these key architectural decisions:

1. **Tool-Based Architecture**: Each NIH API capability is exposed as a discrete MCP tool (search-awards, get-project, search-pis, get-publications)

2. **API Client Layer**: Centralized HTTP client (`src/api/client.js`) manages:
   - Rate limiting (default: 100 requests/minute for NIH API)
   - Retry logic with exponential backoff
   - Request/response transformation
   - Error standardization

3. **Data Transformation Pipeline**:
   ```
   NIH API Response → transformers.js → MCP Tool Response
   ```
   - Flattens nested NIH data structures
   - Normalizes date formats
   - Converts funding amounts to consistent format
   - Maps NIH field names to user-friendly names

4. **Caching Strategy**:
   - In-memory cache with TTL (default: 1 hour)
   - Cache keys based on query parameters
   - Separate caches for different tool types

### NIH RePORTER API Integration

Key endpoints and their MCP tool mappings:

- `/v2/projects/search` → `search-awards` tool
- `/v2/projects/{id}` → `get-project` tool
- `/v2/publications/search` → `get-publications` tool
- `/v2/organizations` → Used internally for validation

### Request Flow

1. MCP client sends tool request
2. Server validates parameters against JSON schema
3. Tool handler constructs NIH API query
4. API client checks cache, then makes HTTP request if needed
5. Response transformer normalizes data
6. MCP-formatted response sent back to client

## Key Implementation Considerations

### NIH API Specifics

- **Authentication**: NIH RePORTER API is public, no auth required
- **Rate Limits**: Unofficial limit ~100 req/min, implement client-side limiting
- **Pagination**: Use `offset` and `limit` parameters (max 500 per request)
- **Date Formats**: NIH uses YYYY-MM-DD, fiscal years as integers
- **Award IDs**: Can be full (5R01AI123456-03) or core (AI123456)

### MCP Tool Design Patterns

Each tool should follow this structure:
```javascript
{
  name: "tool_name",
  description: "Clear, user-friendly description",
  inputSchema: {
    // JSON Schema validation
  },
  handler: async (params) => {
    // Validate, transform, call API, return
  }
}
```

### Error Handling

Standard error responses:
- `INVALID_PARAMS`: Bad input parameters
- `API_ERROR`: NIH API returned error
- `RATE_LIMIT`: Too many requests
- `TIMEOUT`: Request timed out
- `NOT_FOUND`: Resource not found

## Special Agent: mcp-server-architect

This repository includes a specialized agent (`mcp-server-architect`) that has deep expertise in:
- MCP server architecture and specification
- Node.js/TypeScript implementation patterns
- NIH RePORTER API integration
- Data transformation pipelines

Use `/agents mcp-server-architect` when you need expert guidance on:
- Designing new MCP tools
- Optimizing API integration
- Implementing complex search features
- Troubleshooting server issues

## Project Status Notes

**Current State**: Architecture and design phase. The README contains the planned structure, but implementation has not yet begun.

**Next Steps**:
1. Initialize Node.js project with package.json
2. Implement core MCP server in `src/server.js`
3. Create API client module
4. Implement first tool (search-awards)
5. Add test coverage
6. Create example queries

## NIH Data Model Reference

Common fields in NIH project data:
- `appl_id`: Application ID
- `project_title`: Project title
- `project_num`: Full project number
- `principal_investigators`: Array of PI objects
- `organization`: Institution details
- `award_amount`: Funding for specific year
- `project_start_date`: Initial award date
- `project_end_date`: Expected completion
- `abstract_text`: Scientific abstract
- `phr_text`: Public health relevance statement