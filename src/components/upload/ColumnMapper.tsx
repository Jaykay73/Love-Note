// =========================================================================
// ColumnMapper — Column mapping UI with dropdown selectors and confidence
// indicators
//
// Renders three rows (Email, First Name, Last Name) each with:
// - A descriptive label (Email marked as required)
// - A <select> dropdown listing all available headers
// - A confidence badge (green "Detected" or yellow "Best guess") when a
//   column has been auto-detected
// =========================================================================

import type { ColumnDetection, ColumnMapping } from '../../types';
import Badge from '../common/Badge';

export interface ColumnMapperProps {
  /** The raw headers from the uploaded file */
  headers: string[];
  /** The auto-detection result from columnDetection */
  detection: ColumnDetection;
  /** The current column mapping */
  mapping: ColumnMapping;
  /** Called when the user changes any of the mapping dropdowns */
  onChange: (mapping: ColumnMapping) => void;
}

/**
 * Column mapping UI with dropdown selectors for each field.
 *
 * Pre-selects dropdown values based on the `mapping` prop and shows
 * confidence badges for auto-detected columns.
 */
export default function ColumnMapper({
  headers,
  detection,
  mapping,
  onChange,
}: ColumnMapperProps) {
  // -------------------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------------------

  /**
   * Renders a confidence badge for a field's auto-detection result.
   * Returns null if no column was detected (the user must pick manually).
   */
  function renderBadge(
    field: keyof ColumnDetection
  ): React.ReactNode {
    const detected = detection[field];
    if (!detected.column) return null;

    if (detected.confidence === 'high') {
      return (
        <Badge variant="success">
          <span className="flex items-center gap-1">
            <CheckIcon />
            Detected
          </span>
        </Badge>
      );
    }

    if (detected.confidence === 'medium') {
      return (
        <Badge variant="warning">
          <span className="flex items-center gap-1">
            <QuestionIcon />
            Best guess
          </span>
        </Badge>
      );
    }

    return null;
  }

  /**
   * Builds a <select> for a given field.
   */
  function renderSelect(field: 'emailColumn' | 'firstNameColumn' | 'lastNameColumn'): React.ReactNode {
    const value = mapping[field];
    const fieldId = `col-map-${field}`;

    return (
      <select
        id={fieldId}
        value={value}
        onChange={(e) => {
          onChange({ ...mapping, [field]: e.target.value });
        }}
        className="
          block w-full rounded-lg border border-gray-300 bg-white px-3 py-2
          text-sm text-gray-700 shadow-sm transition-colors
          focus:border-violet-500 focus:ring-2 focus:ring-violet-400 focus:outline-none
        "
      >
        <option value="">-- Select a column --</option>
        {headers.map((header) => (
          <option key={header} value={header}>
            {header}
          </option>
        ))}
      </select>
    );
  }

  // -------------------------------------------------------------------
  // Main render
  // -------------------------------------------------------------------

  return (
    <div className="space-y-4">
      {/* --- Email (required) --- */}
      <div className="flex flex-col sm:grid sm:grid-cols-[140px_1fr_auto] gap-2 sm:gap-3 sm:items-center">
        <label htmlFor="col-map-emailColumn" className="text-sm font-semibold text-violet-700">
          📧 Email address
          <span className="ml-1 text-rose-500" aria-label="required">
            *
          </span>
        </label>
        <div className="w-full">{renderSelect('emailColumn')}</div>
        <div className="flex items-center gap-2 sm:justify-start">
          {renderBadge('email')}
        </div>
      </div>

      {/* --- First Name (optional) --- */}
      <div className="flex flex-col sm:grid sm:grid-cols-[140px_1fr_auto] gap-2 sm:gap-3 sm:items-center">
        <label htmlFor="col-map-firstNameColumn" className="text-sm font-semibold text-violet-700">
          👤 First name
          <span className="ml-1 text-gray-400 text-xs font-normal">(optional)</span>
        </label>
        <div className="w-full">{renderSelect('firstNameColumn')}</div>
        <div className="flex items-center gap-2 sm:justify-start">
          {renderBadge('firstName')}
        </div>
      </div>

      {/* --- Last Name (optional) --- */}
      <div className="flex flex-col sm:grid sm:grid-cols-[140px_1fr_auto] gap-2 sm:gap-3 sm:items-center">
        <label htmlFor="col-map-lastNameColumn" className="text-sm font-semibold text-violet-700">
          👥 Last name
          <span className="ml-1 text-gray-400 text-xs font-normal">(optional)</span>
        </label>
        <div className="w-full">{renderSelect('lastNameColumn')}</div>
        <div className="flex items-center gap-2 sm:justify-start">
          {renderBadge('lastName')}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// Small inline SVG icons
// -------------------------------------------------------------------------

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function QuestionIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
      />
    </svg>
  );
}
