/**
 * MCP Tool JSON Schemas
 *
 * Defines the input schemas for all NIH RePORTER MCP tools
 */

export const searchAwardsSchema = {
  name: 'search_awards',
  description:
    'Search NIH research awards and grants by various criteria including PI names, organizations, fiscal years, and text search in titles/abstracts. Returns up to 500 results per request with pagination support.',
  inputSchema: {
    type: 'object',
    properties: {
      criteria: {
        type: 'object',
        description: 'Search criteria for finding awards',
        properties: {
          pi_names: {
            type: 'array',
            items: { type: 'string' },
            description: 'Principal investigator names (e.g., ["Smith, John", "Doe, Jane"])',
          },
          org_names: {
            type: 'array',
            items: { type: 'string' },
            description: 'Organization names (e.g., ["Harvard University", "Stanford University"])',
          },
          fiscal_years: {
            type: 'array',
            items: { type: 'integer' },
            description: 'Fiscal years to search (e.g., [2023, 2024])',
          },
          project_nums: {
            type: 'array',
            items: { type: 'string' },
            description: 'Specific project numbers (e.g., ["5R01AI123456-03"])',
          },
          award_types: {
            type: 'array',
            items: { type: 'string' },
            description: 'Award types/activity codes (e.g., ["R01", "R21", "P01"])',
          },
          agencies: {
            type: 'array',
            items: { type: 'string' },
            description: 'Funding agencies (e.g., ["NIH", "CDC"])',
          },
          include_fields: {
            type: 'array',
            items: { type: 'string' },
            description: 'Specific fields to include in response',
          },
          exclude_fields: {
            type: 'array',
            items: { type: 'string' },
            description: 'Fields to exclude from response',
          },
          advanced_text_search: {
            type: 'object',
            description: 'Advanced text search configuration',
            properties: {
              operator: {
                type: 'string',
                enum: ['and', 'or', 'advanced'],
                description: 'Search operator for combining terms',
              },
              search_field: {
                type: 'string',
                enum: ['projecttitle', 'abstract', 'terms', 'phr'],
                description: 'Field to search in',
              },
              search_text: {
                type: 'string',
                description: 'Text to search for (supports wildcards)',
              },
            },
          },
          min_award_amount: {
            type: 'integer',
            description: 'Minimum award amount in dollars',
          },
          max_award_amount: {
            type: 'integer',
            description: 'Maximum award amount in dollars',
          },
          // Phase 1 HIGH priority parameters
          include_active_projects: {
            type: 'boolean',
            description: 'Filter to only currently active projects (default: false)',
            default: false,
          },
          org_states: {
            type: 'array',
            items: { type: 'string' },
            description: 'Filter by organization US state codes (e.g., ["CA", "NY", "MA"])',
          },
          appl_ids: {
            type: 'array',
            items: { type: 'integer' },
            description: 'NIH application IDs for direct lookup (e.g., [10001234, 10005678])',
          },
          project_start_date: {
            type: 'object',
            description: 'Filter by project start date range',
            properties: {
              from_date: {
                type: 'string',
                pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                description: 'Start date (YYYY-MM-DD format)',
              },
              to_date: {
                type: 'string',
                pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                description: 'End date (YYYY-MM-DD format)',
              },
            },
          },
          project_end_date: {
            type: 'object',
            description: 'Filter by project end date range',
            properties: {
              from_date: {
                type: 'string',
                pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                description: 'Start date (YYYY-MM-DD format)',
              },
              to_date: {
                type: 'string',
                pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                description: 'End date (YYYY-MM-DD format)',
              },
            },
          },
          award_notice_date: {
            type: 'object',
            description: 'Filter by award notice date range',
            properties: {
              from_date: {
                type: 'string',
                pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                description: 'Start date (YYYY-MM-DD format)',
              },
              to_date: {
                type: 'string',
                pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                description: 'End date (YYYY-MM-DD format)',
              },
            },
          },
          exclude_subprojects: {
            type: 'boolean',
            description: 'Exclude subproject awards from results (default: false)',
            default: false,
          },
          covid_response: {
            type: 'array',
            items: { type: 'string' },
            description: 'Filter by COVID-19 response categories (e.g., ["Reg-CV", "C3", "C4", "C5", "C6"])',
          },
          // Phase 2 MEDIUM priority parameters
          po_names: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                first_name: { type: 'string' },
                last_name: { type: 'string' },
                any_name: { type: 'string' },
              },
            },
            description: 'Program Officer names (e.g., [{"last_name": "Smith", "first_name": "John"}] or [{"any_name": "Smith"}])',
          },
          org_names_exact_match: {
            type: 'array',
            items: { type: 'string' },
            description: 'Exact organization name matching (e.g., ["Harvard University"])',
          },
          org_cities: {
            type: 'array',
            items: { type: 'string' },
            description: 'Filter by organization cities (e.g., ["Boston", "New York", "San Francisco"])',
          },
          org_countries: {
            type: 'array',
            items: { type: 'string' },
            description: 'Filter by organization countries (e.g., ["United States", "Canada", "United Kingdom"])',
          },
          funding_mechanism: {
            type: 'array',
            items: { type: 'string' },
            description: 'Funding mechanism codes (e.g., ["R", "P", "U"])',
          },
          dept_types: {
            type: 'array',
            items: { type: 'string' },
            description: 'Department types (e.g., ["SCHOOLS OF MEDICINE", "SCHOOLS OF PUBLIC HEALTH"])',
          },
          cong_dists: {
            type: 'array',
            items: { type: 'string' },
            description: 'Congressional districts (e.g., ["CA-12", "NY-14", "TX-02"])',
          },
          organization_type: {
            type: 'array',
            items: { type: 'string' },
            description: 'Organization types (e.g., ["HIGHER EDUCATION", "HOSPITALS"])',
          },
          multi_pi_only: {
            type: 'boolean',
            description: 'Filter to only multi-PI projects (default: false)',
            default: false,
          },
          newly_added_projects_only: {
            type: 'boolean',
            description: 'Filter to only recently added projects (default: false)',
            default: false,
          },
          date_added: {
            type: 'object',
            description: 'Filter by database addition date range',
            properties: {
              from_date: {
                type: 'string',
                pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                description: 'Start date (YYYY-MM-DD format)',
              },
              to_date: {
                type: 'string',
                pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                description: 'End date (YYYY-MM-DD format)',
              },
            },
          },
        },
      },
      pagination: {
        type: 'object',
        description: 'Pagination parameters',
        properties: {
          offset: {
            type: 'integer',
            minimum: 0,
            maximum: 14999,
            default: 0,
            description: 'Record offset for pagination (max 14,999)',
          },
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 500,
            default: 25,
            description: 'Number of records to return (max 500)',
          },
        },
      },
      sort_field: {
        type: 'string',
        description: 'Field to sort results by',
        enum: ['project_start_date', 'award_amount', 'project_num'],
      },
      sort_order: {
        type: 'string',
        enum: ['asc', 'desc'],
        default: 'desc',
        description: 'Sort order',
      },
    },
  },
};

