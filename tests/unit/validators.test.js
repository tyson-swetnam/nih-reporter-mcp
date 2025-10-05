/**
 * Unit tests for validation utilities
 */
import { describe, it, expect } from '@jest/globals';
import {
  validateDateFormat,
  validateDateRange,
  validateStateCode,
  validateStateCodes,
  validateCovidCategory,
  validateCovidCategories,
  validateApplicationIds,
  validatePIProfileIds,
  validateSpendingCategories,
  validateOpportunityNumbers,
} from '../../src/utils/validators.js';

describe('Validators', () => {
  describe('validateDateFormat', () => {
    it('should validate correct date format', () => {
      expect(validateDateFormat('2023-01-15').valid).toBe(true);
      expect(validateDateFormat('2024-12-31').valid).toBe(true);
    });

    it('should reject invalid date formats', () => {
      expect(validateDateFormat('2023/01/15').valid).toBe(false);
      expect(validateDateFormat('01-15-2023').valid).toBe(false);
      expect(validateDateFormat('2023-1-5').valid).toBe(false);
    });

    it('should reject invalid dates', () => {
      expect(validateDateFormat('2023-13-01').valid).toBe(false); // Invalid month
      expect(validateDateFormat('2023-02-30').valid).toBe(false); // Invalid day
      expect(validateDateFormat('2023-00-15').valid).toBe(false); // Invalid month
    });

    it('should handle leap years correctly', () => {
      expect(validateDateFormat('2024-02-29').valid).toBe(true); // Leap year
      expect(validateDateFormat('2023-02-29').valid).toBe(false); // Not leap year
    });
  });

  describe('validateDateRange', () => {
    it('should validate correct date ranges', () => {
      const result = validateDateRange({
        from_date: '2023-01-01',
        to_date: '2023-12-31',
      });
      expect(result.valid).toBe(true);
    });

    it('should accept single-ended ranges', () => {
      expect(validateDateRange({ from_date: '2023-01-01' }).valid).toBe(true);
      expect(validateDateRange({ to_date: '2023-12-31' }).valid).toBe(true);
    });

    it('should reject from_date after to_date', () => {
      const result = validateDateRange({
        from_date: '2023-12-31',
        to_date: '2023-01-01',
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('before or equal');
    });

    it('should reject invalid date formats in range', () => {
      const result = validateDateRange({
        from_date: '2023/01/01',
        to_date: '2023-12-31',
      });
      expect(result.valid).toBe(false);
    });
  });

  describe('validateStateCode', () => {
    it('should validate correct state codes', () => {
      expect(validateStateCode('CA').valid).toBe(true);
      expect(validateStateCode('NY').valid).toBe(true);
      expect(validateStateCode('DC').valid).toBe(true);
    });

    it('should accept lowercase and convert', () => {
      expect(validateStateCode('ca').valid).toBe(true);
      expect(validateStateCode('ny').valid).toBe(true);
    });

    it('should validate territories', () => {
      expect(validateStateCode('PR').valid).toBe(true); // Puerto Rico
      expect(validateStateCode('GU').valid).toBe(true); // Guam
      expect(validateStateCode('VI').valid).toBe(true); // Virgin Islands
    });

    it('should validate military codes', () => {
      expect(validateStateCode('AA').valid).toBe(true);
      expect(validateStateCode('AE').valid).toBe(true);
      expect(validateStateCode('AP').valid).toBe(true);
    });

    it('should reject invalid state codes', () => {
      expect(validateStateCode('XX').valid).toBe(false);
      expect(validateStateCode('ZZ').valid).toBe(false);
    });
  });

  describe('validateStateCodes', () => {
    it('should validate array of state codes', () => {
      const result = validateStateCodes(['CA', 'NY', 'TX']);
      expect(result.valid).toBe(true);
    });

    it('should reject array with invalid codes', () => {
      const result = validateStateCodes(['CA', 'XX', 'NY']);
      expect(result.valid).toBe(false);
      expect(result.invalidCodes).toContain('XX');
    });

    it('should reject empty array', () => {
      expect(validateStateCodes([]).valid).toBe(false);
    });
  });

  describe('validateCovidCategory', () => {
    it('should validate correct COVID categories', () => {
      expect(validateCovidCategory('Reg-CV').valid).toBe(true);
      expect(validateCovidCategory('C3').valid).toBe(true);
      expect(validateCovidCategory('C6').valid).toBe(true);
    });

    it('should reject invalid COVID categories', () => {
      expect(validateCovidCategory('C1').valid).toBe(false);
      expect(validateCovidCategory('COVID').valid).toBe(false);
    });
  });

  describe('validateCovidCategories', () => {
    it('should validate array of COVID categories', () => {
      const result = validateCovidCategories(['Reg-CV', 'C3', 'C4']);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid categories', () => {
      const result = validateCovidCategories(['Reg-CV', 'C1', 'C3']);
      expect(result.valid).toBe(false);
      expect(result.invalidCategories).toContain('C1');
    });

    it('should reject empty array', () => {
      expect(validateCovidCategories([]).valid).toBe(false);
    });
  });

  describe('validateApplicationIds', () => {
    it('should validate correct application IDs', () => {
      const result = validateApplicationIds([10001234, 10005678]);
      expect(result.valid).toBe(true);
    });

    it('should reject non-integer IDs', () => {
      expect(validateApplicationIds([10001234, 10.5]).valid).toBe(false);
    });

    it('should reject negative IDs', () => {
      expect(validateApplicationIds([10001234, -123]).valid).toBe(false);
    });

    it('should reject empty array', () => {
      expect(validateApplicationIds([]).valid).toBe(false);
    });
  });

  describe('validatePIProfileIds', () => {
    it('should validate correct PI profile IDs', () => {
      const result = validatePIProfileIds([0, 1, 12345]);
      expect(result.valid).toBe(true);
    });

    it('should accept zero as valid ID', () => {
      const result = validatePIProfileIds([0]);
      expect(result.valid).toBe(true);
    });

    it('should reject non-integer IDs', () => {
      expect(validatePIProfileIds([1, 2.5]).valid).toBe(false);
    });

    it('should reject negative IDs', () => {
      expect(validatePIProfileIds([1, -5]).valid).toBe(false);
    });

    it('should reject empty array', () => {
      expect(validatePIProfileIds([]).valid).toBe(false);
    });
  });

  describe('validateSpendingCategories', () => {
    it('should validate correct spending categories', () => {
      const result = validateSpendingCategories({ values: [27, 92], match_all: false });
      expect(result.valid).toBe(true);
    });

    it('should accept categories without match_all', () => {
      const result = validateSpendingCategories({ values: [27, 92] });
      expect(result.valid).toBe(true);
    });

    it('should reject non-array values', () => {
      expect(validateSpendingCategories({ values: 27 }).valid).toBe(false);
    });

    it('should reject empty values array', () => {
      expect(validateSpendingCategories({ values: [] }).valid).toBe(false);
    });

    it('should reject negative category IDs', () => {
      expect(validateSpendingCategories({ values: [27, -5] }).valid).toBe(false);
    });

    it('should reject non-boolean match_all', () => {
      expect(validateSpendingCategories({ values: [27], match_all: 'true' }).valid).toBe(false);
    });
  });

  describe('validateOpportunityNumbers', () => {
    it('should validate correct opportunity numbers', () => {
      const result = validateOpportunityNumbers(['RFA-DA-18-020', 'PAR-18-218']);
      expect(result.valid).toBe(true);
    });

    it('should reject non-string values', () => {
      expect(validateOpportunityNumbers(['RFA-DA-18-020', 123]).valid).toBe(false);
    });

    it('should reject empty strings', () => {
      expect(validateOpportunityNumbers(['RFA-DA-18-020', '  ']).valid).toBe(false);
    });

    it('should reject empty array', () => {
      expect(validateOpportunityNumbers([]).valid).toBe(false);
    });
  });
});
