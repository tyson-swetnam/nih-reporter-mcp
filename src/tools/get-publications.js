/**
 * Get Publications Tool
 *
 * MCP tool for searching publications linked to NIH-funded research
 */
import { getPublicationsSchema } from '../schemas/tool-schemas.js';
import { PublicationTransformer, MetaTransformer } from '../api/transformers.js';

export class GetPublicationsTool {
  constructor(apiClient, cache = null) {
    this.apiClient = apiClient;
    this.cache = cache;
  }

  getSchema() {
    return getPublicationsSchema;
  }

  async execute(params) {
    const { criteria, offset = 0, limit = 25 } = params;

    const cacheKey = this.cache ? `get_publications:${JSON.stringify(params)}` : null;

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
      // Build search parameters
      const searchParams = {
        criteria: {},
        offset,
        limit,
      };

      // Map criteria to NIH API format
      if (criteria.project_nums?.length) {
        searchParams.criteria.core_project_nums = criteria.project_nums;
      }

      if (criteria.pmids?.length) {
        searchParams.criteria.pmids = criteria.pmids.map(String);
      }

      if (criteria.text_search) {
        searchParams.criteria.search_text = criteria.text_search;
      }

      if (criteria.pub_years?.length) {
        searchParams.criteria.pub_years = criteria.pub_years;
      }

      // Execute search
      const response = await this.apiClient.searchPublications(searchParams);

      // Transform response
      const result = {
        meta: MetaTransformer.transform(response.meta, offset, limit),
        publications: PublicationTransformer.transformList(response.results || []),
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
                  code: error.code || 'PUBLICATION_ERROR',
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
