/**
 * Search PIs Tool
 *
 * MCP tool for searching principal investigators and their associated projects
 */
import { searchPIsSchema } from '../schemas/tool-schemas.js';
import { ProjectTransformer, PIGrouper, MetaTransformer } from '../api/transformers.js';

export class SearchPIsTool {
  constructor(apiClient, cache = null) {
    this.apiClient = apiClient;
    this.cache = cache;
  }

  getSchema() {
    return searchPIsSchema;
  }

  async execute(params) {
    const { pi_name, organization, fiscal_years, include_projects = true, offset = 0, limit = 25 } = params;

    const cacheKey = this.cache ? `search_pis:${JSON.stringify(params)}` : null;

    // Check cache
    if (this.cache && cacheKey) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return {
          content: [{ type: 'text', text: JSON.stringify(cached, null, 2) }],
          isError: false,
        };
      }
    }

    try {
      // Build search criteria for projects by PI name
      const searchCriteria = {
        pi_names: [{ any_name: pi_name }],
      };

      if (organization) {
        searchCriteria.org_names = [organization];
      }

      if (fiscal_years?.length) {
        searchCriteria.fiscal_years = fiscal_years;
      }

      // Search for projects
      const response = await this.apiClient.searchProjects({
        criteria: searchCriteria,
        offset,
        limit,
      });

      // Transform projects
      const transformedProjects = ProjectTransformer.transformList(response.results || []);

      // Group by PI
      const piList = PIGrouper.groupByPI(transformedProjects, pi_name);

      // Remove project details if not requested
      if (!include_projects) {
        piList.forEach((pi) => {
          delete pi.projects;
        });
      }

      const result = {
        meta: {
          ...MetaTransformer.transform(response.meta, offset, limit),
          total_pis: piList.length,
          query: { pi_name, organization, fiscal_years },
        },
        principal_investigators: piList,
      };

      // Cache the result
      if (this.cache && cacheKey) {
        this.cache.set(cacheKey, result);
      }

      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
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
                  code: error.code || 'PI_SEARCH_ERROR',
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
}