export const getProjectSchema = {
  name: 'get_project',
  description:
    'Retrieve detailed information about a specific NIH research project by its project number or core project number. Returns comprehensive project details including PIs, organization, funding, abstract, and publications.',
  inputSchema: {
    type: 'object',
    properties: {
      project_number: {
        type: 'string',
        description: 'Full project number (e.g., "5R01AI123456-03") or core project number (e.g., "AI123456")',
      },
      include_publications: {
        type: 'boolean',
        default: false,
        description: 'Include linked publications in response',
      },
      include_patents: {
        type: 'boolean',
        default: false,
        description: 'Include linked patents in response',
      },
      include_clinical_studies: {
        type: 'boolean',
        default: false,
        description: 'Include linked clinical studies in response',
      },
    },
    required: ['project_number'],
  },
};

export const searchPIsSchema = {
  name: 'search_pis',
  description:
    'Search for principal investigators and retrieve their associated projects. Useful for finding all research led by specific investigators or exploring researchers in a particular field.',
  inputSchema: {
    type: 'object',
    properties: {
      pi_name: {
        type: 'string',
        description: 'Principal investigator name (last, first or partial match)',
      },
      organization: {
        type: 'string',
        description: 'Filter by organization affiliation',
      },
      fiscal_years: {
        type: 'array',
        items: { type: 'integer' },
        description: 'Limit to specific fiscal years',
      },
      include_projects: {
        type: 'boolean',
        default: true,
        description: 'Include full project details for each PI',
      },
      offset: {
        type: 'integer',
        minimum: 0,
        maximum: 14999,
        default: 0,
        description: 'Pagination offset',
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 500,
        default: 25,
        description: 'Number of results to return',
      },
    },
    required: ['pi_name'],
  },
};

export const getPublicationsSchema = {
  name: 'get_publications',
  description:
    'Search for publications linked to NIH-funded research. Can search by project number, PMID, or text search in publication titles/abstracts.',
  inputSchema: {
    type: 'object',
    properties: {
      criteria: {
        type: 'object',
        properties: {
          project_nums: {
            type: 'array',
            items: { type: 'string' },
            description: 'Project numbers to find publications for',
          },
          pmids: {
            type: 'array',
            items: { type: 'string' },
            description: 'PubMed IDs',
          },
          text_search: {
            type: 'string',
            description: 'Text search in publication title/abstract',
          },
          pub_years: {
            type: 'array',
            items: { type: 'integer' },
            description: 'Publication years',
          },
        },
      },
      offset: {
        type: 'integer',
        minimum: 0,
        maximum: 9999,
        default: 0,
        description: 'Record offset (max 9,999 for publications)',
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 500,
        default: 25,
        description: 'Number of records to return',
      },
    },
    required: ['criteria'],
  },
};
