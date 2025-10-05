/**
 * Data Transformers
 *
 * Transform NIH API responses into clean, user-friendly formats for MCP
 */

/**
 * Transform NIH project data to standardized format
 */
export class ProjectTransformer {
  static transform(rawProject) {
    if (!rawProject) return null;

    return {
      // Core identifiers
      project_number: rawProject.project_num,
      application_id: rawProject.appl_id,
      core_project_num: rawProject.core_project_num,

      // Project details
      title: rawProject.project_title,
      abstract: rawProject.abstract_text,
      public_health_relevance: rawProject.phr_text,

      // Principal investigators
      principal_investigators:
        rawProject.principal_investigators?.map((pi) => ({
          name: `${pi.first_name || ''} ${pi.last_name || ''}`.trim(),
          first_name: pi.first_name,
          last_name: pi.last_name,
          email: pi.email,
          is_contact: pi.is_contact_pi,
          profile_id: pi.profile_id,
        })) || [],

      // Organization
      organization: rawProject.organization
        ? {
            name: rawProject.organization.org_name,
            city: rawProject.organization.org_city,
            state: rawProject.organization.org_state,
            state_code: rawProject.organization.org_state_code,
            country: rawProject.organization.org_country,
            zip: rawProject.organization.org_zipcode,
            duns: rawProject.organization.org_duns,
            uei: rawProject.organization.org_uei,
            fips: rawProject.organization.org_fips,
          }
        : null,

      // Funding information
      funding: {
        fiscal_year: rawProject.fiscal_year,
        award_amount: rawProject.award_amount,
        total_cost: rawProject.total_cost,
        direct_cost: rawProject.direct_cost_amt,
        indirect_cost: rawProject.indirect_cost_amt,
      },

      // Award details
      award: {
        type: rawProject.activity_code,
        activity_code: rawProject.activity_code,
        notice_date: rawProject.award_notice_date,
        agency: rawProject.agency_code,
        agency_ic_admin: rawProject.agency_ic_admin,
        agency_ic_fundings: rawProject.agency_ic_fundings,
        ic_code: rawProject.ic_code,
        funding_mechanism: rawProject.funding_mechanism,
        subproject_id: rawProject.subproject_id,
      },

      // Dates
      dates: {
        start: rawProject.project_start_date,
        end: rawProject.project_end_date,
        budget_start: rawProject.budget_start_date,
        budget_end: rawProject.budget_end_date,
      },

      // Terms and keywords
      terms: rawProject.project_terms || [],

      // Additional metadata
      metadata: {
        serial_number: rawProject.serial_number,
        full_foa: rawProject.full_foa,
        is_active: rawProject.is_active,
        suffix_code: rawProject.suffix_code,
        support_year: rawProject.support_year,
        full_study_section: rawProject.full_study_section,
        study_section: rawProject.study_section,
        study_section_name: rawProject.study_section_name,
        arra_funded: rawProject.arra_funded,
        covid_response: rawProject.covid_response,
      },
    };
  }

  static transformList(rawProjects) {
    if (!Array.isArray(rawProjects)) return [];
    return rawProjects.map((project) => this.transform(project)).filter(Boolean);
  }
}

/**
 * Transform NIH publication data to standardized format
 */
export class PublicationTransformer {
  static transform(rawPublication) {
    if (!rawPublication) return null;

    return {
      pmid: rawPublication.pmid,
      pmc_id: rawPublication.pmc_id,
      title: rawPublication.pub_title,
      authors: rawPublication.author_list,
      author_list: rawPublication.author_list,
      journal: rawPublication.journal_title,
      journal_title: rawPublication.journal_title,
      journal_volume: rawPublication.journal_volume,
      journal_issue: rawPublication.journal_issue,
      pages: rawPublication.page_number,
      publication_year: rawPublication.pub_year,
      publication_date: rawPublication.pub_date,
      citation: rawPublication.citation,
      abstract: rawPublication.abstract,
      doi: rawPublication.doi,
      issn: rawPublication.issn,
      is_research_article: rawPublication.is_research_article,
      is_clinical: rawPublication.is_clinical,
      linked_projects: rawPublication.applIds || [],
      coreproject: rawPublication.coreproject || [],
    };
  }

  static transformList(rawPublications) {
    if (!Array.isArray(rawPublications)) return [];
    return rawPublications.map((pub) => this.transform(pub)).filter(Boolean);
  }
}

/**
 * Transform search metadata
 */
export class MetaTransformer {
  static transform(rawMeta, offset, limit) {
    return {
      total: rawMeta?.total || 0,
      offset: offset || 0,
      limit: limit || 25,
      has_more: (rawMeta?.total || 0) > (offset || 0) + (limit || 25),
      returned_count: rawMeta?.count || 0,
    };
  }
}

/**
 * Group projects by principal investigator
 */
export class PIGrouper {
  static groupByPI(projects, piNameFilter = null) {
    const piMap = new Map();

    for (const project of projects) {
      const pis = project.principal_investigators || [];

      for (const pi of pis) {
        const piKey = `${pi.last_name}, ${pi.first_name}`;

        // Apply filter if provided
        if (piNameFilter && !piKey.toLowerCase().includes(piNameFilter.toLowerCase())) {
          continue;
        }

        if (!piMap.has(piKey)) {
          piMap.set(piKey, {
            name: piKey,
            first_name: pi.first_name,
            last_name: pi.last_name,
            email: pi.email,
            profile_id: pi.profile_id,
            projects: [],
            total_funding: 0,
            project_count: 0,
          });
        }

        const piData = piMap.get(piKey);
        piData.projects.push(project);
        piData.total_funding += project.funding?.award_amount || 0;
        piData.project_count++;
      }
    }

    return Array.from(piMap.values());
  }
}
