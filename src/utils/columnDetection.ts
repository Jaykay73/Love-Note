import type { ColumnDetection as ColumnDetectionResult } from '../types';

const EMAIL_KEYWORDS = ['email', 'e-mail', 'mail', 'email address'];
const FIRST_NAME_KEYWORDS = ['first', 'first name', 'given', 'given name', 'fname', 'forename', 'firstname'];
const LAST_NAME_KEYWORDS = ['last', 'last name', 'surname', 'family name', 'lname', 'sn', 'lastname'];

type FieldType = 'email' | 'firstName' | 'lastName';

/**
 * Returns the keyword list for a given field type.
 */
function getKeywords(field: FieldType): string[] {
  switch (field) {
    case 'email':
      return EMAIL_KEYWORDS;
    case 'firstName':
      return FIRST_NAME_KEYWORDS;
    case 'lastName':
      return LAST_NAME_KEYWORDS;
  }
}

/**
 * Attempts to match a single header against a field's keyword list.
 * Returns the matched column name and confidence level.
 */
function matchHeader(
  header: string,
  field: FieldType
): { column: string | null; confidence: 'high' | 'medium' | 'low' } {
  const lowerHeader = header.toLowerCase().trim();
  const keywords = getKeywords(field);

  // Exact match → high confidence
  if (keywords.includes(lowerHeader)) {
    return { column: header, confidence: 'high' };
  }

  // Substring match → medium confidence
  if (keywords.some((keyword) => lowerHeader.includes(keyword) || keyword.includes(lowerHeader))) {
    return { column: header, confidence: 'medium' };
  }

  return { column: null, confidence: 'low' };
}

/**
 * Scans the provided headers and auto-detects which columns correspond to
 * email, first name, and last name fields.
 *
 * Priority: exact matches first, then substring matches.
 */
export function detectColumns(headers: string[]): ColumnDetectionResult {
  const result: ColumnDetectionResult = {
    email: { column: null, confidence: 'low' },
    firstName: { column: null, confidence: 'low' },
    lastName: { column: null, confidence: 'low' },
  };

  if (headers.length === 0) {
    return result;
  }

  const fields: FieldType[] = ['email', 'firstName', 'lastName'];

  // First pass: look for exact matches only
  const usedColumns = new Set<string>();

  for (const field of fields) {
    for (const header of headers) {
      if (usedColumns.has(header)) continue;

      const { column, confidence } = matchHeader(header, field);
      if (confidence === 'high' && column !== null) {
        if (field === 'email') result.email = { column, confidence: 'high' };
        if (field === 'firstName') result.firstName = { column, confidence: 'high' };
        if (field === 'lastName') result.lastName = { column, confidence: 'high' };
        usedColumns.add(header);
        break;
      }
    }
  }

  // Second pass: fill remaining with medium confidence matches
  for (const field of fields) {
    const current = field === 'email' ? result.email : field === 'firstName' ? result.firstName : result.lastName;
    if (current.confidence === 'high') continue;

    for (const header of headers) {
      if (usedColumns.has(header)) continue;

      const { column, confidence } = matchHeader(header, field);
      if (confidence === 'medium' && column !== null) {
        if (field === 'email') result.email = { column, confidence: 'medium' };
        if (field === 'firstName') result.firstName = { column, confidence: 'medium' };
        if (field === 'lastName') result.lastName = { column, confidence: 'medium' };
        usedColumns.add(header);
        break;
      }
    }
  }

  return result;
}
