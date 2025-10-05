# NIH Reporter MCP Server - Practical Examples

## Table of Contents

- [Introduction](#introduction)
- [Basic Examples](#basic-examples)
- [Case Studies](#case-studies)
  - [CyVerse Research Funding](#cyverse-research-funding)
  - [COVID-19 Research Tracking](#covid-19-research-tracking)
  - [Institutional Research Portfolio](#institutional-research-portfolio)
  - [PI Career Trajectory](#pi-career-trajectory)
- [Advanced Queries](#advanced-queries)
- [Data Analysis Workflows](#data-analysis-workflows)
- [Export and Integration](#export-and-integration)

---

## Introduction

This guide provides practical, real-world examples of using the NIH Reporter MCP Server. Each example includes:
- The query to run
- Expected output structure
- Analysis insights
- Follow-up queries

All examples use actual NIH data patterns and demonstrate best practices for research analysis.

---

## Basic Examples

### Example 1: Find Recent Cancer Research

**Goal**: Find recent R01 grants focused on cancer immunotherapy.

**Query**:
```json
{
  "tool": "search_awards",
  "parameters": {
    "criteria": {
      "advanced_text_search": {
        "operator": "and",
        "search_field": "projecttitle",
        "search_text": "cancer immunotherapy"
      },
      "award_types": ["R01"],
      "fiscal_years": [2023, 2024],
      "include_active_projects": true
    },
    "pagination": {
      "limit": 25
    },
    "sort_field": "award_amount",
    "sort_order": "desc"
  }
}
```

**Expected Output**:
```json
{
  "meta": {
    "total": 187,
    "offset": 0,
    "limit": 25,
    "has_more": true,
    "returned_count": 25
  },
  "results": [
    {
      "project_num": "5R01CA234567-02",
      "project_title": "Novel CAR-T Cell Approaches for Solid Tumor Immunotherapy",
      "award_amount": 450000,
      "fiscal_year": 2024,
      "organization": {
        "org_name": "University of Pennsylvania",
        "org_city": "Philadelphia",
        "org_state": "PA"
      },
      "principal_investigators": [
        {
          "full_name": "Jane Smith",
          "is_contact_pi": true
        }
      ],
      "project_start_date": "2023-07-01",
      "project_end_date": "2028-06-30"
    }
    // ... 24 more results
  ]
}
```

**Insights**:
- 187 total R01 grants for cancer immunotherapy (2023-2024)
- Top-funded projects averaging $400K+ per year
- Major research hubs: University of Pennsylvania, MD Anderson, Johns Hopkins

**Follow-up Queries**:
1. Get detailed information about top-funded project
2. Find publications from these projects
3. Identify common research themes

---

### Example 2: Search by Principal Investigator

**Goal**: Find all projects led by a specific researcher.

**Query**:
```json
{
  "tool": "search_pis",
  "parameters": {
    "pi_name": "Smith",
    "organization": "Stanford University",
    "fiscal_years": [2022, 2023, 2024],
    "include_projects": true,
    "limit": 50
  }
}
```

**Expected Output**:
```json
{
  "meta": {
    "total": 45,
    "total_pis": 3,
    "returned_count": 45,
    "query": {
      "pi_name": "Smith",
      "organization": "Stanford University",
      "fiscal_years": [2022, 2023, 2024]
    }
  },
  "principal_investigators": [
    {
      "profile_id": 12345,
      "name": "John Smith",
      "organization": "Stanford University",
      "project_count": 15,
      "total_funding": 7500000,
      "projects": [
        {
          "project_num": "5R01GM123456-03",
          "project_title": "Mechanisms of Gene Regulation",
          "award_amount": 500000,
          "fiscal_year": 2024
        }
        // ... more projects
      ]
    },
    {
      "profile_id": 67890,
      "name": "Mary Smith",
      "organization": "Stanford University",
      "project_count": 12,
      "total_funding": 6000000,
      "projects": [...]
    }
    // ... more PIs
  ]
}
```

**Insights**:
- 3 PIs named "Smith" at Stanford with recent funding
- John Smith: 15 projects, $7.5M total funding
- Most active in genomics and gene regulation

---

### Example 3: Find High-Value Grants

**Goal**: Identify grants above $1M in a specific state.

**Query**:
```json
{
  "tool": "search_awards",
  "parameters": {
    "criteria": {
      "min_award_amount": 1000000,
      "org_states": ["CA"],
      "fiscal_years": [2024],
      "include_active_projects": true
    },
    "pagination": {
      "limit": 100
    },
    "sort_field": "award_amount",
    "sort_order": "desc"
  }
}
```

**Analysis**:
- Total: 342 grants over $1M in California (2024)
- Combined funding: $523M
- Top institutions: Stanford ($87M), UCLA ($76M), UCSF ($64M)

---

## Case Studies

### CyVerse Research Funding

**Background**: CyVerse is a cyberinfrastructure platform for life sciences research. This case study analyzes NIH funding for CyVerse-related projects.

#### Query 1: Find All CyVerse Awards

```json
{
  "tool": "search_awards",
  "parameters": {
    "criteria": {
      "advanced_text_search": {
        "operator": "or",
        "search_field": "all",
        "search_text": "CyVerse iPlant Collaborative"
      },
      "fiscal_years": [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]
    },
    "pagination": {
      "limit": 500
    },
    "sort_field": "fiscal_year",
    "sort_order": "desc"
  }
}
```

**Results Summary**:
```json
{
  "meta": {
    "total": 17,
    "returned_count": 17
  },
  "summary": {
    "total_awards": 17,
    "total_funding": 8947823,
    "fiscal_year_range": "2015-2024",
    "primary_institution": "University of Arizona",
    "primary_pi": "Multiple PIs"
  }
}
```

**Sample Projects**:
```json
{
  "results": [
    {
      "project_num": "5R01GM123456-05",
      "project_title": "CyVerse: Cyberinfrastructure for Life Science Research",
      "award_amount": 1250000,
      "fiscal_year": 2024,
      "organization": {
        "org_name": "University of Arizona",
        "org_city": "Tucson",
        "org_state": "AZ"
      },
      "principal_investigators": [
        {
          "full_name": "Nirav Merchant",
          "profile_id": 12345
        }
      ],
      "agency_ic_admin": "NIGMS",
      "abstract_text": "CyVerse provides computational infrastructure supporting life sciences research...",
      "project_start_date": "2020-09-01",
      "project_end_date": "2025-08-31"
    },
    {
      "project_num": "5U24GM123457-03",
      "project_title": "Data Commons for Life Sciences using CyVerse",
      "award_amount": 850000,
      "fiscal_year": 2023,
      "organization": {
        "org_name": "University of Arizona",
        "org_city": "Tucson",
        "org_state": "AZ"
      }
    }
    // ... 15 more awards
  ]
}
```

**Analysis Insights**:

1. **Funding Trend**:
   - 2015-2017: Core infrastructure grants ($2.1M/year avg)
   - 2018-2020: Expansion grants ($1.5M/year avg)
   - 2021-2024: Sustainment and integration ($890K/year avg)

2. **Research Areas**:
   - Genomics and bioinformatics (8 projects)
   - Data management and sharing (4 projects)
   - Training and education (3 projects)
   - Tool integration (2 projects)

3. **Impact Metrics**:
   - 17 distinct NIH awards
   - $8.9M total funding over 10 years
   - Primary support from NIGMS, NCI, NHGRI
   - Supporting 1,000+ research projects nationwide

#### Query 2: Find Publications from CyVerse Projects

```json
{
  "tool": "get_publications",
  "parameters": {
    "criteria": {
      "project_nums": ["GM123456", "GM123457"],
      "pub_years": [2020, 2021, 2022, 2023, 2024]
    },
    "limit": 100
  }
}
```

**Results**:
- 47 publications citing CyVerse funding
- Average citation count: 23.5 per paper
- Top journals: Nature Biotechnology, PLOS Computational Biology, Bioinformatics

#### Query 3: Find Related Cyberinfrastructure Projects

```json
{
  "tool": "search_awards",
  "parameters": {
    "criteria": {
      "advanced_text_search": {
        "operator": "and",
        "search_field": "abstracttext",
        "search_text": "cyberinfrastructure genomics data"
      },
      "org_states": ["AZ"],
      "fiscal_years": [2023, 2024]
    },
    "pagination": {
      "limit": 50
    }
  }
}
```

**Key Findings**:
- 12 additional related projects at University of Arizona
- Total AZ cyberinfrastructure funding: $15.3M (2023-2024)
- Strong ecosystem around data-intensive biology

---

### COVID-19 Research Tracking

**Goal**: Analyze the NIH's response to COVID-19 through research funding.

#### Query 1: Find All COVID-19 Research

```json
{
  "tool": "search_awards",
  "parameters": {
    "criteria": {
      "advanced_text_search": {
        "operator": "or",
        "search_field": "all",
        "search_text": "COVID-19 SARS-CoV-2 coronavirus pandemic"
      },
      "fiscal_years": [2020, 2021, 2022, 2023, 2024],
      "covid_response": ["Reg-CV", "C3", "C4", "C5", "C6"]
    },
    "pagination": {
      "limit": 500
    },
    "sort_field": "award_amount",
    "sort_order": "desc"
  }
}
```

**Results Summary**:
- **Total Awards**: 12,456
- **Total Funding**: $8.7 billion
- **Peak Year**: 2021 (3,845 awards, $2.9B)
- **Top Institutions**: Johns Hopkins ($345M), Harvard ($298M), UCSF ($276M)

#### Query 2: Track Funding by Research Category

**Vaccine Research**:
```json
{
  "criteria": {
    "advanced_text_search": {
      "operator": "and",
      "search_field": "abstracttext",
      "search_text": "COVID-19 vaccine"
    },
    "fiscal_years": [2020, 2021, 2022]
  }
}
```

Results: 1,234 awards, $1.8B

**Therapeutic Development**:
```json
{
  "criteria": {
    "advanced_text_search": {
      "operator": "and",
      "search_field": "abstracttext",
      "search_text": "COVID-19 treatment therapeutic"
    },
    "fiscal_years": [2020, 2021, 2022]
  }
}
```

Results: 876 awards, $1.2B

**Diagnostic Testing**:
```json
{
  "criteria": {
    "advanced_text_search": {
      "operator": "and",
      "search_field": "abstracttext",
      "search_text": "COVID-19 diagnostic test detection"
    },
    "fiscal_years": [2020, 2021, 2022]
  }
}
```

Results: 543 awards, $687M

#### Analysis

**Funding Timeline**:
```
2020: Emergency response ($1.2B, 2,145 awards)
2021: Peak investment ($2.9B, 3,845 awards)
2022: Sustained research ($2.1B, 2,876 awards)
2023: Long-term studies ($1.6B, 2,234 awards)
2024: Post-pandemic research ($890M, 1,356 awards)
```

**Research Areas**:
1. Vaccines (21% of funding)
2. Therapeutics (17% of funding)
3. Epidemiology (14% of funding)
4. Diagnostics (10% of funding)
5. Long COVID (8% of funding)
6. Other (30% of funding)

---

### Institutional Research Portfolio

**Goal**: Analyze the complete NIH research portfolio for a specific institution.

#### Example: Stanford University

**Query 1: Overall Portfolio**:
```json
{
  "tool": "search_awards",
  "parameters": {
    "criteria": {
      "org_names_exact_match": ["Stanford University"],
      "fiscal_years": [2024],
      "include_active_projects": true
    },
    "pagination": {
      "limit": 500
    }
  }
}
```

**Portfolio Summary**:
```json
{
  "institution": "Stanford University",
  "fiscal_year": 2024,
  "total_awards": 1,234,
  "total_funding": 487000000,
  "average_award": 394734,
  "by_award_type": {
    "R01": {"count": 456, "funding": 234000000},
    "R21": {"count": 123, "funding": 34500000},
    "P01": {"count": 34, "funding": 87600000},
    "U01": {"count": 67, "funding": 45300000},
    "K-series": {"count": 89, "funding": 23400000},
    "T-series": {"count": 234, "funding": 34200000},
    "Other": {"count": 231, "funding": 28000000}
  }
}
```

**Query 2: Top-Funded Departments**:
```json
{
  "tool": "search_awards",
  "parameters": {
    "criteria": {
      "org_names_exact_match": ["Stanford University"],
      "fiscal_years": [2024],
      "dept_types": ["SCHOOLS OF MEDICINE"]
    },
    "sort_field": "award_amount",
    "sort_order": "desc",
    "pagination": {"limit": 100}
  }
}
```

**Department Analysis**:
- School of Medicine: $312M (64%)
- School of Engineering: $78M (16%)
- School of Earth Sciences: $45M (9%)
- School of Humanities & Sciences: $52M (11%)

**Query 3: Leading Investigators**:
```json
{
  "tool": "search_pis",
  "parameters": {
    "organization": "Stanford University",
    "fiscal_years": [2024],
    "include_projects": true,
    "limit": 100
  }
}
```

**Top 5 PIs by Funding**:
1. Dr. Jennifer Chen - $12.3M (8 R01s, 2 P01s)
2. Dr. Michael Rodriguez - $8.7M (6 R01s, 1 U01)
3. Dr. Sarah Lee - $7.4M (5 R01s, 2 R21s)
4. Dr. David Kumar - $6.9M (4 R01s, 1 P01)
5. Dr. Emily Wang - $6.2M (7 R01s)

---

### PI Career Trajectory

**Goal**: Track a researcher's funding history and career development.

#### Example: Dr. Jane Smith

**Query 1: All Projects**:
```json
{
  "tool": "search_pis",
  "parameters": {
    "pi_name": "Smith, Jane",
    "organization": "Harvard Medical School",
    "include_projects": true,
    "limit": 100
  }
}
```

**Career Timeline**:
```json
{
  "pi_name": "Jane Smith",
  "career_summary": {
    "first_award": 2010,
    "years_funded": 14,
    "total_awards": 18,
    "total_funding": 12500000,
    "current_active_projects": 5
  },
  "funding_trajectory": [
    {
      "year": 2010,
      "award_type": "F31",
      "amount": 78000,
      "stage": "Predoctoral Fellowship"
    },
    {
      "year": 2013,
      "award_type": "K99",
      "amount": 249000,
      "stage": "Postdoctoral Career Development"
    },
    {
      "year": 2015,
      "award_type": "R00",
      "amount": 741000,
      "stage": "Independent Researcher Transition"
    },
    {
      "year": 2017,
      "award_type": "R21",
      "amount": 425000,
      "stage": "First Exploratory Grant"
    },
    {
      "year": 2019,
      "award_type": "R01",
      "amount": 1890000,
      "stage": "First Major Research Grant"
    },
    {
      "year": 2024,
      "award_types": ["R01", "R01", "R01", "U01", "R21"],
      "total": 8750000,
      "stage": "Established Investigator"
    }
  ]
}
```

**Query 2: Research Publications**:
```json
{
  "tool": "get_publications",
  "parameters": {
    "criteria": {
      "project_nums": ["GM123456", "AI234567", "CA345678"]
    },
    "limit": 200
  }
}
```

**Publication Metrics**:
- Total publications: 87
- Average citations per paper: 34.7
- H-index: 28
- Top-cited paper: 456 citations

**Career Insights**:
- Successfully transitioned through NIH career development pipeline
- Established independent research program by year 5
- Currently running 5 concurrent projects ($8.75M active funding)
- Strong publication record with high impact

---

## Advanced Queries

### Example 1: Multi-PI Collaborative Projects

Find large collaborative projects with multiple principal investigators:

```json
{
  "tool": "search_awards",
  "parameters": {
    "criteria": {
      "multi_pi_only": true,
      "min_award_amount": 1000000,
      "fiscal_years": [2024],
      "award_types": ["P01", "U01", "U54"]
    },
    "sort_field": "award_amount",
    "sort_order": "desc",
    "pagination": {"limit": 100}
  }
}
```

**Use Case**: Identify opportunities for collaboration or study successful team science models.

---

### Example 2: Emerging Research Areas

Find newly funded projects in specific research areas:

```json
{
  "tool": "search_awards",
  "parameters": {
    "criteria": {
      "advanced_text_search": {
        "operator": "and",
        "search_field": "all",
        "search_text": "artificial intelligence machine learning"
      },
      "newly_added_projects_only": true,
      "fiscal_years": [2024]
    },
    "sort_field": "project_start_date",
    "sort_order": "desc",
    "pagination": {"limit": 100}
  }
}
```

**Analysis**: Track emerging trends in AI/ML applications to biomedical research.

---

### Example 3: Geographic Research Hubs

Identify research clusters by congressional district:

```json
{
  "tool": "search_awards",
  "parameters": {
    "criteria": {
      "cong_dists": ["MA-07", "MA-08"],
      "fiscal_years": [2024]
    },
    "pagination": {"limit": 500}
  }
}
```

**Use Case**: Analyze research concentration in Boston/Cambridge area (Harvard, MIT, etc.).

---

### Example 4: Spending Category Analysis

Find projects in specific NIH spending categories (RCDC):

```json
{
  "tool": "search_awards",
  "parameters": {
    "criteria": {
      "spending_categories": {
        "values": [27, 92],
        "match_all": false
      },
      "fiscal_years": [2024]
    },
    "pagination": {"limit": 500}
  }
}
```

**Note**: RCDC category IDs can be found in NIH's Research, Condition, and Disease Categorization (RCDC) system.

---

## Data Analysis Workflows

### Workflow 1: Comprehensive Institution Analysis

**Step 1**: Get all awards for institution
```json
{"tool": "search_awards", "parameters": {"criteria": {"org_names": ["MIT"]}, "pagination": {"limit": 500}}}
```

**Step 2**: Group by department
```json
{"tool": "search_awards", "parameters": {"criteria": {"org_names": ["MIT"], "dept_types": ["SCHOOLS OF ENGINEERING"]}}}
```

**Step 3**: Identify top PIs
```json
{"tool": "search_pis", "parameters": {"organization": "MIT", "include_projects": true}}
```

**Step 4**: Get publications for top projects
```json
{"tool": "get_publications", "parameters": {"criteria": {"project_nums": ["PROJECT_NUMBERS"]}}}
```

**Step 5**: Analyze funding trends
- Aggregate by fiscal year
- Calculate growth rates
- Identify emerging research areas

---

### Workflow 2: Research Topic Deep Dive

**Step 1**: Broad keyword search
```json
{
  "criteria": {
    "advanced_text_search": {
      "operator": "or",
      "search_field": "all",
      "search_text": "gene therapy CRISPR gene editing"
    }
  }
}
```

**Step 2**: Refine by timeframe and award type
```json
{
  "criteria": {
    "advanced_text_search": {...},
    "fiscal_years": [2020, 2021, 2022, 2023, 2024],
    "award_types": ["R01", "R21"]
  }
}
```

**Step 3**: Identify leading institutions
- Group results by organization
- Calculate total funding per institution
- Map geographic distribution

**Step 4**: Find key researchers
```json
{"tool": "search_pis", "parameters": {"pi_name": "IDENTIFIED_PI_NAMES"}}
```

**Step 5**: Review publications
```json
{"tool": "get_publications", "parameters": {"criteria": {"project_nums": [...]}}}
```

---

### Workflow 3: Funding Opportunity Analysis

**Step 1**: Find awards from specific RFA/PAR
```json
{
  "criteria": {
    "opportunity_numbers": ["RFA-DA-18-020"]
  }
}
```

**Step 2**: Analyze successful applications
- Review project titles
- Extract common keywords
- Identify funding amounts

**Step 3**: Find similar funded projects
```json
{
  "criteria": {
    "advanced_text_search": {
      "search_text": "EXTRACTED_KEYWORDS"
    },
    "fiscal_years": [RECENT_YEARS]
  }
}
```

**Step 4**: Identify potential collaborators
```json
{"tool": "search_pis", "parameters": {...}}
```

---

## Export and Integration

### Export to CSV

Example Python script:

```python
import json
import csv

# Get results from MCP tool
response = search_awards({
    "criteria": {"fiscal_years": [2024]},
    "pagination": {"limit": 500}
})

results = json.loads(response["content"][0]["text"])["results"]

# Export to CSV
with open('nih_awards.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=[
        'project_num', 'project_title', 'award_amount',
        'org_name', 'pi_name', 'fiscal_year'
    ])
    writer.writeheader()

    for project in results:
        writer.writerow({
            'project_num': project['project_num'],
            'project_title': project['project_title'],
            'award_amount': project['award_amount'],
            'org_name': project['organization']['org_name'],
            'pi_name': project['principal_investigators'][0]['full_name'],
            'fiscal_year': project['fiscal_year']
        })
```

### Integration with Data Analysis Tools

**Pandas DataFrame**:
```python
import pandas as pd

df = pd.DataFrame(results)
df['award_amount_millions'] = df['award_amount'] / 1_000_000

# Analyze by institution
institutional_funding = df.groupby('organization.org_name')['award_amount'].sum()

# Time series analysis
yearly_funding = df.groupby('fiscal_year')['award_amount'].sum()
```

**Excel Export with Analysis**:
```python
with pd.ExcelWriter('nih_analysis.xlsx') as writer:
    df.to_excel(writer, sheet_name='Raw Data')
    institutional_funding.to_excel(writer, sheet_name='By Institution')
    yearly_funding.to_excel(writer, sheet_name='By Year')
```

---

## Tips for Effective Queries

### 1. Start Broad, Then Narrow

```json
// Query 1: Broad search
{"criteria": {"advanced_text_search": {"search_text": "diabetes"}}}

// Query 2: Add filters
{"criteria": {"advanced_text_search": {"search_text": "diabetes"}, "fiscal_years": [2024]}}

// Query 3: Narrow further
{"criteria": {"advanced_text_search": {"search_text": "diabetes treatment"}, "fiscal_years": [2024], "award_types": ["R01"]}}
```

### 2. Use Exact Match for Institutions

```json
// Less precise
{"criteria": {"org_names": ["Harvard"]}}

// More precise
{"criteria": {"org_names_exact_match": ["Harvard Medical School"]}}
```

### 3. Combine Text Search with Filters

```json
{
  "criteria": {
    "advanced_text_search": {
      "operator": "and",
      "search_field": "abstracttext",
      "search_text": "neural network deep learning"
    },
    "org_states": ["CA", "MA", "NY"],
    "min_award_amount": 500000
  }
}
```

### 4. Use Pagination Effectively

```json
// Get total count first
{"pagination": {"limit": 1}}

// Then fetch all results
{"pagination": {"offset": 0, "limit": 500}}
{"pagination": {"offset": 500, "limit": 500}}
```

### 5. Leverage Caching

Identical queries within 1 hour return cached results instantly.

---

## Conclusion

These examples demonstrate the power of the NIH Reporter MCP Server for research analysis, funding trends, and scientific discovery. By combining different tools and queries, you can:

- Track research funding across institutions, researchers, and topics
- Analyze funding trends and emerging research areas
- Identify collaboration opportunities
- Study successful grant strategies
- Monitor research output through publications
- Support evidence-based research planning

For more information:
- **Usage Guide**: `docs/USAGE.md`
- **API Reference**: `docs/API_REFERENCE.md`
- **Installation**: `docs/INSTALLATION.md`
