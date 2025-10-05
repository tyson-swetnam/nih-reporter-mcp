/**
 * Validation Utilities
 *
 * Provides validation functions for NIH API parameters
 */

/**
 * US State codes (includes DC, territories, and military codes)
 */
export const US_STATE_CODES = new Set([
  // 50 States
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  // District of Columbia
  'DC',
  // Territories
  'AS', 'GU', 'MP', 'PR', 'VI', 'UM',
  // Military/Federal
  'AA', 'AE', 'AP',
]);

/**
 * COVID-19 response categories from NIH
 */
export const COVID_RESPONSE_CATEGORIES = new Set([
  'Reg-CV',  // Regular COVID response
  'C3',      // CARES Act
  'C4',      // Paycheck Protection Program
  'C5',      // Coronavirus Preparedness and Response Supplemental Appropriations Act
  'C6',      // American Rescue Plan Act
]);

/**
 * Validate date string format (YYYY-MM-DD)
 *
 * @param {string} dateStr - Date string to validate
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateDateFormat(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    return { valid: false, error: 'Date must be a string' };
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(dateStr)) {
    return {
      valid: false,
      error: 'Date must be in YYYY-MM-DD format',
    };
  }

  // Validate actual date
  const [year, month, day] = dateStr.split('-').map(Number);

  if (year < 1900 || year > 2100) {
    return { valid: false, error: 'Year must be between 1900 and 2100' };
  }

  if (month < 1 || month > 12) {
    return { valid: false, error: 'Month must be between 01 and 12' };
  }

  if (day < 1 || day > 31) {
    return { valid: false, error: 'Day must be between 01 and 31' };
  }

  // Validate day for specific month
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) {
    return {
      valid: false,
      error: `Day ${day} is invalid for month ${month}`,
    };
  }

  return { valid: true };
}

/**
 * Validate date range
 *
 * @param {Object} dateRange - Date range object with from_date and to_date
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateDateRange(dateRange) {
  if (!dateRange || typeof dateRange !== 'object') {
    return { valid: false, error: 'Date range must be an object' };
  }

  const { from_date, to_date } = dateRange;

  if (!from_date && !to_date) {
    return { valid: false, error: 'Date range must have from_date or to_date' };
  }

  if (from_date) {
    const fromValid = validateDateFormat(from_date);
    if (!fromValid.valid) {
      return { valid: false, error: `from_date: ${fromValid.error}` };
    }
  }

  if (to_date) {
    const toValid = validateDateFormat(to_date);
    if (!toValid.valid) {
      return { valid: false, error: `to_date: ${toValid.error}` };
    }
  }

  // Validate from_date <= to_date
  if (from_date && to_date) {
    const fromTime = new Date(from_date).getTime();
    const toTime = new Date(to_date).getTime();

    if (fromTime > toTime) {
      return {
        valid: false,
        error: 'from_date must be before or equal to to_date',
      };
    }
  }

  return { valid: true };
}

/**
 * Validate US state code
 *
 * @param {string} stateCode - State code to validate
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateStateCode(stateCode) {
  if (!stateCode || typeof stateCode !== 'string') {
    return { valid: false, error: 'State code must be a string' };
  }

  const upperCode = stateCode.toUpperCase();

  if (!US_STATE_CODES.has(upperCode)) {
    return {
      valid: false,
      error: `Invalid state code: ${stateCode}. Must be a valid US state, DC, territory, or military code`,
    };
  }

  return { valid: true };
}

/**
 * Validate array of state codes
 *
 * @param {Array<string>} stateCodes - Array of state codes
 * @returns {Object} { valid: boolean, error?: string, invalidCodes?: Array }
 */
export function validateStateCodes(stateCodes) {
  if (!Array.isArray(stateCodes)) {
    return { valid: false, error: 'State codes must be an array' };
  }

  if (stateCodes.length === 0) {
    return { valid: false, error: 'State codes array cannot be empty' };
  }

  const invalidCodes = [];

  for (const code of stateCodes) {
    const result = validateStateCode(code);
    if (!result.valid) {
      invalidCodes.push(code);
    }
  }

  if (invalidCodes.length > 0) {
    return {
      valid: false,
      error: `Invalid state codes: ${invalidCodes.join(', ')}`,
      invalidCodes,
    };
  }

  return { valid: true };
}

/**
 * Validate COVID response category
 *
 * @param {string} category - COVID response category
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateCovidCategory(category) {
  if (!category || typeof category !== 'string') {
    return { valid: false, error: 'COVID category must be a string' };
  }

  if (!COVID_RESPONSE_CATEGORIES.has(category)) {
    return {
      valid: false,
      error: `Invalid COVID category: ${category}. Valid categories: ${Array.from(COVID_RESPONSE_CATEGORIES).join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Validate array of COVID response categories
 *
 * @param {Array<string>} categories - Array of COVID categories
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateCovidCategories(categories) {
  if (!Array.isArray(categories)) {
    return { valid: false, error: 'COVID categories must be an array' };
  }

  if (categories.length === 0) {
    return { valid: false, error: 'COVID categories array cannot be empty' };
  }

  const invalidCategories = [];

  for (const cat of categories) {
    const result = validateCovidCategory(cat);
    if (!result.valid) {
      invalidCategories.push(cat);
    }
  }

  if (invalidCategories.length > 0) {
    return {
      valid: false,
      error: `Invalid COVID categories: ${invalidCategories.join(', ')}. Valid categories: ${Array.from(COVID_RESPONSE_CATEGORIES).join(', ')}`,
      invalidCategories,
    };
  }

  return { valid: true };
}

/**
 * Validate application IDs
 *
 * @param {Array<number>} applIds - Array of application IDs
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateApplicationIds(applIds) {
  if (!Array.isArray(applIds)) {
    return { valid: false, error: 'Application IDs must be an array' };
  }

  if (applIds.length === 0) {
    return { valid: false, error: 'Application IDs array cannot be empty' };
  }

  for (const id of applIds) {
    if (!Number.isInteger(id) || id <= 0) {
      return {
        valid: false,
        error: `Invalid application ID: ${id}. Must be a positive integer`,
      };
    }
  }

  return { valid: true };
}
