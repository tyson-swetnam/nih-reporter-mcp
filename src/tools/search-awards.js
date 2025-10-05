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

    // Phase 1 HIGH priority parameters
    if (criteria.include_active_projects !== undefined) {
      request.criteria.include_active_projects = criteria.include_active_projects;
    }

    if (criteria.org_states?.length) {
      request.criteria.org_states = criteria.org_states;
    }

    if (criteria.appl_ids?.length) {
      request.criteria.appl_ids = criteria.appl_ids;
    }

    if (criteria.project_start_date) {
      request.criteria.project_start_date = {
        from_date: criteria.project_start_date.from_date,
        to_date: criteria.project_start_date.to_date,
      };
    }

    if (criteria.project_end_date) {
      request.criteria.project_end_date = {
        from_date: criteria.project_end_date.from_date,
        to_date: criteria.project_end_date.to_date,
      };
    }

    if (criteria.award_notice_date) {
      request.criteria.award_notice_date = {
        from_date: criteria.award_notice_date.from_date,
        to_date: criteria.award_notice_date.to_date,
      };
    }

    if (criteria.exclude_subprojects !== undefined) {
      request.criteria.exclude_subprojects = criteria.exclude_subprojects;
    }

    if (criteria.covid_response?.length) {
      request.criteria.covid_response = criteria.covid_response;
    }

    // Phase 2 MEDIUM priority parameters
    if (criteria.po_names?.length) {
      request.criteria.po_names = criteria.po_names;
    }

    if (criteria.org_names_exact_match?.length) {
      request.criteria.org_names_exact_match = criteria.org_names_exact_match;
    }

    if (criteria.org_cities?.length) {
      request.criteria.org_cities = criteria.org_cities;
    }

    if (criteria.org_countries?.length) {
      request.criteria.org_countries = criteria.org_countries;
    }

    if (criteria.funding_mechanism?.length) {
      request.criteria.funding_mechanism = criteria.funding_mechanism;
    }

    if (criteria.dept_types?.length) {
      request.criteria.dept_types = criteria.dept_types;
    }

    if (criteria.cong_dists?.length) {
      request.criteria.cong_dists = criteria.cong_dists;
    }

    if (criteria.organization_type?.length) {
      request.criteria.organization_type = criteria.organization_type;
    }

    if (criteria.multi_pi_only !== undefined) {
      request.criteria.multi_pi_only = criteria.multi_pi_only;
    }

    if (criteria.newly_added_projects_only !== undefined) {
      request.criteria.newly_added_projects_only = criteria.newly_added_projects_only;
    }

    if (criteria.date_added) {
      request.criteria.date_added = {
        from_date: criteria.date_added.from_date,
        to_date: criteria.date_added.to_date,
      };
    }

    // Phase 3 LOW priority parameters
    if (criteria.pi_profile_ids?.length) {
      request.criteria.pi_profile_ids = criteria.pi_profile_ids;
    }

    if (criteria.spending_categories) {
      request.criteria.spending_categories = {
        Values: criteria.spending_categories.values,
        match_all: criteria.spending_categories.match_all ? 'true' : 'false',
      };
    }

    if (criteria.opportunity_numbers?.length) {
      request.criteria.opportunity_numbers = criteria.opportunity_numbers;
    }

    if (criteria.is_agency_admin !== undefined) {
      request.criteria.is_agency_admin = criteria.is_agency_admin;
    }

    if (criteria.is_agency_funding !== undefined) {
      request.criteria.is_agency_funding = criteria.is_agency_funding;
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
