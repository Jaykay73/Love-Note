import { describe, it, expect } from 'vitest';
import { isValidEmail, validateRecipients } from '../validators';
import type { ColumnMapping } from '../../types';

describe('isValidEmail', () => {
  it('passes valid email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user+tag@domain.co')).toBe(true);
    expect(isValidEmail('ademidara.o@cacsaunilorin.org')).toBe(true);
    expect(isValidEmail('a@b.co')).toBe(true);
  });

  it('fails invalid email addresses', () => {
    expect(isValidEmail('missing-at')).toBe(false);
    expect(isValidEmail('has spaces@test.com')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('user@.com')).toBe(false);
  });
});

describe('validateRecipients', () => {
  const mapping: ColumnMapping = {
    emailColumn: 'Email',
    firstNameColumn: 'First Name',
    lastNameColumn: 'Last Name',
  };

  it('returns valid rows when all data is correct', () => {
    const rows = [
      { Email: 'ademidara@test.com', 'First Name': 'Ademidara', 'Last Name': 'Oluwaseun' },
      { Email: 'oluwapelumi@test.com', 'First Name': 'Oluwapelumi', 'Last Name': 'Adebayo' },
    ];
    const result = validateRecipients(rows, mapping);
    expect(result.valid).toHaveLength(2);
    expect(result.invalid).toHaveLength(0);
    expect(result.skippedCount).toBe(0);
    expect(result.duplicateCount).toBe(0);
    expect(result.valid[0].email).toBe('ademidara@test.com');
    expect(result.valid[0].full_name).toBe('Ademidara Oluwaseun');
  });

  it('flags empty email rows as invalid with empty-email reason', () => {
    const rows = [{ Email: '', 'First Name': 'No', 'Last Name': 'Email' }];
    const result = validateRecipients(rows, mapping);
    expect(result.valid).toHaveLength(0);
    expect(result.invalid).toHaveLength(1);
    expect(result.invalid[0].reasons).toContain('empty-email');
    expect(result.skippedCount).toBe(1);
  });

  it('flags invalid email format as invalid-email', () => {
    const rows = [{ Email: 'not-an-email', 'First Name': 'Bad', 'Last Name': 'Email' }];
    const result = validateRecipients(rows, mapping);
    expect(result.invalid).toHaveLength(1);
    expect(result.invalid[0].reasons).toContain('invalid-email');
  });

  it('detects duplicate emails case-insensitively', () => {
    const rows = [
      { Email: 'dupe@test.com', 'First Name': 'First', 'Last Name': 'One' },
      { Email: 'DUPE@test.com', 'First Name': 'Second', 'Last Name': 'Two' },
    ];
    const result = validateRecipients(rows, mapping);
    expect(result.valid).toHaveLength(1);
    expect(result.invalid).toHaveLength(1);
    expect(result.invalid[0].reasons).toContain('duplicate-email');
    expect(result.duplicateCount).toBe(1);
  });

  it('trims whitespace from values', () => {
    const rows = [
      { Email: '  trim@test.com  ', 'First Name': '  Trimmed  ', 'Last Name': '  Value  ' },
    ];
    const result = validateRecipients(rows, mapping);
    expect(result.valid).toHaveLength(1);
    expect(result.valid[0].email).toBe('trim@test.com');
    expect(result.valid[0].first_name).toBe('Trimmed');
    expect(result.valid[0].last_name).toBe('Value');
  });

  it('handles mixed valid and invalid rows in the same dataset', () => {
    const rows = [
      { Email: 'good@test.com', 'First Name': 'Good', 'Last Name': 'One' },
      { Email: 'bad', 'First Name': 'Bad', 'Last Name': 'Two' },
      { Email: '', 'First Name': 'Empty', 'Last Name': 'Three' },
      { Email: 'good2@test.com', 'First Name': 'Good', 'Last Name': 'Two' },
    ];
    const result = validateRecipients(rows, mapping);
    expect(result.valid).toHaveLength(2);
    expect(result.invalid).toHaveLength(2);
    expect(result.skippedCount).toBe(2);
  });

  it('computes full_name correctly from first and last names', () => {
    const rows = [
      { Email: 'full@test.com', 'First Name': 'Ademidara', 'Last Name': 'Oluwaseun' },
    ];
    const result = validateRecipients(rows, mapping);
    expect(result.valid[0].full_name).toBe('Ademidara Oluwaseun');
  });

  it('returns empty invalid array when all rows are valid', () => {
    const rows = [
      { Email: 'a@test.com', 'First Name': 'A', 'Last Name': 'B' },
      { Email: 'b@test.com', 'First Name': 'C', 'Last Name': 'D' },
    ];
    const result = validateRecipients(rows, mapping);
    expect(result.invalid).toEqual([]);
  });

  it('returns empty result for empty rows array', () => {
    const result = validateRecipients([], mapping);
    expect(result.valid).toEqual([]);
    expect(result.invalid).toEqual([]);
    expect(result.skippedCount).toBe(0);
    expect(result.duplicateCount).toBe(0);
  });

  it('falls back to email local-part when first_name is empty', () => {
    const rows = [{ Email: 'oluwapelumi.a@test.com', 'First Name': '', 'Last Name': 'Adebayo' }];
    const result = validateRecipients(rows, mapping);
    expect(result.valid[0].first_name).toBe('oluwapelumi.a');
    expect(result.valid[0].full_name).toBe('oluwapelumi.a Adebayo');
  });
});
