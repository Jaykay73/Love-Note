import React, { useState } from 'react';
import { useSendFlow } from '../../hooks/useSendFlow';
import { useAuth } from '../../hooks/useAuth';
import { useWizard } from '../../hooks/useWizard';
import PreviewCard from './PreviewCard';
import SendChecklist from './SendChecklist';
import NavigationButtons from '../layout/NavigationButtons';

/**
 * Orchestrator for the review screen.
 *
 * Shows up to 3 preview cards for randomly selected recipients, a
 * pre-send summary checklist, and navigation buttons (Back / Send Now).
 * "Send Now" is disabled until the user confirms readiness via the
 * checklist checkbox.
 *
 * When "Send Now" is clicked the send progress status transitions to
 * 'sending' and the wizard navigates to the 'sending' step.
 */
const ReviewStep: React.FC = () => {
  const { state, dispatch } = useSendFlow();
  const { state: authState } = useAuth();
  const wizard = useWizard();
  const {
    recipients,
    recipientPreviewIndices,
    template,
  } = state;

  const [isConfirmed, setIsConfirmed] = useState(false);

  // Derive the from-email — fall back to a placeholder if not authenticated
  const fromEmail = authState.user?.email ?? 'your-email@example.com';

  // Resolve preview indices to actual recipients
  const previewRecipients = recipientPreviewIndices
    .map((idx) => recipients[idx])
    .filter(Boolean);

  // Handle "Send Now"
  const handleSendNow = () => {
    dispatch({
      type: 'SET_SEND_PROGRESS',
      payload: {
        status: 'sending',
        total: recipients.length,
      },
    });
    wizard.goToNextStep();
  };

  return (
    <div className="space-y-8">
      {/* ----------------- Section: Preview Cards ----------------- */}
      <section>
        <h2 className="text-lg font-bold text-sky-700 mb-4">
          👁️{' '}
          {recipients.length === 0
            ? 'Previews'
            : `Preview${previewRecipients.length > 1 ? 's' : ''} — ${recipients.length} recipient${recipients.length !== 1 ? 's' : ''} total`}
        </h2>

        {previewRecipients.length === 0 ? (
          /* Empty state: no recipients to preview */
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-sky-200 bg-sky-50/30 p-12 text-center">
            <svg
              className="h-10 w-10 text-sky-300 mb-3"
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
                d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
              />
            </svg>
            <p className="text-sm text-sky-400 font-medium">
              No recipients available. Go back and upload a recipient list.
            </p>
          </div>
        ) : (
          /* Grid of preview cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {previewRecipients.map((recipient) => (
              <PreviewCard
                key={recipient.rowIndex}
                recipient={recipient}
                template={template}
                fromEmail={fromEmail}
              />
            ))}
          </div>
        )}

        {/* Note when fewer than 3 recipients */}
        {recipients.length > 0 && recipients.length < 3 && (
          <p className="text-xs text-gray-400 mt-2">
            Showing all {recipients.length} recipient{recipients.length !== 1 ? 's' : ''} because there
            are fewer than 3.
          </p>
        )}
      </section>

      {/* ----------------- Section: Send Checklist ----------------- */}
      <section>
        <SendChecklist
          recipientCount={recipients.length}
          fromEmail={fromEmail}
          isConfirmed={isConfirmed}
          onConfirmChange={setIsConfirmed}
        />
      </section>

      {/* ----------------- Navigation ----------------- */}
      <NavigationButtons
        onNext={handleSendNow}
        onPrev={wizard.goToPrevStep}
        nextLabel="Send Now"
        nextDisabled={!isConfirmed || recipients.length === 0}
        nextLoading={false}
      />
    </div>
  );
};

export default ReviewStep;
