import type { Recipient, InvalidRow, RecipientValidation, ColumnMapping } from '../types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates whether a string is a syntactically valid email address.
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Validates an array of parsed rows against a column mapping.
 * Extracts email/first_name/last_name per the mapping, trims values,
 * computes full_name, and tracks duplicates.
 *
 * Rows with empty or invalid emails are returned as invalid.
 * When a row has an empty first_name (or the column is absent/missing),
 * the entire email prefix (the part before @) is used as fallback.
 */
export function validateRecipients(
  rows: Record<string, string>[],
  mapping: ColumnMapping
): RecipientValidation {
  const seenEmails = new Map<string, number>();
  const valid: Recipient[] = [];
  const invalid: InvalidRow[] = [];
  let duplicateCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i];
    const rowIndex = i;

    // Extract values per mapping, trimming whitespace
    const email = (raw[mapping.emailColumn] ?? '').trim();
    const first_name = (raw[mapping.firstNameColumn] ?? '').trim();
    const last_name = (raw[mapping.lastNameColumn] ?? '').trim();
    const reasons: Array<'empty-email' | 'invalid-email' | 'duplicate-email'> = [];

    // Check for empty email
    if (!email) {
      reasons.push('empty-email');
    }

    // Check for invalid email format (non-empty only)
    if (email && !isValidEmail(email)) {
      reasons.push('invalid-email');
    }

    if (reasons.length > 0) {
      invalid.push({ rowIndex, raw, reasons });
      skippedCount++;
      continue;
    }

    // Check for duplicates (email addresses are case-insensitive per RFC 5321)
    if (seenEmails.has(email.toLowerCase())) {
      reasons.push('duplicate-email');
      invalid.push({ rowIndex, raw, reasons });
      duplicateCount++;
      skippedCount++;
      continue;
    }

    seenEmails.set(email.toLowerCase(), rowIndex);

    // Build full name, falling back to email local-part if first name is empty
    const displayFirstName = first_name || email.split('@')[0] || email;
    const full_name = [displayFirstName, last_name].filter(Boolean).join(' ');

    valid.push({
      email,
      first_name: displayFirstName,
      last_name,
      full_name,
      rowIndex,
    });
  }

  return {
    valid,
    invalid,
    duplicateCount,
    skippedCount,
  };
}
