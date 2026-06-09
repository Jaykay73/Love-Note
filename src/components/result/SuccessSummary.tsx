// =========================================================================
// SuccessSummary — Final send outcome summary
//
// Shows a large icon (green checkmark, yellow warning, or red X) and a
// brief message depending on whether all, some, or no emails were sent.
// =========================================================================

import React from 'react';

// -------------------------------------------------------------------------
// Props
// -------------------------------------------------------------------------

export interface SuccessSummaryProps {
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

const SuccessSummary: React.FC<SuccessSummaryProps> = ({
  sent,
  failed,
  total,
}) => {
  // ---- Derive outcome ----------------------------------------------------

  const allSent = failed === 0 && sent === total && total > 0;
  const someSent = sent > 0 && failed > 0;
  const noneSent = sent === 0 && total > 0;
  const noRecipients = total === 0;

  // ---- Icon & message ----------------------------------------------------

  let icon: React.ReactNode;
  let title: string;
  let description: string;

  if (noRecipients) {
    icon = (
      <svg
        className="h-14 w-14 text-gray-300"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
        />
      </svg>
    );
    title = 'No recipients';
    description = 'There were no recipients to send to.';
  } else if (allSent) {
    icon = (
      <svg
        className="h-14 w-14 text-green-500"
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
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
    title = 'All emails sent!';
    description = `All ${total} email${total !== 1 ? 's' : ''} delivered successfully.`;
  } else if (someSent) {
    icon = (
      <svg
        className="h-14 w-14 text-yellow-500"
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
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
    );
    title = 'Almost there!';
    description = `${sent} sent, ${failed} failed. Some emails couldn't be delivered.`;
  } else if (noneSent) {
    icon = (
      <svg
        className="h-14 w-14 text-red-500"
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
          d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
    title = 'Something went wrong';
    description =
      failed === 1
        ? '1 email could not be sent.'
        : `${failed} emails could not be sent.`;
  } else {
    // Fallback
    icon = null;
    title = 'Send complete';
    description = `${sent} sent, ${failed} failed.`;
  }

  // ---- Count line --------------------------------------------------------

  const countLine =
    total > 0
      ? `${sent.toLocaleString()} email${sent !== 1 ? 's' : ''} sent successfully`
      : '';

  // ---- Render ------------------------------------------------------------

  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      {icon}

      <div>
        <h2
          className={`text-xl font-bold ${
            allSent
              ? 'text-green-800'
              : someSent
                ? 'text-yellow-800'
                : noneSent
                  ? 'text-red-800'
                  : 'text-gray-600'
          }`}
        >
          {title}
        </h2>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
        {total > 0 && (
          <p className="text-sm font-medium text-gray-700 mt-2">{countLine}</p>
        )}
      </div>
    </div>
  );
};

export default SuccessSummary;
