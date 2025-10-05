# Contributing to NIH Reporter MCP Server

Thank you for your interest in contributing to the NIH Reporter MCP Server! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Code Style](#code-style)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Adding New Features](#adding-new-features)
- [Documentation](#documentation)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Respect differing viewpoints and experiences
- Show empathy towards other community members

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js** 18.0.0 or higher
- **npm** (comes with Node.js)
- **Git** for version control
- A **GitHub account**
- Familiarity with JavaScript/Node.js
- Understanding of MCP (Model Context Protocol) is helpful but not required

### Finding Ways to Contribute

- **Bug Reports**: Found a bug? Open an issue
- **Feature Requests**: Have an idea? Propose it in an issue
- **Documentation**: Help improve our docs
- **Code**: Fix bugs or implement features
- **Testing**: Add test coverage
- **Examples**: Contribute usage examples

Check the [issue tracker](https://github.com/yourusername/nih-reporter-mcp/issues) for:
- Issues labeled `good first issue` - Great for newcomers
- Issues labeled `help wanted` - Looking for contributors
- Issues labeled `bug` - Known bugs that need fixing

---

## Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/nih-reporter-mcp.git
cd nih-reporter-mcp

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/nih-reporter-mcp.git
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your preferred settings
nano .env
```

Recommended development settings:
```bash
NODE_ENV=development
NIH_API_BASE_URL=https://api.reporter.nih.gov
CACHE_ENABLED=false
DEBUG=true
RATE_LIMIT_ENABLED=false
```

### 4. Verify Setup

```bash
# Run tests to ensure everything works
npm test

# Start the server
npm start
```

---

## Development Workflow

### 1. Create a Branch

Always work in a feature branch:

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a new branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `test/` - Test additions/updates
- `refactor/` - Code refactoring

### 2. Make Changes

- Write clean, maintainable code
- Follow the existing code style
- Add tests for new functionality
- Update documentation as needed
- Keep commits focused and atomic

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/tools/__tests__/search-awards.test.js

# Run with coverage
npm run test:coverage

# Test the server manually
npm start
```

### 4. Commit Your Changes

Follow our commit message conventions (see below):

```bash
git add .
git commit -m "$(cat <<'EOF'
feat: Add support for new NIH API parameter

Detailed changes:
- Added funding_mechanism parameter to search_awards tool
- Updated schema validation
- Added tests for new parameter
- Updated documentation

Files modified:
- src/tools/search-awards.js: Added parameter support
- src/schemas/tool-schemas.js: Updated schema
- tests/unit/search-awards.test.js: Added tests
- docs/USAGE.md: Documented new parameter

Rationale:
Users requested ability to filter by funding mechanism type.

Impact:
No breaking changes. Backward compatible addition.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### 5. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create pull request on GitHub
```

---

## Testing

### Test Structure

```
tests/
├── unit/                   # Unit tests for individual modules
│   ├── tools/             # Tool tests
│   ├── api/               # API client tests
│   └── utils/             # Utility tests
└── integration/           # Integration tests
    └── e2e.test.js        # End-to-end tests
```

### Writing Tests

Use Jest for testing:

```javascript
// Example: src/tools/__tests__/search-awards.test.js
import { describe, expect, test, beforeEach } from '@jest/globals';
import { SearchAwardsTool } from '../search-awards.js';

describe('SearchAwardsTool', () => {
  let tool;

  beforeEach(() => {
    tool = new SearchAwardsTool(mockApiClient, mockCache);
  });

  test('should return schema', () => {
    const schema = tool.getSchema();
    expect(schema.name).toBe('search_awards');
    expect(schema.inputSchema).toBeDefined();
  });

  test('should search with basic criteria', async () => {
    const params = {
      criteria: {
        fiscal_years: [2024]
      }
    };

    const result = await tool.execute(params);
    expect(result.isError).toBe(false);
    expect(result.content[0].type).toBe('text');
  });

  test('should handle API errors gracefully', async () => {
    mockApiClient.searchProjects.mockRejectedValue(
      new Error('API Error')
    );

    const result = await tool.execute({});
    expect(result.isError).toBe(true);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode (auto-rerun on changes)
npm run test:watch

# Coverage report
npm run test:coverage

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration
```

### Test Coverage Requirements

- New features must include tests
- Aim for 80%+ code coverage
- Critical paths must have 100% coverage
- Edge cases should be tested

---

## Code Style

### JavaScript Style Guide

We follow Airbnb JavaScript Style Guide with some modifications:

```javascript
// Use ES6+ features
import { something } from './module.js';

// Use const/let, not var
const immutableValue = 42;
let mutableValue = 'hello';

// Use async/await over promises
async function fetchData() {
  try {
    const result = await apiClient.get('/endpoint');
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Use descriptive variable names
const searchAwardsResult = await tool.execute(params);
// Not: const r = await tool.execute(params);

// Use JSDoc comments for functions
/**
 * Search for NIH awards using specified criteria
 * @param {Object} params - Search parameters
 * @param {Object} params.criteria - Search criteria
 * @param {number[]} params.criteria.fiscal_years - Fiscal years to search
 * @returns {Promise<Object>} Search results with metadata
 */
async function searchAwards(params) {
  // implementation
}
```

### File Organization

```javascript
// 1. Imports
import { something } from 'external-package';
import { localModule } from './local-module.js';

// 2. Constants
const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 500;

// 3. Class or function definitions
export class SearchAwardsTool {
  // Class implementation
}

// 4. Helper functions (if any)
function helperFunction() {
  // implementation
}
```

### Linting

```bash
# Check code style
npm run lint

# Auto-fix issues
npm run lint -- --fix

# Format code
npm run format
```

---

## Commit Conventions

### Commit Message Format

We use a structured commit message format for better git history and automated changelog generation.

```
<type>: <brief summary>

Detailed changes:
- <specific change 1>
- <specific change 2>

Files modified:
- path/to/file1: <what changed>
- path/to/file2: <what changed>

Rationale:
<why these changes were made>

Impact:
<any breaking changes or new dependencies>

Request context:
<optional: summary of user request or issue number>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>
```

### Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `refactor`: Code refactoring (no functional changes)
- `perf`: Performance improvements
- `chore`: Maintenance tasks (dependencies, build, etc.)
- `style`: Code style changes (formatting, etc.)
- `ci`: CI/CD changes

### Examples

**Feature Addition**:
```
feat: Add support for publication year filtering

Detailed changes:
- Added pub_years parameter to get_publications tool
- Updated schema validation
- Added tests for year filtering

Files modified:
- src/tools/get-publications.js: Added year filter logic
- src/schemas/tool-schemas.js: Updated schema

Rationale:
Users need to filter publications by specific years for analysis.

Impact:
No breaking changes. Backward compatible.
```

**Bug Fix**:
```
fix: Correct search_field values for text search

Detailed changes:
- Changed 'abstract' to 'abstracttext'
- Changed 'phr' to 'phrtext'
- Updated documentation

Files modified:
- src/schemas/tool-schemas.js: Fixed enum values
- docs/USAGE.md: Updated examples
- docs/API_REFERENCE.md: Corrected field names

Rationale:
Previous values didn't match NIH API specification, causing search failures.

Impact:
Breaking change for users using incorrect field values.
```

**Documentation**:
```
docs: Add comprehensive installation guide

Detailed changes:
- Created INSTALLATION.md with platform-specific instructions
- Added troubleshooting section
- Included MCP client configuration examples

Files modified:
- docs/INSTALLATION.md: New file
- README.md: Added link to installation guide

Rationale:
Users needed clearer installation instructions for different platforms.

Impact:
Improves user onboarding experience.
```

---

## Pull Request Process

### Before Submitting

1. **Ensure all tests pass**: `npm test`
2. **Update documentation**: If you changed functionality
3. **Add examples**: If you added features
4. **Check code style**: `npm run lint`
5. **Rebase on latest main**: `git rebase upstream/main`

### Pull Request Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Testing
- [ ] All existing tests pass
- [ ] Added new tests
- [ ] Manually tested

## Checklist
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
- [ ] Commit messages follow conventions

## Related Issues
Fixes #123
Relates to #456
```

### Review Process

1. **Automated checks**: CI/CD runs tests and linting
2. **Code review**: Maintainer reviews code
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, PR can be merged
5. **Merge**: Maintainer merges PR

### After Merge

- Delete your feature branch
- Update your local main branch
- Close any related issues

---

## Adding New Features

### Adding a New NIH API Endpoint

If the NIH API adds new endpoints, follow these steps:

#### 1. Update API Client

```javascript
// src/api/client.js
async searchNewEndpoint(params) {
  const response = await this.post('/v2/new-endpoint/search', params);
  return response.data;
}
```

#### 2. Create Transformer

```javascript
// src/api/transformers.js
export class NewEndpointTransformer {
  static transform(data) {
    return {
      // Transform fields
    };
  }

  static transformList(dataArray) {
    return dataArray.map(item => this.transform(item));
  }
}
```

#### 3. Create Tool Schema

```javascript
// src/schemas/tool-schemas.js
export const newToolSchema = {
  name: 'new_tool',
  description: 'Description of what this tool does',
  inputSchema: {
    type: 'object',
    properties: {
      // Define parameters
    },
    required: ['required_param']
  }
};
```

#### 4. Implement Tool

```javascript
// src/tools/new-tool.js
import { newToolSchema } from '../schemas/tool-schemas.js';

export class NewTool {
  constructor(apiClient, cache = null) {
    this.apiClient = apiClient;
    this.cache = cache;
  }

  getSchema() {
    return newToolSchema;
  }

  async execute(params) {
    // Implementation
  }
}
```

#### 5. Register Tool

```javascript
// src/server.js
import { NewTool } from './tools/new-tool.js';

const newTool = new NewTool(apiClient, cache);
server.addTool(newTool);
```

#### 6. Add Tests

```javascript
// tests/unit/tools/new-tool.test.js
describe('NewTool', () => {
  test('should execute successfully', async () => {
    // Test implementation
  });
});
```

#### 7. Update Documentation

- Add to `docs/USAGE.md`
- Add to `docs/API_REFERENCE.md`
- Add examples to `docs/EXAMPLES.md`

---

## Documentation

### Documentation Standards

- **Clear and concise**: Write for users at different skill levels
- **Code examples**: Include working examples
- **Up to date**: Keep docs in sync with code
- **Complete**: Cover all features and parameters
- **Well-organized**: Use clear headings and structure

### Documentation Files

- `README.md` - Project overview and quick start
- `docs/INSTALLATION.md` - Installation instructions
- `docs/USAGE.md` - Usage guide and tool documentation
- `docs/API_REFERENCE.md` - Complete API reference
- `docs/EXAMPLES.md` - Practical examples
- `CONTRIBUTING.md` - This file
- `CHANGELOG.md` - Version history (auto-generated)

### Updating Documentation

When you change functionality:

1. Update relevant doc files
2. Add examples if applicable
3. Update API reference if schemas changed
4. Include in commit message

### Writing Examples

Good examples should:
- Be realistic and practical
- Include expected output
- Explain the use case
- Be testable

---

## Reporting Issues

### Bug Reports

Include:
- **Description**: Clear description of the bug
- **Steps to reproduce**: Detailed steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**:
  - OS and version
  - Node.js version
  - MCP client and version
- **Error messages**: Full error output
- **Screenshots**: If applicable

### Feature Requests

Include:
- **Use case**: Why is this needed?
- **Proposed solution**: How should it work?
- **Alternatives**: Other approaches considered
- **Examples**: How would it be used?

### Security Issues

**DO NOT** open public issues for security vulnerabilities.

Instead:
- Email security@yourproject.com
- Include detailed description
- Allow time for fix before disclosure

---

## Development Resources

### Helpful Links

- **NIH RePORTER API Docs**: https://api.reporter.nih.gov/
- **MCP Specification**: https://modelcontextprotocol.io/
- **Node.js Docs**: https://nodejs.org/docs/
- **Jest Testing**: https://jestjs.io/
- **Airbnb Style Guide**: https://github.com/airbnb/javascript

### Project Structure Reference

```
nih-reporter-mcp/
├── src/
│   ├── index.js              # Entry point
│   ├── server.js             # MCP server
│   ├── api/
│   │   ├── client.js         # NIH API client
│   │   ├── endpoints.js      # API endpoints
│   │   └── transformers.js   # Data transformers
│   ├── tools/
│   │   ├── search-awards.js
│   │   ├── get-project.js
│   │   ├── search-pis.js
│   │   └── get-publications.js
│   ├── schemas/
│   │   └── tool-schemas.js
│   └── utils/
│       ├── cache.js
│       ├── rate-limiter.js
│       └── error-handler.js
├── tests/
│   ├── unit/
│   └── integration/
├── docs/
└── examples/
```

---

## Questions?

- **General questions**: Open a discussion on GitHub
- **Feature proposals**: Open an issue
- **Bug reports**: Open an issue
- **Security concerns**: Email security@yourproject.com
- **Documentation issues**: Open a PR with fixes

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to the NIH Reporter MCP Server! Your efforts help make research data more accessible to everyone.
