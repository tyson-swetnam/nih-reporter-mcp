/**
 * Search Awards Tool
 *
 * MCP tool for searching NIH research awards and grants
 */
import { searchAwardsSchema } from '../schemas/tool-schemas.js';
import { ProjectTransformer, MetaTransformer } from '../api/transformers.js';

export class SearchAwardsTool {
  constructor(apiClient, cache = null) {
    this.apiClient = apiClient;
    this.cache = cache;
  }

  getSchema() {
    return searchAwardsSchema;
  }

  async execute(params) {
    const { criteria = {}, pagination = {}, sort_field, sort_order } = params;

    // Build cache key if caching is enabled
    const cacheKey = this.cache ? this.buildCacheKey(params) : null;

    // Check cache
    if (this.cache && cacheKey) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(cached, null, 2),
            },
          ],
          isError: false,
        };
      }
    }

    try {
      // Build NIH API request
      const apiRequest = this.buildAPIRequest(criteria, pagination, sort_field, sort_order);

      // Execute search
      const response = await this.apiClient.searchProjects(apiRequest);

      // Transform response
      const transformed = {
        meta: MetaTransformer.transform(response.meta, pagination.offset, pagination.limit),
        results: ProjectTransformer.transformList(response.results || []),
      };

      // Cache the result
      if (this.cache && cacheKey) {
        this.cache.set(cacheKey, transformed);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(transformed, null, 2),
          },
        ],
        isError: false,
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                error: {
                  code: error.code || 'SEARCH_ERROR',
                  message: error.message,
                  details: error.details,
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
  }

  /**
   * Build NIH API request from MCP tool parameters
   */
  buildAPIRequest(criteria, pagination, sortField, sortOrder) {
    const request = {
      criteria: {},
      offset: pagination.offset || 0,
      limit: pagination.limit || 25,
    };

    // Map criteria fields to NIH API format
    if (criteria.pi_names?.length) {
      request.criteria.pi_names = criteria.pi_names.map((name) => {
        // Support both "Last, First" and just "Name" formats
        if (name.includes(',')) {
          const [last, first] = name.split(',').map((s) => s.trim());
          return { last_name: last, first_name: first };
        }
        return { any_name: name };
      });
    }

    if (criteria.org_names?.length) {
      request.criteria.org_names = criteria.org_names;
    }

    if (criteria.fiscal_years?.length) {
      request.criteria.fiscal_years = criteria.fiscal_years;
    }

    if (criteria.project_nums?.length) {
      request.criteria.project_nums = criteria.project_nums;
    }

    if (criteria.award_types?.length) {
      request.criteria.activity_codes = criteria.award_types;
    }

    if (criteria.agencies?.length) {
      request.criteria.agencies = criteria.agencies;
    }

    if (criteria.advanced_text_search) {
      request.criteria.advanced_text_search = criteria.advanced_text_search;
    }

    if (criteria.min_award_amount !== undefined || criteria.max_award_amount !== undefined) {
      request.criteria.award_amount_range = {
        min_amount: criteria.min_award_amount,
        max_amount: criteria.max_award_amount,
      };
    }

    if (criteria.include_fields?.length) {
      request.include_fields = criteria.include_fields;
    }

    if (criteria.exclude_fields?.length) {
      request.exclude_fields = criteria.exclude_fields;
    }

    if (sortField) {
      request.sort_field = sortField;
      request.sort_order = sortOrder || 'desc';
    }

    return request;
  }

  /**
   * Build cache key from parameters
   */
  buildCacheKey(params) {
    return `search_awards:${JSON.stringify(params)}`;
  }
}
