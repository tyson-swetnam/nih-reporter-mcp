/**
 * Get Project Tool
 *
 * MCP tool for retrieving detailed information about a specific NIH project
 */
import { getProjectSchema } from '../schemas/tool-schemas.js';
import { ProjectTransformer, PublicationTransformer } from '../api/transformers.js';
import { MCPError, ErrorCodes } from '../utils/error-handler.js';

export class GetProjectTool {
  constructor(apiClient, cache = null) {
    this.apiClient = apiClient;
    this.cache = cache;
  }

  getSchema() {
    return getProjectSchema;
  }

  async execute(params) {
    const {
      project_number,
      include_publications = false,
      include_patents = false,
      include_clinical_studies = false,
    } = params;

    const cacheKey = this.cache ? `get_project:${project_number}` : null;

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
      // Search for the project using NIH API
      const searchResponse = await this.apiClient.searchProjects({
        criteria: {
          project_nums: [project_number],
        },
        limit: 1,
      });

      if (!searchResponse.results || searchResponse.results.length === 0) {
        throw new MCPError(
          ErrorCodes.NOT_FOUND,
          `Project not found: ${project_number}`,
          { project_number }
        );
      }

      // Transform the project data
      const project = ProjectTransformer.transform(searchResponse.results[0]);

      // Optionally fetch publications
      if (include_publications) {
        try {
          const pubResponse = await this.apiClient.searchPublications({
            criteria: {
              core_project_nums: [project.core_project_num],
            },
            limit: 100,
          });

          project.publications = PublicationTransformer.transformList(pubResponse.results || []);
        } catch (error) {
          // Don't fail the entire request if publications fetch fails
          project.publications_error = error.message;
          project.publications = [];
        }
      }

      // Note: NIH API doesn't provide direct patent/clinical study endpoints
      // These would need to be fetched from other sources or marked as unavailable
      if (include_patents) {
        project.patents = [];
        project.patents_note = 'Patent data not available from NIH RePORTER API';
      }

      if (include_clinical_studies) {
        project.clinical_studies = [];
        project.clinical_studies_note = 'Clinical study data not available from NIH RePORTER API';
      }

      // Cache the result
      if (this.cache && cacheKey) {
        this.cache.set(cacheKey, project);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(project, null, 2),
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
                  code: error.code || 'PROJECT_ERROR',
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
