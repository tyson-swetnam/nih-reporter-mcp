# Phase 1 Enhancements - NEW Parameters Available

## 🎉 New Search Capabilities Added

Phase 1 implementation adds **9 HIGH priority parameters** to the `search_awards` tool, increasing API coverage from 38% to **65%**.

## 📅 Date Range Filtering

### project_start_date

Filter projects by their start date range.

**Example:**
```json
{
  "name": "search_awards",
  "arguments": {
    "criteria": {
      "project_start_date": {
        "from_date": "2023-01-01",
        "to_date": "2023-12-31"
      }
    }
  }
}
```

**Use Cases:**
- Find projects that started in a specific year
- Analyze research initiation patterns
- Track new project funding trends

### project_end_date

Filter projects by their completion date range.

**Example:**
```json
{
  "name": "search_awards",
  "arguments": {
    "criteria": {
      "project_end_date": {
        "from_date": "2024-01-01",
        "to_date": "2024-12-31"
      }
    }
  }
}
```

**Use Cases:**
- Find projects ending soon
- Track project completion timelines
- Identify expiring grants

### award_notice_date

Filter by the date awards were announced.

**Example:**
```json
{
  "name": "search_awards",
  "arguments": {
    "criteria": {
      "award_notice_date": {
        "from_date": "2023-06-01",
        "to_date": "2023-06-30"
      }
    }
  }
}
```

**Use Cases:**
- Track recent award announcements
- Analyze award timing patterns
- Monitor new funding availability

### Date Format
All dates must be in **YYYY-MM-DD** format (e.g., "2023-06-15").

## 🗺️ Geographic Filtering

### org_states

Filter research by US state, territory, or military location.

**Example:**
```json
{
  "name": "search_awards",
  "arguments": {
    "criteria": {
      "org_states": ["CA", "NY", "MA"]
    }
  }
}
```

**Supported Codes:**
- **50 US States**: AL, AK, AZ, AR, CA, CO, CT, DE, FL, GA, HI, ID, IL, IN, IA, KS, KY, LA, ME, MD, MA, MI, MN, MS, MO, MT, NE, NV, NH, NJ, NM, NY, NC, ND, OH, OK, OR, PA, RI, SC, SD, TN, TX, UT, VT, VA, WA, WV, WI, WY
- **DC**: District of Columbia
- **Territories**: AS, GU, MP, PR, VI, UM
- **Military**: AA, AE, AP

**Use Cases:**
- State-level research analysis
- Regional funding distribution
- Local impact assessment
- Policy analysis by geography

## 🔍 Direct Lookup

### appl_ids

Search by specific NIH application IDs for precise retrieval.

**Example:**
```json
{
  "name": "search_awards",
  "arguments": {
    "criteria": {
      "appl_ids": [10001234, 10005678, 10009012]
    }
  }
}
```

**Use Cases:**
- Direct application lookup
- Batch retrieval of specific applications
- Cross-reference with external databases

## ✅ Project Status Filters

### include_active_projects

Filter to show only currently active research projects.

**Example:**
```json
{
  "name": "search_awards",
  "arguments": {
    "criteria": {
      "include_active_projects": true
    }
  }
}
```

**Use Cases:**
- Find ongoing research
- Identify active collaborations
- Current research landscape analysis

### exclude_subprojects

Remove subproject entries from results for cleaner data.

**Example:**
```json
{
  "name": "search_awards",
  "arguments": {
    "criteria": {
      "exclude_subprojects": true
    }
  }
}
```

**Use Cases:**
- Focus on main project awards
- Avoid double-counting in funding analysis
- Simplified grant analysis

## 🦠 COVID-19 Research

### covid_response

Filter by COVID-19 response funding categories.

**Example:**
```json
{
  "name": "search_awards",
  "arguments": {
    "criteria": {
      "covid_response": ["Reg-CV", "C3", "C4"]
    }
  }
}
```

**Valid Categories:**
- **Reg-CV**: Regular COVID response
- **C3**: CARES Act funding
- **C4**: Paycheck Protection Program
- **C5**: Coronavirus Preparedness and Response Supplemental Appropriations Act
- **C6**: American Rescue Plan Act

**Use Cases:**
- Track pandemic research funding
- Analyze emergency response patterns
- Study COVID-19 research landscape

## 📊 Combined Examples

### Find Active COVID Research in California

```json
{
  "name": "search_awards",
  "arguments": {
    "criteria": {
      "org_states": ["CA"],
      "include_active_projects": true,
      "covid_response": ["Reg-CV", "C3", "C6"],
      "exclude_subprojects": true
    },
    "pagination": {
      "limit": 50
    }
  }
}
```

### Find Recent Awards in Multiple States

```json
{
  "name": "search_awards",
  "arguments": {
    "criteria": {
      "org_states": ["NY", "MA", "PA"],
      "award_notice_date": {
        "from_date": "2024-01-01",
        "to_date": "2024-03-31"
      }
    },
    "sort_field": "award_amount",
    "sort_order": "desc"
  }
}
```

### Timeline Analysis

```json
{
  "name": "search_awards",
  "arguments": {
    "criteria": {
      "project_start_date": {
        "from_date": "2023-01-01",
        "to_date": "2023-12-31"
      },
      "project_end_date": {
        "from_date": "2025-01-01",
        "to_date": "2027-12-31"
      },
      "fiscal_years": [2023, 2024, 2025]
    }
  }
}
```

## 🔬 Validation

All new parameters include built-in validation:

- **Dates**: Must be YYYY-MM-DD format, valid calendar dates
- **Date Ranges**: from_date must be before or equal to to_date
- **State Codes**: Must be valid US state, DC, territory, or military codes
- **COVID Categories**: Must be one of the official NIH categories
- **Application IDs**: Must be positive integers

Invalid values will return clear error messages.

## 📈 Coverage Improvement

**Before Phase 1:**
- 13/34 parameters (38% coverage)
- Supports ~50% of common queries

**After Phase 1:**
- 22/34 parameters (65% coverage)
- Supports ~90% of common queries

**Newly Enabled Query Types:**
- ✅ Temporal analysis (date-based searches)
- ✅ Geographic research distribution
- ✅ Active project filtering
- ✅ COVID-19 research tracking
- ✅ Direct application lookup
- ✅ Subproject exclusion

## 🚀 Migration Guide

Existing queries continue to work unchanged. New parameters are optional:

**Old Query (still works):**
```json
{
  "name": "search_awards",
  "arguments": {
    "criteria": {
      "pi_names": ["Smith, John"],
      "fiscal_years": [2023]
    }
  }
}
```

**Enhanced Query (now possible):**
```json
{
  "name": "search_awards",
  "arguments": {
    "criteria": {
      "pi_names": ["Smith, John"],
      "fiscal_years": [2023],
      "org_states": ["MA"],
      "include_active_projects": true,
      "exclude_subprojects": true
    }
  }
}
```

## 📝 Next Steps

**Phase 2** will add 8 MEDIUM priority parameters:
- `po_names` - Program Officer search
- `org_names_exact_match` - Exact organization matching
- `org_cities`, `org_countries` - Additional geographic filters
- `funding_mechanism`, `dept_types` - Classification filters
- `cong_dists` - Congressional district analysis
- `organization_type` - Institution classification

See [AUDIT_REPORT.md](../AUDIT_REPORT.md) for complete roadmap.
