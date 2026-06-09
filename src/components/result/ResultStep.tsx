// =========================================================================
// ResultStep — Orchestrator for the result / summary screen
//
// Displays the final outcome after a send completes or is cancelled:
//  1. SuccessSummary        — icon + message based on success rate
//  2. FailureList           — expandable table of failed recipients
//  3. ExportButton          — download failed / unsent CSV lists
//  4. SendAnotherButton     — reset and start a new batch
// =========================================================================

import React, { useCallback } from 'react';
import { useSendFlow } from '../../hooks/useSendFlow';
import { useWizard } from '../../hooks/useWizard';
import SuccessSummary from './SuccessSummary';
import FailureList from './FailureList';
import ExportButton from './ExportButton';
import SendAnotherButton from './SendAnotherButton';

// =========================================================================
// Component
// =========================================================================

const ResultStep: React.FC = () => {
  const { state: sendFlowState, dispatch: sendFlowDispatch } = useSendFlow();
  const wizard = useWizard();

  const { sendResults, recipients } = sendFlowState;

  // ---- Derive computed values --------------------------------------------

  const failedResults = sendResults.filter((r) => r.status === 'failed');

  // Recipients whose email does not appear in any result are "unsent".
  const processedEmails = new Set(
    sendResults.map((r) => r.recipient.email),
  );
  const unsentRecipients = recipients.filter(
    (r) => !processedEmails.has(r.email),
  );

  // Counts derived from the results array (more reliable than progress
  // state when there may be syncing delays).
  const sentCount = sendResults.filter((r) => r.status === 'sent').length;
  const failedCount = failedResults.length;
  const totalCount = recipients.length;

  // ---- Handlers -----------------------------------------------------------

  const handleSendAnother = useCallback(() => {
    // Reset send flow state entirely
    sendFlowDispatch({ type: 'RESET' });
    // Navigate back to the first wizard step
    wizard.reset();
  }, [sendFlowDispatch, wizard]);

  // ---- Edge-case: no results and no recipients ---------------------------

  // Guard for an unexpected empty state (shouldn't normally reach here
  // without any data, but handle gracefully).
  const hasNoData = sendResults.length === 0 && recipients.length === 0;

  // ---- Render ------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* ---- Summary at top ---- */}
      <SuccessSummary
        sent={sentCount}
        failed={failedCount}
        total={totalCount}
      />

      {/* ---- Empty state guard ---- */}
      {hasNoData && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-rose-200 bg-rose-50/30 p-10 text-center">
          <svg
            className="h-10 w-10 text-rose-300 mb-3"
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
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
            />
          </svg>
          <p className="text-sm text-rose-400 font-medium">
            No send data available.
          </p>
        </div>
      )}

      {/* ---- Failure list (only when there are failures) ---- */}
      {failedCount > 0 && <FailureList failedResults={failedResults} />}

      {/* ---- Export buttons (failures or unsent recipients exist) ---- */}
      {(failedCount > 0 || unsentRecipients.length > 0) && (
        <ExportButton
          failedResults={failedResults}
          unsentRecipients={unsentRecipients}
        />
      )}

      {/* ---- Send another batch ---- */}
      <SendAnotherButton onClick={handleSendAnother} />
    </div>
  );
};

export default ResultStep;
