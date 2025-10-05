# NIH Reporter MCP Server - Installation Guide

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation Methods](#installation-methods)
  - [Local Development Setup](#local-development-setup)
  - [Future: npm Installation](#future-npm-installation)
- [MCP Client Configuration](#mcp-client-configuration)
  - [Claude Desktop](#claude-desktop)
  - [Cline (VS Code Extension)](#cline-vs-code-extension)
  - [Cursor](#cursor)
- [Platform-Specific Instructions](#platform-specific-instructions)
  - [macOS](#macos)
  - [Linux](#linux)
  - [Windows](#windows)
- [Environment Configuration](#environment-configuration)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before installing the NIH Reporter MCP Server, ensure you have:

- **Node.js** version 18.0.0 or higher
- **npm** (comes with Node.js)
- **Git** (for source installation)
- An MCP-compatible client (Claude Desktop, Cline, or Cursor)

### Checking Node.js Version

```bash
node --version
# Should output v18.0.0 or higher
```

If you need to install or upgrade Node.js, visit [nodejs.org](https://nodejs.org/)

---

## Installation Methods

### Local Development Setup

The NIH Reporter MCP Server is currently **not published to npm**. Install from source:

#### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/nih-reporter-mcp.git

# Navigate to the project directory
cd nih-reporter-mcp
```

#### Step 2: Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `axios` - HTTP client for NIH API
- `lru-cache` - Response caching
- `dotenv` - Environment variable management

#### Step 3: Verify Installation

```bash
# Test that the server can start
node src/index.js
```

You should see output indicating the server is ready. Press `Ctrl+C` to stop.

#### Step 4: Note the Installation Path

Save the full path to your installation for MCP client configuration:

```bash
pwd
# Example output: /Users/yourname/github/nih-reporter-mcp
```

---

### Future: npm Installation

Once published to npm, installation will be:

```bash
# Global installation (recommended)
npm install -g nih-reporter-mcp

# Local installation
npm install nih-reporter-mcp
```

**Note**: This is not yet available. Use the local development setup above.

---

## MCP Client Configuration

After installing the server, configure your MCP client to connect to it.

### Claude Desktop

Claude Desktop is Anthropic's official desktop application with MCP support.

#### macOS Configuration

1. **Locate the Claude Desktop configuration file**:
   ```bash
   ~/Library/Application Support/Claude/claude_desktop_config.json
   ```

2. **Edit the configuration** (create if it doesn't exist):
   ```bash
   nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

3. **Add the NIH Reporter server**:
   ```json
   {
     "mcpServers": {
       "nih-reporter": {
         "command": "node",
         "args": [
           "/FULL/PATH/TO/nih-reporter-mcp/src/index.js"
         ],
         "env": {
           "NIH_API_BASE_URL": "https://api.reporter.nih.gov",
           "CACHE_ENABLED": "true",
           "CACHE_TTL": "3600000",
           "RATE_LIMIT_ENABLED": "true",
           "RATE_LIMIT_REQUESTS_PER_SECOND": "1"
         }
       }
     }
   }
   ```

   **Important**: Replace `/FULL/PATH/TO/nih-reporter-mcp` with your actual installation path from Step 4 above.

4. **Save and restart Claude Desktop**

#### Windows Configuration

1. **Locate the configuration file**:
   ```
   %APPDATA%\Claude\claude_desktop_config.json
   ```

2. **Edit using Notepad or your preferred editor**:
   ```cmd
   notepad %APPDATA%\Claude\claude_desktop_config.json
   ```

3. **Add the server configuration**:
   ```json
   {
     "mcpServers": {
       "nih-reporter": {
         "command": "node",
         "args": [
           "C:\\Users\\YourName\\github\\nih-reporter-mcp\\src\\index.js"
         ],
         "env": {
           "NIH_API_BASE_URL": "https://api.reporter.nih.gov",
           "CACHE_ENABLED": "true",
           "CACHE_TTL": "3600000",
           "RATE_LIMIT_ENABLED": "true",
           "RATE_LIMIT_REQUESTS_PER_SECOND": "1"
         }
       }
     }
   }
   ```

   **Note**: Use double backslashes (`\\`) in Windows paths or forward slashes (`/`).

4. **Restart Claude Desktop**

#### Linux Configuration

1. **Locate the configuration file**:
   ```bash
   ~/.config/Claude/claude_desktop_config.json
   ```

2. **Edit the configuration**:
   ```bash
   nano ~/.config/Claude/claude_desktop_config.json
   ```

3. **Add the server configuration**:
   ```json
   {
     "mcpServers": {
       "nih-reporter": {
         "command": "node",
         "args": [
           "/home/yourname/github/nih-reporter-mcp/src/index.js"
         ],
         "env": {
           "NIH_API_BASE_URL": "https://api.reporter.nih.gov",
           "CACHE_ENABLED": "true",
           "CACHE_TTL": "3600000",
           "RATE_LIMIT_ENABLED": "true",
           "RATE_LIMIT_REQUESTS_PER_SECOND": "1"
         }
       }
     }
   }
   ```

4. **Restart Claude Desktop**

#### Verifying Claude Desktop Connection

1. Open Claude Desktop
2. Start a new conversation
3. Look for the MCP tools icon or indicator
4. Try using a tool:
   ```
   Use the search_awards tool to find 5 recent NIH grants about cancer research
   ```

---

### Cline (VS Code Extension)

Cline is a VS Code extension that supports MCP servers.

#### Installation

1. **Install Cline from VS Code Marketplace**:
   - Open VS Code
   - Go to Extensions (Cmd+Shift+X on Mac, Ctrl+Shift+X on Windows/Linux)
   - Search for "Cline"
   - Click Install

2. **Configure Cline Settings**:
   - Open VS Code Settings (Cmd+, on Mac, Ctrl+, on Windows/Linux)
   - Search for "Cline MCP"
   - Or edit `settings.json` directly

3. **Add NIH Reporter Server**:

   **Option A: Via Settings UI**
   - Find "Cline: MCP Servers"
   - Click "Edit in settings.json"

   **Option B: Direct settings.json Edit**
   ```json
   {
     "cline.mcpServers": {
       "nih-reporter": {
         "command": "node",
         "args": [
           "/FULL/PATH/TO/nih-reporter-mcp/src/index.js"
         ],
         "env": {
           "NIH_API_BASE_URL": "https://api.reporter.nih.gov",
           "CACHE_ENABLED": "true",
           "CACHE_TTL": "3600000"
         }
       }
     }
   }
   ```

4. **Reload VS Code**:
   - Press Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows/Linux)
   - Type "Reload Window"
   - Press Enter

#### Verifying Cline Connection

1. Open the Cline panel in VS Code
2. Start a new session
3. The NIH Reporter tools should appear in the available tools list
4. Test with a simple query:
   ```
   Search for NIH grants about machine learning in the past year
   ```

---

### Cursor

Cursor is an AI-powered code editor with MCP support.

#### Configuration

1. **Open Cursor Settings**:
   - Go to Settings → Features → MCP Servers
   - Or edit the configuration file directly

2. **Locate Cursor's MCP Configuration**:

   **macOS**:
   ```bash
   ~/Library/Application Support/Cursor/User/mcp_servers.json
   ```

   **Windows**:
   ```
   %APPDATA%\Cursor\User\mcp_servers.json
   ```

   **Linux**:
   ```bash
   ~/.config/Cursor/User/mcp_servers.json
   ```

3. **Add NIH Reporter Configuration**:
   ```json
   {
     "mcpServers": {
       "nih-reporter": {
         "command": "node",
         "args": [
           "/FULL/PATH/TO/nih-reporter-mcp/src/index.js"
         ],
         "env": {
           "NIH_API_BASE_URL": "https://api.reporter.nih.gov",
           "CACHE_ENABLED": "true"
         }
       }
     }
   }
   ```

4. **Restart Cursor**

#### Verifying Cursor Connection

1. Open Cursor
2. Start an AI chat
3. Ask Cursor to use the NIH Reporter tools
4. Try a test query:
   ```
   Find recent NIH grants for Stanford University
   ```

---

## Platform-Specific Instructions

### macOS

#### System Requirements
- macOS 10.15 (Catalina) or later
- Node.js 18+ (install via Homebrew recommended)

#### Installing Node.js via Homebrew

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Verify installation
node --version
npm --version
```

#### Permissions

If you encounter permission errors:

```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

#### Common Issues

**"command not found: node"**
- Add Node.js to your PATH:
  ```bash
  echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc
  source ~/.zshrc
  ```

**Claude Desktop can't find the server**
- Ensure you're using the absolute path in the config
- Check that the path doesn't contain spaces (or properly quote it)
- Verify Node.js is in your PATH: `which node`

---

### Linux

#### System Requirements
- Any modern Linux distribution
- Node.js 18+

#### Installing Node.js

**Ubuntu/Debian**:
```bash
# Using NodeSource repository (recommended)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

**Fedora/RHEL/CentOS**:
```bash
# Using NodeSource repository
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs

# Verify
node --version
npm --version
```

**Arch Linux**:
```bash
sudo pacman -S nodejs npm

# Verify
node --version
npm --version
```

#### Permissions

If npm install fails with permission errors:

```bash
# Create npm global directory
mkdir ~/.npm-global

# Configure npm
npm config set prefix '~/.npm-global'

# Add to PATH
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

#### Common Issues

**"EACCES" permission errors**
- Don't use `sudo` with npm
- Follow the permissions setup above

**MCP client can't connect**
- Check firewall settings
- Verify Node.js is executable: `chmod +x $(which node)`

---

### Windows

#### System Requirements
- Windows 10 or later
- Node.js 18+ (LTS recommended)

#### Installing Node.js

1. **Download Node.js**:
   - Visit [nodejs.org](https://nodejs.org/)
   - Download the LTS (Long Term Support) version
   - Run the installer

2. **Verify Installation**:
   ```cmd
   node --version
   npm --version
   ```

#### Windows Path Considerations

When configuring MCP clients on Windows:

1. **Use forward slashes or double backslashes**:
   - Good: `"C:/Users/Name/github/nih-reporter-mcp/src/index.js"`
   - Good: `"C:\\Users\\Name\\github\\nih-reporter-mcp\\src\\index.js"`
   - Bad: `"C:\Users\Name\github\nih-reporter-mcp\src\index.js"`

2. **Avoid spaces in paths**:
   - Bad: `"C:/Users/John Smith/github/..."`
   - Good: Use the 8.3 name: `"C:/Users/JOHNSMITH/github/..."`
   - Or: Install in a path without spaces

#### Common Issues

**"'node' is not recognized"**
- Node.js not in PATH
- Restart terminal/command prompt after installation
- Manually add to PATH in System Environment Variables

**Git Bash vs Command Prompt**
- Configuration paths may differ between shells
- Use native Windows paths in config files
- Use Unix-style paths in Git Bash

**Permission Errors**
- Run terminal as Administrator if needed
- Check antivirus isn't blocking Node.js

---

## Environment Configuration

### Environment Variables

Create a `.env` file in the project root for custom configuration:

```bash
# NIH API Configuration
NIH_API_BASE_URL=https://api.reporter.nih.gov
NIH_API_TIMEOUT=30000

# Rate Limiting (NIH recommends max 1 request/second)
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS_PER_SECOND=1

# Caching
CACHE_ENABLED=true
CACHE_TTL=3600000
CACHE_MAX_SIZE=1000

# Server Identification
MCP_SERVER_NAME=nih-reporter-mcp
MCP_SERVER_VERSION=1.0.0

# Development/Debug
NODE_ENV=production
DEBUG=false
```

### Configuration Priority

Environment variables are loaded in this order (later overrides earlier):

1. Default values in code
2. `.env` file in project root
3. Environment variables set in MCP client config
4. System environment variables

### Recommended Settings

**For Production Use**:
```bash
NODE_ENV=production
CACHE_ENABLED=true
CACHE_TTL=3600000
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS_PER_SECOND=1
```

**For Development**:
```bash
NODE_ENV=development
CACHE_ENABLED=false
DEBUG=true
RATE_LIMIT_ENABLED=false
```

**For High-Volume Usage**:
```bash
CACHE_ENABLED=true
CACHE_TTL=7200000
CACHE_MAX_SIZE=5000
RATE_LIMIT_REQUESTS_PER_SECOND=1
```

---

## Verification

### Testing the Server Directly

Run the server in stdio mode to test it:

```bash
cd /path/to/nih-reporter-mcp
node src/index.js
```

The server should start and wait for MCP protocol messages on stdin.

### Testing with MCP Client

1. **Check Available Tools**:
   In your MCP client, verify these tools are available:
   - `search_awards`
   - `get_project`
   - `search_pis`
   - `get_publications`

2. **Run a Simple Test**:
   ```
   Use the search_awards tool to find 3 NIH grants about cancer from 2024
   ```

3. **Expected Response**:
   - Should return JSON with 3 grants
   - Each grant should have: project_num, project_title, organization, award_amount, etc.
   - No errors in the response

### Verifying Rate Limiting

Test that rate limiting works:

```
Search for 5 different sets of NIH awards rapidly
```

The server should automatically queue requests to stay under 1 req/second.

### Verifying Caching

Test caching:

```
Search for COVID-19 research twice
```

The second request should return faster (from cache).

---

## Troubleshooting

### Server Won't Start

**Symptom**: `node src/index.js` fails or crashes

**Solutions**:
1. Check Node.js version: `node --version` (must be >= 18)
2. Reinstall dependencies: `npm install`
3. Check for syntax errors: `npm test`
4. Verify all files exist: `ls src/index.js`

### MCP Client Can't Connect

**Symptom**: Tools don't appear in client, or connection errors

**Solutions**:
1. Verify absolute path in config (not relative)
2. Check path uses correct separators for your OS
3. Ensure Node.js is in PATH: `which node` (Mac/Linux) or `where node` (Windows)
4. Restart the MCP client completely
5. Check client logs for error messages

### "Module not found" Errors

**Symptom**: `Error: Cannot find module '@modelcontextprotocol/sdk'`

**Solutions**:
1. Install dependencies: `npm install`
2. Verify `node_modules` exists: `ls node_modules`
3. Check package.json exists: `ls package.json`
4. Try clean install: `rm -rf node_modules && npm install`

### API Errors

**Symptom**: "API_ERROR" responses from tools

**Solutions**:
1. Check internet connection
2. Verify NIH API is accessible: `curl https://api.reporter.nih.gov`
3. Check if API is down: [NIH RePORTER Status](https://api.reporter.nih.gov/)
4. Review query parameters for errors

### Rate Limit Errors

**Symptom**: "RATE_LIMIT" errors

**Solutions**:
1. This is expected with rapid requests
2. The server automatically queues requests
3. Wait a few seconds between requests
4. Check `RATE_LIMIT_REQUESTS_PER_SECOND` in config

### Permission Denied

**macOS/Linux**:
```bash
# Make script executable
chmod +x src/index.js

# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

**Windows**:
- Run terminal as Administrator
- Check antivirus isn't blocking

### Cache Issues

**Symptom**: Stale data or unexpected results

**Solutions**:
1. Disable cache temporarily: Set `CACHE_ENABLED=false` in env
2. Clear cache: Restart the MCP server
3. Reduce TTL: Set `CACHE_TTL=60000` (1 minute)

### Path with Spaces

**Symptom**: Server can't be found, path errors

**Solutions**:
1. Move installation to path without spaces
2. Or use quotes in config:
   ```json
   "args": ["/Users/John Smith/github/nih-reporter-mcp/src/index.js"]
   ```

### Getting Help

If issues persist:

1. **Check logs**: Enable debug logging with `DEBUG=true`
2. **Review GitHub issues**: [github.com/yourrepo/issues](https://github.com)
3. **Create an issue**: Include:
   - Operating system and version
   - Node.js version
   - MCP client and version
   - Full error message
   - Configuration (redact sensitive info)
   - Steps to reproduce

---

## Next Steps

After successful installation:

1. **Read the Usage Guide**: `docs/USAGE.md`
2. **Review Examples**: `docs/EXAMPLES.md`
3. **Explore the API Reference**: `docs/API_REFERENCE.md`
4. **Try sample queries**: Start with simple searches and build complexity

---

## Updating the Server

### Pulling Latest Changes

```bash
cd /path/to/nih-reporter-mcp
git pull origin main
npm install
```

### After Updates

1. Restart your MCP client
2. Test that tools still work
3. Check for new features in CHANGELOG.md

---

## Uninstallation

### Removing from MCP Clients

1. Edit the client's config file
2. Remove the `nih-reporter` entry
3. Restart the client

### Removing the Server

```bash
# Navigate to parent directory
cd /path/to/parent

# Remove the directory
rm -rf nih-reporter-mcp
```

**Note**: This will permanently delete all local files and configuration.
