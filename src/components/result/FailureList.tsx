// =========================================================================
// FailureList — Expandable list of failed recipients
//
// Shows a collapsible section with a table of failed emails, each row
// displaying the recipient's email, name, and a user-friendly error
// reason.
// =========================================================================

import React, { useState, useCallback } from 'react';
import type { SendResult } from '../../types';
import Card from '../common/Card';

// -------------------------------------------------------------------------
// Props
// -------------------------------------------------------------------------

export interface FailureListProps {
  /** Results that have status === 'failed' */
  failedResults: SendResult[];
}

// -------------------------------------------------------------------------
// Error message mapping
// -------------------------------------------------------------------------

const ERROR_MESSAGE_MAP: Record<string, string> = {
  'rate-limit': 'Gmail rate limit reached',
  permanent: 'Email was rejected',
  'auth-expired': 'Session expired',
  network: 'Network error',
  'quota-exceeded': 'Daily sending limit reached',
};

function userFriendlyError(errorType?: string, fallback?: string): string {
  if (errorType && ERROR_MESSAGE_MAP[errorType]) {
    return ERROR_MESSAGE_MAP[errorType];
  }
  return fallback || 'Unknown error';
}

// =========================================================================
// Component
// =========================================================================

const FailureList: React.FC<FailureListProps> = ({ failedResults }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  // Empty state: don't render anything
  if (failedResults.length === 0) {
    return null;
  }

  return (
    <Card padding="md" className="border-red-100">
      <div className="space-y-2">
        {/* ---- Collapsible header ---- */}
        <button
          type="button"
          onClick={toggleExpanded}
          className="flex w-full items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 rounded-lg px-1"
          aria-expanded={isExpanded}
          aria-controls="failure-list-content"
        >
          <span className="text-sm font-medium text-red-700">
            View failed emails ({failedResults.length})
          </span>

          {/* Chevron icon */}
          <svg
            className={`h-5 w-5 text-red-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </button>

        {/* ---- Expandable table ---- */}
        {isExpanded && (
          <div id="failure-list-content" className="overflow-x-auto pt-1">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 pr-4 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                    Email
                  </th>
                  <th className="py-2 pr-4 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                    Name
                  </th>
                  <th className="py-2 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                    Error Reason
                  </th>
                </tr>
              </thead>
              <tbody>
                {failedResults.map((result, idx) => (
                  <tr
                    key={`${result.recipient.email}-${idx}`}
                    className="border-b border-gray-100 last:border-b-0"
                  >
                    <td className="py-2.5 pr-4 text-gray-800 max-w-[200px] truncate" title={result.recipient.email}>
                      {result.recipient.email}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-600">
                      {result.recipient.full_name || '—'}
                    </td>
                    <td className="py-2.5 text-red-600">
                      {userFriendlyError(
                        result.errorType,
                        result.error,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
};

export default FailureList;
