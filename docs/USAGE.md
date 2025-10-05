# NIH RePORTER MCP Server Usage Guide

## Installation

### From npm (once published)

```bash
npm install -g nih-reporter-mcp
```

### From source

```bash
git clone https://github.com/yourusername/nih-reporter-mcp.git
cd nih-reporter-mcp
npm install
npm link
```

## Configuration

The server can be configured via environment variables or a `.env` file:

```bash
# .env
NIH_API_BASE_URL=https://api.reporter.nih.gov
NIH_API_TIMEOUT=30000

# Rate Limiting (NIH recommends max 1 request/second)
RATE_LIMIT_REQUESTS_PER_SECOND=1
RATE_LIMIT_BURST_CAPACITY=5

# Caching
CACHE_ENABLED=true
CACHE_TTL=3600000
CACHE_MAX_SIZE=1000

# Server
MCP_SERVER_NAME=nih-reporter-mcp
MCP_SERVER_VERSION=1.0.0
```

## Available Tools

### 1. search_awards

Search for NIH research grants and awards using various criteria.

**Parameters:**
- `criteria` (object): Search criteria
  - `pi_names` (array): Principal investigator names
  - `org_names` (array): Organization names
  - `fiscal_years` (array): Fiscal years (integers)
  - `project_nums` (array): Specific project numbers
  - `award_types` (array): Award types (R01, R21, etc.)
  - `agencies` (array): Funding agencies
  - `min_award_amount` (integer): Minimum funding
  - `max_award_amount` (integer): Maximum funding
  - `advanced_text_search` (object): Text search configuration
- `pagination` (object): Pagination settings
  - `offset` (integer, 0-14999): Starting record
  - `limit` (integer, 1-500): Records per page
- `sort_field` (string): Field to sort by
- `sort_order` (string): "asc" or "desc"

**Example:**
```json
{
  "name": "search_awards",
  "arguments": {
    "criteria": {
      "pi_names": ["Fauci, Anthony"],
      "fiscal_years": [2023, 2024],
      "org_names": ["National Institute of Allergy and Infectious Diseases"]
    },
    "pagination": {
      "limit": 10,
      "offset": 0
    },
    "sort_field": "award_amount",
    "sort_order": "desc"
  }
}
```

**Response:**
```json
{
  "meta": {
    "total": 42,
    "offset": 0,
    "limit": 10,
    "has_more": true
  },
  "results": [
    {
      "project_number": "5R01AI123456-03",
      "title": "Novel Approaches to Infectious Disease Treatment",
      "principal_investigators": [...],
      "organization": {...},
      "funding": {...}
    }
  ]
}
```

### 2. get_project

Retrieve detailed information about a specific project.

**Parameters:**
- `project_number` (string, required): Full or core project number
- `include_publications` (boolean): Include linked publications
- `include_patents` (boolean): Include linked patents
- `include_clinical_studies` (boolean): Include clinical studies

**Example:**
```json
{
  "name": "get_project",
  "arguments": {
    "project_number": "5R01AI123456-03",
    "include_publications": true
  }
}
```

### 3. search_pis

Search for principal investigators and their projects.

**Parameters:**
- `pi_name` (string, required): PI name (partial match supported)
- `organization` (string): Filter by organization
- `fiscal_years` (array): Filter by fiscal years
- `include_projects` (boolean): Include full project details
- `offset` (integer): Pagination offset
- `limit` (integer): Results per page

**Example:**
```json
{
  "name": "search_pis",
  "arguments": {
    "pi_name": "Smith",
    "organization": "Harvard University",
    "fiscal_years": [2023, 2024],
    "include_projects": true,
    "limit": 20
  }
}
```

**Response:**
```json
{
  "meta": {
    "total": 156,
    "total_pis": 12,
    "query": {...}
  },
  "principal_investigators": [
    {
      "name": "Smith, John",
      "first_name": "John",
      "last_name": "Smith",
      "email": "jsmith@harvard.edu",
      "projects": [...],
      "total_funding": 5000000,
      "project_count": 8
    }
  ]
}
```

### 4. get_publications

Search for publications linked to NIH-funded research.

**Parameters:**
- `criteria` (object, required): Search criteria
  - `project_nums` (array): Project numbers
  - `pmids` (array): PubMed IDs
  - `text_search` (string): Text search
  - `pub_years` (array): Publication years
- `offset` (integer, 0-9999): Pagination offset
- `limit` (integer, 1-500): Results per page

**Example:**
```json
{
  "name": "get_publications",
  "arguments": {
    "criteria": {
      "project_nums": ["5R01AI123456-03"]
    },
    "limit": 50
  }
}
```

## Common Use Cases

### Finding COVID-19 Research

```json
{
  "name": "search_awards",
  "arguments": {
    "criteria": {
      "advanced_text_search": {
        "operator": "and",
        "search_field": "projecttitle",
        "search_text": "COVID-19"
      },
      "fiscal_years": [2020, 2021, 2022, 2023]
    },
    "pagination": { "limit": 100 }
  }
}
```

### Exploring Institutional Research

```json
{
  "name": "search_awards",
  "arguments": {
    "criteria": {
      "org_names": ["Stanford University"],
      "fiscal_years": [2023],
      "award_types": ["R01"]
    },
    "sort_field": "award_amount",
    "sort_order": "desc"
  }
}
```

### Finding High-Value Grants

```json
{
  "name": "search_awards",
  "arguments": {
    "criteria": {
      "min_award_amount": 1000000,
      "fiscal_years": [2023, 2024]
    },
    "sort_field": "award_amount",
    "sort_order": "desc"
  }
}
```

### Researcher Publication Record

```json
{
  "name": "search_pis",
  "arguments": {
    "pi_name": "Garcia, Maria",
    "include_projects": true
  }
}
```

Then for each project:

```json
{
  "name": "get_publications",
  "arguments": {
    "criteria": {
      "project_nums": ["PROJECT_NUMBER_HERE"]
    }
  }
}
```

## Error Handling

All tools return errors in a standardized format:

```json
{
  "error": {
    "code": "RATE_LIMIT",
    "message": "Rate limit exceeded. Retry after 60 seconds.",
    "details": {
      "retryAfter": 60
    },
    "isRetryable": true
  }
}
```

**Common Error Codes:**
- `INVALID_PARAMS`: Invalid input parameters
- `API_ERROR`: NIH API error
- `RATE_LIMIT`: Rate limit exceeded
- `TIMEOUT`: Request timeout
- `NOT_FOUND`: Resource not found
- `PAGINATION_LIMIT`: Exceeded pagination limits

## Performance Tips

1. **Use Caching**: The server caches responses for 1 hour by default
2. **Pagination**: Use `offset` and `limit` to fetch large result sets incrementally
3. **Field Selection**: Use `include_fields` to limit response size
4. **Rate Limiting**: Stay within 1 request/second to avoid delays

## Troubleshooting

### Server won't start
- Check that all dependencies are installed: `npm install`
- Verify Node.js version >= 18.0.0: `node --version`
- Check environment variables in `.env`

### Rate limit errors
- NIH API limits to ~1 request/second
- Server enforces this automatically
- Requests are queued when limit is reached

### Empty results
- Verify search criteria are correct
- Check fiscal year ranges
- Try broader search terms
