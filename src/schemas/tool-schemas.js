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
