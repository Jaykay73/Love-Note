// =========================================================================
// DataPreviewTable — Scrollable table showing the first 5 rows of parsed
// data, using the current column mapping to extract Email, First Name, and
// Last Name values.
//
// - Sticky header row
// - Shows up to 5 rows
// - Empty state message when no rows exist
// =========================================================================

import type { ColumnMapping } from '../../types';

export interface DataPreviewTableProps {
  /** The raw headers from the uploaded file */
  headers: string[];
  /** The parsed data rows */
  rows: Record<string, string>[];
  /** The current column mapping used to extract display values */
  mapping: ColumnMapping;
}

const PREVIEW_LIMIT = 5;

/**
 * A compact scrollable data preview table.
 *
 * Renders the first 5 data rows using the current column mapping to extract
 * Email, First Name, and Last Name columns. Headers are sticky.
 */
export default function DataPreviewTable({
  rows,
  mapping,
}: DataPreviewTableProps) {
  // -------------------------------------------------------------------
  // Empty state
  // -------------------------------------------------------------------

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-teal-200 bg-teal-50/30 px-4 py-8 text-center">
        <p className="text-sm text-teal-500 font-medium">No data rows found in file</p>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // Determine which columns to show in the preview
  // -------------------------------------------------------------------

  const previewRows = rows.slice(0, PREVIEW_LIMIT);

  const displayedColumns = [
    { label: 'Email', key: mapping.emailColumn },
    { label: 'First Name', key: mapping.firstNameColumn },
    { label: 'Last Name', key: mapping.lastNameColumn },
  ] as const;

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <div className="max-h-72 overflow-x-auto overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          {/* --- Sticky header --- */}
          <thead className="sticky top-0 z-10 bg-gray-100">
            <tr>
              <th
                scope="col"
                className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
              >
                #
              </th>
              {displayedColumns.map((col) => (
                <th
                  key={col.label}
                  scope="col"
                  className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* --- Body --- */}
          <tbody className="divide-y divide-gray-100 bg-white">
            {previewRows.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="whitespace-nowrap px-4 py-2.5 text-gray-400">
                  {idx + 1}
                </td>
                {displayedColumns.map((col) => (
                  <td
                    key={col.label}
                    className="max-w-[200px] truncate whitespace-nowrap px-4 py-2.5 text-gray-700"
                    title={col.key ? row[col.key] ?? '' : ''}
                  >
                    {col.key ? row[col.key] || <EmptyValue /> : <EmptyValue />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Row count note --- */}
      {rows.length > PREVIEW_LIMIT && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500">
          Showing {PREVIEW_LIMIT} of {rows.length} rows
        </div>
      )}

      {rows.length <= PREVIEW_LIMIT && rows.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500">
          {rows.length} {rows.length === 1 ? 'row' : 'rows'}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------------------
// Empty value indicator
// -------------------------------------------------------------------------

function EmptyValue() {
  return (
    <span className="italic text-gray-300" aria-label="empty">
      —-
    </span>
  );
}
