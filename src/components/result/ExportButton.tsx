// =========================================================================
// ExportButton — Download buttons for failed and unsent recipient lists
//
// Shows a "Download Failed List" button when there are failures and/or
// a "Download Unsent List" button when the send was cancelled with
// remaining recipients.
// =========================================================================

import React from 'react';
import type { SendResult, Recipient } from '../../types';
import {
  exportFailedRecipients,
  exportUnsentRecipients,
} from '../../utils/csvExport';
import Button from '../common/Button';

// -------------------------------------------------------------------------
// Props
// -------------------------------------------------------------------------

export interface ExportButtonProps {
  /** Results with status === 'failed' */
  failedResults: SendResult[];
  /** Recipients who were not sent to (either failed or skipped) */
  unsentRecipients: Recipient[];
}

// =========================================================================
// Component
// =========================================================================

const ExportButton: React.FC<ExportButtonProps> = ({
  failedResults,
  unsentRecipients,
}) => {
  const hasFailures = failedResults.length > 0;
  const hasUnsent = unsentRecipients.length > 0;

  // If there's nothing to export, render nothing
  if (!hasFailures && !hasUnsent) {
    return null;
  }

  // ---- Derive data for failed CSV ----------------------------------------

  const handleExportFailed = () => {
    const failedItems = failedResults.map((r) => ({
      email: r.recipient.email,
      first_name: r.recipient.first_name,
      last_name: r.recipient.last_name,
      error: r.error,
    }));
    exportFailedRecipients(failedItems);
  };

  // ---- Derive data for unsent CSV ----------------------------------------

  const handleExportUnsent = () => {
    exportUnsentRecipients(unsentRecipients);
  };

  // ---- Render ------------------------------------------------------------

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {hasFailures && (
        <Button
          variant="secondary"
          size="md"
          onClick={handleExportFailed}
        >
          {/* Download icon */}
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          Download Failed List (CSV)
        </Button>
      )}

      {hasUnsent && (
        <Button
          variant="secondary"
          size="md"
          onClick={handleExportUnsent}
        >
          {/* Download icon */}
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          Download Unsent List (CSV)
        </Button>
      )}
    </div>
  );
};

export default ExportButton;
