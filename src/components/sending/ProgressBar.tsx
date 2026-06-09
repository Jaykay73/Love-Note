// =========================================================================
// ProgressBar — Animated send progress indicator
//
// Displays green (sent) and red (failed) horizontal segments, a
// completion percentage, and a detailed count below the bar.
// =========================================================================

import React from 'react';

// -------------------------------------------------------------------------
// Props
// -------------------------------------------------------------------------

export interface ProgressBarProps {
  /** Number of emails successfully sent */
  sent: number;
  /** Number of emails that failed to send */
  failed: number;
  /** Total number of recipients */
  total: number;
}

// =========================================================================
// Component
// =========================================================================

const ProgressBar: React.FC<ProgressBarProps> = ({ sent, failed, total }) => {
  const completed = sent + failed;
  const percentComplete =
    total > 0 ? Math.round((completed / total) * 100) : 0;

  // Widths as percentages of the parent bar
  const sentPercent = total > 0 ? (sent / total) * 100 : 0;
  const failedPercent = total > 0 ? (failed / total) * 100 : 0;
  const remainingPercent = Math.max(0, 100 - sentPercent - failedPercent);

  return (
    <div className="w-full">
      {/* ---- Progress bar track ---- */}
      <div
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${percentComplete}% of emails sent`}
        className="flex h-5 w-full overflow-hidden rounded-full bg-gray-100 shadow-inner"
      >
        {/* Green (sent) segment */}
        {sent > 0 && (
          <div
            className="bg-emerald-400 transition-all duration-500 ease-out"
            style={{ width: `${sentPercent}%` }}
          />
        )}

        {/* Red (failed) segment — sits immediately after the green */}
        {failed > 0 && (
          <div
            className="bg-rose-400 transition-all duration-500 ease-out"
            style={{ width: `${failedPercent}%` }}
          />
        )}

        {/* Remaining / unprocessed segment */}
        {remainingPercent > 0 && (
          <div
            className="bg-gray-100 transition-all duration-500 ease-out"
            style={{ width: `${remainingPercent}%` }}
          />
        )}
      </div>

      {/* ---- Labels ---- */}
      <div className="mt-2 text-center">
        {total > 0 ? (
          <>
            <p className="text-sm font-bold text-gray-700">
              {percentComplete}% complete
            </p>
            <p className="text-sm text-gray-500">
              <span className="text-emerald-600 font-semibold">{sent}</span> of {total} sent
              {failed > 0 && (
                <span className="text-rose-500 font-semibold">, {failed} failed</span>
              )}
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-400">No recipients</p>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
