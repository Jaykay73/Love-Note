// =========================================================================
// ValidationWarnings — Displays validation results after parsing and
// mapping uploaded recipient data.
//
// Shows:
// - Green success banner when all rows are valid
// - Yellow/red warning with a breakdown of issues when invalid rows exist
// - Count badges for each type of issue
// =========================================================================

import type { RecipientValidation } from '../../types';
import Badge from '../common/Badge';

export interface ValidationWarningsProps {
  /** The validation result from validateRecipients */
  validation: RecipientValidation;
}

/**
 * Displays validation warnings for the uploaded recipient list.
 *
 * Provides clear, human-readable feedback about any issues found in the
 * parsed data (empty emails, invalid emails, duplicate emails).
 */
export default function ValidationWarnings({ validation }: ValidationWarningsProps) {
  // Count the different types of issues
  const emptyEmailCount = validation.invalid.filter((r) =>
    r.reasons.includes('empty-email')
  ).length;

  const invalidEmailCount = validation.invalid.filter((r) =>
    r.reasons.includes('invalid-email')
  ).length;

  const duplicateEmailCount = validation.invalid.filter((r) =>
    r.reasons.includes('duplicate-email')
  ).length;

  // -------------------------------------------------------------------
  // All valid — success banner
  // -------------------------------------------------------------------

  if (validation.invalid.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3" role="status" aria-live="polite">
        <CheckCircleIcon />
        <p className="text-sm font-medium text-green-800">
          All {validation.valid.length} {validation.valid.length === 1 ? 'recipient' : 'recipients'} look good!
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // Some rows invalid — warning banner
  // -------------------------------------------------------------------

  const totalInvalid = validation.invalid.length;

  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3" role="status" aria-live="polite">
      {/* --- Summary --- */}
      <div className="flex items-start gap-2">
        <WarningIcon />
        <div className="flex-1">
          <p className="text-sm font-medium text-yellow-800">
            We found {totalInvalid} {totalInvalid === 1 ? 'row' : 'rows'} with issues:
          </p>
        </div>
        <Badge variant="warning">{totalInvalid}</Badge>
      </div>

      {/* --- Breakdown --- */}
      <div className="mt-3 ml-6 flex flex-wrap gap-2">
        {emptyEmailCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800">
            {emptyEmailCount} empty {emptyEmailCount === 1 ? 'email' : 'emails'}
          </span>
        )}
        {invalidEmailCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800">
            {invalidEmailCount} invalid {invalidEmailCount === 1 ? 'email' : 'emails'}
          </span>
        )}
        {duplicateEmailCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800">
            {duplicateEmailCount} duplicate {duplicateEmailCount === 1 ? 'email' : 'emails'}
          </span>
        )}
      </div>

      {/* --- Action note --- */}
      <p className="mt-3 ml-6 text-xs text-yellow-700">
        These rows will be skipped when sending. The remaining{' '}
        <strong className="font-semibold">{validation.valid.length}</strong>{' '}
        valid {validation.valid.length === 1 ? 'recipient' : 'recipients'}{' '}
        will be included.
      </p>
    </div>
  );
}

// -------------------------------------------------------------------------
// Inline SVG icons
// -------------------------------------------------------------------------

function CheckCircleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0 text-green-500"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0 text-yellow-500"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
      />
    </svg>
  );
}
