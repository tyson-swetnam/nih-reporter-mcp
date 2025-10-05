# NIH Reporter MCP Server - API Reference

## Table of Contents

- [Overview](#overview)
- [Tool Schemas](#tool-schemas)
  - [search_awards](#search_awards)
  - [get_project](#get_project)
  - [search_pis](#search_pis)
  - [get_publications](#get_publications)
- [NIH API Field Mappings](#nih-api-field-mappings)
- [Response Formats](#response-formats)
- [Error Codes](#error-codes)
- [Data Types](#data-types)
- [Pagination](#pagination)
- [Rate Limiting](#rate-limiting)

---

## Overview

The NIH Reporter MCP Server exposes four tools that interface with the NIH RePORTER API v2 (https://api.reporter.nih.gov). This reference documents the complete API contract for each tool.

### Protocol

All tools follow the Model Context Protocol (MCP) specification:
- Transport: stdio
- Message format: JSON-RPC 2.0
- Content type: `application/json`

### API Version

- **NIH RePORTER API**: v2
- **MCP Protocol**: 1.0
- **Server Version**: 1.0.0

---

## Tool Schemas

### search_awards

Search NIH research awards and grants by various criteria.

#### Tool Definition

```json
{
  "name": "search_awards",
  "description": "Search NIH research awards and grants by various criteria including PI names, organizations, fiscal years, and text search in titles/abstracts. Returns up to 500 results per request with pagination support."
}
```

#### Input Schema

```typescript
{
  criteria?: {
    // Basic Search
    pi_names?: string[];              // ["Smith, John"] or ["Smith"]
    org_names?: string[];             // ["Harvard University"]
    fiscal_years?: number[];          // [2023, 2024]
    project_nums?: string[];          // ["5R01AI123456-03"]
    award_types?: string[];           // ["R01", "R21", "P01"]
    agencies?: string[];              // ["NIH", "CDC", "NIAID"]

    // Text Search
    advanced_text_search?: {
      operator: "and" | "or" | "advanced";
      search_field: "projecttitle" | "abstracttext" | "terms" | "phrtext" | "all";
      search_text: string;            // Supports wildcards (*)
    };

    // Amount Filters
    min_award_amount?: number;        // Minimum award in dollars
    max_award_amount?: number;        // Maximum award in dollars

    // Date Filters
    project_start_date?: {
      from_date: string;              // YYYY-MM-DD
      to_date: string;                // YYYY-MM-DD
    };
    project_end_date?: {
      from_date: string;
      to_date: string;
    };
    award_notice_date?: {
      from_date: string;
      to_date: string;
    };
    date_added?: {
      from_date: string;
      to_date: string;
    };

    // Geographic Filters
    org_states?: string[];            // ["CA", "NY", "MA"]
    org_cities?: string[];            // ["Boston", "New York"]
    org_countries?: string[];         // ["United States"]
    cong_dists?: string[];            // ["CA-12", "NY-14"]

    // Organization Filters
    org_names_exact_match?: string[]; // Exact name matching
    organization_type?: string[];     // ["HIGHER EDUCATION", "HOSPITALS"]
    dept_types?: string[];            // ["SCHOOLS OF MEDICINE"]

    // Advanced Filters
    appl_ids?: number[];              // Application IDs
    include_active_projects?: boolean;// Default: false
    exclude_subprojects?: boolean;    // Default: false
    multi_pi_only?: boolean;          // Default: false
    newly_added_projects_only?: boolean; // Default: false
    covid_response?: string[];        // ["Reg-CV", "C3", "C4", "C5", "C6"]
    funding_mechanism?: string[];     // ["R", "P", "U"]

    // Program Officer
    po_names?: Array<{
      first_name?: string;
      last_name?: string;
      any_name?: string;
    }>;

    // Advanced Parameters
    pi_profile_ids?: number[];        // Direct PI lookup
    spending_categories?: {
      values: number[];               // RCDC category IDs
      match_all?: boolean;            // Default: false
    };
    opportunity_numbers?: string[];   // ["RFA-DA-18-020"]
    is_agency_admin?: boolean;
    is_agency_funding?: boolean;

    // Field Selection
    include_fields?: string[];        // Limit returned fields
    exclude_fields?: string[];        // Exclude specific fields
  };

  pagination?: {
    offset?: number;                  // 0-14999, default: 0
    limit?: number;                   // 1-500, default: 25
  };

  sort_field?: "project_start_date" | "award_amount" | "project_num";
  sort_order?: "asc" | "desc";        // Default: "desc"
}
```

#### Response Schema

```typescript
{
  meta: {
    total: number;                    // Total matching records
    offset: number;                   // Current offset
    limit: number;                    // Requested limit
    has_more: boolean;                // More results available
    returned_count: number;           // Results in this response
  };
  results: Array<{
    project_num: string;              // Full project number
    core_project_num: string;         // Core project number
    project_title: string;
    project_start_date: string;       // YYYY-MM-DD
    project_end_date: string;         // YYYY-MM-DD
    organization: {
      org_name: string;
      org_city: string;
      org_state: string;
      org_country: string;
      org_zipcode?: string;
      org_duns?: string;
      org_uei?: string;
      dept_type?: string;
      org_ipf_code?: string;
    };
    principal_investigators: Array<{
      profile_id: number;
      first_name: string;
      middle_name?: string;
      last_name: string;
      full_name: string;
      title?: string;
      is_contact_pi?: boolean;
    }>;
    program_officers?: Array<{
      first_name: string;
      last_name: string;
      full_name: string;
    }>;
    award_amount: number;             // Current year funding
    award_amount_total?: number;      // Total project funding
    fiscal_year: number;
    agency_ic_admin: string;          // Administering IC
    agency_ic_fundings: string[];     // Funding ICs
    activity_code: string;            // Award type (R01, etc.)
    funding_mechanism: string;        // R, P, U, etc.
    award_type: string;               // Grant, Contract, etc.
    award_notice_date?: string;
    abstract_text?: string;
    phr_text?: string;                // Public health relevance
    terms?: string[];                 // MeSH terms
    spend_cat?: Array<{
      category_id: number;
      category_name: string;
    }>;
    covid_response?: string[];
    is_active: boolean;
    subproject_id?: number;
    congress_dist?: string;
  }>;
}
```

---

### get_project

Retrieve detailed information about a specific NIH research project.

#### Tool Definition

```json
{
  "name": "get_project",
  "description": "Retrieve detailed information about a specific NIH research project by its project number or core project number. Returns comprehensive project details including PIs, organization, funding, abstract, and publications."
}
```

#### Input Schema

```typescript
{
  project_number: string;             // Required: Full or core project number
  include_publications?: boolean;     // Default: false
  include_patents?: boolean;          // Default: false (not yet supported)
  include_clinical_studies?: boolean; // Default: false (not yet supported)
}
```

#### Response Schema

```typescript
{
  // All fields from search_awards result, plus:
  funding_history?: Array<{
    fiscal_year: number;
    award_amount: number;
    award_notice_date: string;
  }>;
  publications?: Array<{
    pmid: string;
    pmc_id?: string;
    title: string;
    authors: string;
    author_list: Array<{
      first_name: string;
      last_name: string;
    }>;
    journal: string;
    pub_year: number;
    pub_date: string;
    volume?: string;
    issue?: string;
    pages?: string;
    doi?: string;
    cited_by_count?: number;
  }>;
  patents?: [];                       // Empty: Not available from API
  patents_note?: string;
  clinical_studies?: [];              // Empty: Not available from API
  clinical_studies_note?: string;
  publications_error?: string;        // If publication fetch failed
}
```

---

### search_pis

Search for principal investigators and their associated projects.

#### Tool Definition

```json
{
  "name": "search_pis",
  "description": "Search for principal investigators and retrieve their associated projects. Useful for finding all research led by specific investigators or exploring researchers in a particular field."
}
```

#### Input Schema

```typescript
{
  pi_name: string;                    // Required: Full or partial name
  organization?: string;              // Filter by institution
  fiscal_years?: number[];            // Limit to specific years
  include_projects?: boolean;         // Default: true
  offset?: number;                    // 0-14999, default: 0
  limit?: number;                     // 1-500, default: 25
}
```

#### Response Schema

```typescript
{
  meta: {
    total: number;                    // Total projects found
    offset: number;
    limit: number;
    has_more: boolean;
    returned_count: number;
    total_pis: number;                // Unique PIs found
    query: {
      pi_name: string;
      organization?: string;
      fiscal_years?: number[];
    };
  };
  principal_investigators: Array<{
    profile_id: number;
    name: string;
    first_name: string;
    last_name: string;
    organization: string;
    project_count: number;
    total_funding: number;
    projects?: Array<{                // If include_projects = true
      project_num: string;
      project_title: string;
      award_amount: number;
      fiscal_year: number;
      project_start_date: string;
      project_end_date: string;
      organization: {...};
      // ... other project fields
    }>;
  }>;
}
```

---

### get_publications

Search for publications linked to NIH-funded research.

#### Tool Definition

```json
{
  "name": "get_publications",
  "description": "Search for publications linked to NIH-funded research. Can search by project number, PMID, or text search in publication titles/abstracts."
}
```

#### Input Schema

```typescript
{
  criteria: {                         // Required: At least one criterion
    project_nums?: string[];          // Core project numbers
    pmids?: string[];                 // PubMed IDs
    text_search?: string;             // Search title/abstract
    pub_years?: number[];             // Publication years
  };
  offset?: number;                    // 0-9999, default: 0
  limit?: number;                     // 1-500, default: 25
}
```

#### Response Schema

```typescript
{
  meta: {
    total: number;
    offset: number;
    limit: number;
    has_more: boolean;
    returned_count: number;
  };
  publications: Array<{
    pmid: string;                     // PubMed ID
    pmc_id?: string;                  // PubMed Central ID
    title: string;
    authors: string;                  // Formatted author string
    author_list: Array<{
      first_name: string;
      last_name: string;
      initials?: string;
    }>;
    journal: string;
    journal_iso?: string;             // ISO abbreviation
    pub_year: number;
    pub_date: string;                 // YYYY-MM-DD
    volume?: string;
    issue?: string;
    pages?: string;
    doi?: string;
    issn?: string;
    abstract?: string;
    project_nums: string[];           // Associated projects
    cited_by_count?: number;
    mesh_terms?: string[];
    keywords?: string[];
  }>;
}
```

---

## NIH API Field Mappings

The MCP server transforms NIH API fields to more user-friendly names.

### Project Fields

| MCP Field | NIH API Field | Type | Description |
|-----------|---------------|------|-------------|
| `project_num` | `project_num` | string | Full project number |
| `core_project_num` | `core_project_num` | string | Core project number |
| `project_title` | `project_title` | string | Project title |
| `project_start_date` | `project_start_date` | string | Start date (YYYY-MM-DD) |
| `project_end_date` | `project_end_date` | string | End date (YYYY-MM-DD) |
| `award_amount` | `award_amount` | number | Award amount |
| `fiscal_year` | `fiscal_year` | number | Fiscal year |
| `abstract_text` | `abstract_text` | string | Scientific abstract |
| `phr_text` | `phr_text` | string | Public health relevance |

### Organization Fields

| MCP Field | NIH API Field | Type | Description |
|-----------|---------------|------|-------------|
| `org_name` | `org_name` | string | Organization name |
| `org_city` | `org_city` | string | City |
| `org_state` | `org_state` | string | State code (e.g., "CA") |
| `org_country` | `org_country` | string | Country |
| `org_zipcode` | `org_zipcode` | string | ZIP code |
| `org_duns` | `org_duns` | string | DUNS number |
| `org_uei` | `org_uei` | string | Unique Entity ID |

### Principal Investigator Fields

| MCP Field | NIH API Field | Type | Description |
|-----------|---------------|------|-------------|
| `profile_id` | `profile_id` | number | PI profile ID |
| `first_name` | `first_name` | string | First name |
| `last_name` | `last_name` | string | Last name |
| `full_name` | Computed | string | Full name |
| `is_contact_pi` | `is_contact_pi` | boolean | Contact PI flag |

### Publication Fields

| MCP Field | NIH API Field | Type | Description |
|-----------|---------------|------|-------------|
| `pmid` | `pmid` | string | PubMed ID |
| `pmc_id` | `pmc_id` | string | PMC ID |
| `title` | `title` | string | Publication title |
| `journal` | `journal` | string | Journal name |
| `pub_year` | `pub_year` | number | Publication year |
| `pub_date` | `pub_date` | string | Publication date |
| `doi` | `doi` | string | DOI |

### Search Field Mappings

**IMPORTANT**: Use these exact values for `advanced_text_search.search_field`:

| MCP Value | NIH API Field | Searches |
|-----------|---------------|----------|
| `projecttitle` | `projecttitle` | Project titles only |
| `abstracttext` | `abstracttext` | Scientific abstracts |
| `terms` | `terms` | MeSH terms and keywords |
| `phrtext` | `phrtext` | Public health relevance |
| `all` | - | All text fields |

**Note**: Previous incorrect values were `abstract` (should be `abstracttext`) and `phr` (should be `phrtext`). These have been corrected in the schema.

---

## Response Formats

### Success Response

All successful tool executions return:

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"meta\": {...}, \"results\": [...]}"
    }
  ],
  "isError": false
}
```

### Error Response

All errors return:

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"error\": {\"code\": \"ERROR_CODE\", \"message\": \"...\", \"details\": {...}}}"
    }
  ],
  "isError": true
}
```

---

## Error Codes

### Standard Error Codes

| Code | Description | Retryable | Solution |
|------|-------------|-----------|----------|
| `INVALID_PARAMS` | Invalid input parameters | No | Fix parameter values |
| `API_ERROR` | NIH API returned error | Sometimes | Check query, retry |
| `RATE_LIMIT` | Rate limit exceeded | Yes | Wait 1 second, retry |
| `TIMEOUT` | Request timed out | Yes | Use more specific filters |
| `NOT_FOUND` | Resource not found | No | Verify ID/number |
| `SEARCH_ERROR` | Search failed | Sometimes | Check search criteria |
| `PI_SEARCH_ERROR` | PI search failed | Sometimes | Verify PI name format |
| `PUBLICATION_ERROR` | Publication search failed | Sometimes | Check publication criteria |
| `PROJECT_ERROR` | Project retrieval failed | Sometimes | Verify project number |
| `PAGINATION_LIMIT` | Exceeded pagination max | No | Use offset within limits |

### Error Details

Errors include additional context in the `details` field:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Project not found: 5R01AI999999-03",
    "details": {
      "project_number": "5R01AI999999-03",
      "search_performed": true,
      "results_count": 0
    }
  }
}
```

---

## Data Types

### Common Types

```typescript
// Date string in ISO format
type DateString = string; // YYYY-MM-DD

// Fiscal year
type FiscalYear = number; // e.g., 2024

// Award amount in dollars
type Amount = number; // e.g., 500000

// Project number (full or core)
type ProjectNumber = string; // e.g., "5R01AI123456-03" or "AI123456"

// Award type (activity code)
type AwardType = string; // e.g., "R01", "R21", "P01"

// State code (2-letter)
type StateCode = string; // e.g., "CA", "NY"

// Congressional district
type CongressionalDistrict = string; // e.g., "CA-12"
```

### Enumerations

#### Award Types (Activity Codes)

Common values:
- `R01` - Research Project Grant
- `R21` - Exploratory/Developmental Grant
- `R03` - Small Grant
- `P01` - Program Project Grant
- `U01` - Research Project Cooperative Agreement
- `K01` - Career Development Award
- `T32` - Training Grant
- `F31` - Predoctoral Fellowship

#### Funding Mechanisms

- `R` - Research Grants
- `P` - Program Grants
- `U` - Cooperative Agreements
- `K` - Career Development
- `T` - Training
- `F` - Fellowships

#### Organization Types

- `HIGHER EDUCATION`
- `HOSPITALS`
- `RESEARCH INSTITUTES`
- `NONPROFIT ORGANIZATIONS`
- `FOR-PROFIT ORGANIZATIONS`
- `GOVERNMENT AGENCIES`

#### Department Types

- `SCHOOLS OF MEDICINE`
- `SCHOOLS OF PUBLIC HEALTH`
- `SCHOOLS OF DENTISTRY`
- `SCHOOLS OF NURSING`
- `SCHOOLS OF PHARMACY`
- `SCHOOLS OF VETERINARY MEDICINE`

#### COVID Response Categories

- `Reg-CV` - Regular COVID-19
- `C3` - CARES Act
- `C4` - PPPHCE Act
- `C5` - CRRSA Act
- `C6` - ARPA Act

---

## Pagination

### Limits

- **search_awards**: Max offset 14,999, max limit 500
- **get_project**: No pagination (single result)
- **search_pis**: Max offset 14,999, max limit 500
- **get_publications**: Max offset 9,999, max limit 500

### Best Practices

1. **Start with reasonable limits**:
   ```json
   {"pagination": {"offset": 0, "limit": 100}}
   ```

2. **Check has_more flag**:
   ```json
   {
     "meta": {
       "has_more": true,
       "total": 5000
     }
   }
   ```

3. **Paginate sequentially**:
   ```json
   // Page 1
   {"pagination": {"offset": 0, "limit": 500}}
   // Page 2
   {"pagination": {"offset": 500, "limit": 500}}
   ```

4. **Use sorting for consistent results**:
   ```json
   {
     "sort_field": "project_num",
     "sort_order": "asc"
   }
   ```

### Pagination Example

```typescript
async function getAllResults(criteria) {
  const allResults = [];
  let offset = 0;
  const limit = 500;
  let hasMore = true;

  while (hasMore) {
    const response = await searchAwards({
      criteria,
      pagination: { offset, limit }
    });

    allResults.push(...response.results);
    hasMore = response.meta.has_more;
    offset += limit;

    if (offset > 14999) break; // Max offset limit
  }

  return allResults;
}
```

---

## Rate Limiting

### NIH API Limits

The NIH RePORTER API has informal rate limits:
- Approximately 1 request per second
- Burst capacity of ~5 requests

### Server Rate Limiting

The MCP server enforces rate limits automatically:

```javascript
// Default configuration
{
  RATE_LIMIT_ENABLED: true,
  RATE_LIMIT_REQUESTS_PER_SECOND: 1
}
```

### Handling Rate Limits

Requests are automatically queued when limits are exceeded:

1. Request received
2. Check rate limit
3. If within limit: Execute immediately
4. If over limit: Queue request
5. Execute when rate allows
6. Return result

### Rate Limit Errors

If the queue fills up, you may receive:

```json
{
  "error": {
    "code": "RATE_LIMIT",
    "message": "Rate limit exceeded. Please retry after 1 second.",
    "details": {
      "retryAfter": 1,
      "requestsInQueue": 10
    }
  }
}
```

### Best Practices

1. **Space out requests**: Wait 1 second between calls
2. **Use caching**: Results are cached for 1 hour
3. **Batch queries**: Use broader filters instead of many specific queries
4. **Monitor responses**: Check for rate limit errors

---

## Caching

### Cache Configuration

```javascript
{
  CACHE_ENABLED: true,
  CACHE_TTL: 3600000,        // 1 hour in milliseconds
  CACHE_MAX_SIZE: 1000       // Max cached items
}
```

### Cache Keys

Generated from query parameters:
- `search_awards:${JSON.stringify(params)}`
- `get_project:${project_number}`
- `search_pis:${JSON.stringify(params)}`
- `get_publications:${JSON.stringify(params)}`

### Cache Behavior

1. **Cache Hit**: Returns cached result immediately
2. **Cache Miss**: Fetches from API, caches result, returns
3. **Cache Expiry**: After TTL, result is removed and refetched

### Disabling Cache

For testing or real-time data:

```javascript
{
  CACHE_ENABLED: false
}
```

---

## API Versioning

### Current Version

- **API Version**: 1.0.0
- **NIH RePORTER API**: v2
- **MCP Protocol**: 1.0

### Compatibility

The server maintains backward compatibility within major versions. Breaking changes will increment the major version.

### Checking Version

```json
{
  "tool": "search_awards",
  "parameters": {
    "criteria": {"fiscal_years": [2024]},
    "pagination": {"limit": 1}
  }
}
```

Response includes server metadata in development mode.

---

## Additional Resources

- **NIH RePORTER API Documentation**: https://api.reporter.nih.gov/
- **MCP Specification**: https://modelcontextprotocol.io/
- **Usage Guide**: `docs/USAGE.md`
- **Examples**: `docs/EXAMPLES.md`
- **Installation Guide**: `docs/INSTALLATION.md`
