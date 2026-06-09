import React from 'react';
import Card from '../common/Card';

/**
 * Props for the SendChecklist component.
 */
export interface SendChecklistProps {
  /** Number of recipients who will receive the email */
  recipientCount: number;
  /** The email address the emails will be sent from */
  fromEmail: string;
  /** Whether the checkbox is currently checked */
  isConfirmed: boolean;
  /** Called when the checkbox state changes */
  onConfirmChange: (confirmed: boolean) => void;
}

/**
 * Estimated delay per email in milliseconds.
 */
const ESTIMATED_DELAY_PER_EMAIL_MS = 1000;

/**
 * Pre-send summary and confirmation checklist.
 *
 * Shows a summary of what is about to happen (number of emails,
 * from address, estimated send duration) and a confirmation checkbox.
 */
const SendChecklist: React.FC<SendChecklistProps> = ({
  recipientCount,
  fromEmail,
  isConfirmed,
  onConfirmChange,
}) => {
  const estimatedSeconds = recipientCount * ESTIMATED_DELAY_PER_EMAIL_MS;
  const estimatedMinutes = Math.ceil(estimatedSeconds / 1000 / 60);
  const estimatedDisplay =
    estimatedMinutes < 1
      ? 'Less than a minute'
      : estimatedMinutes === 1
        ? 'About 1 minute'
        : `About ${estimatedMinutes} minutes`;

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfirmChange(e.target.checked);
  };

  return (
    <Card padding="md" className="border-blue-100">
      <div className="space-y-4">
        {/* Summary */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-800">
            Send Summary
          </h3>

          <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-blue-500 shrink-0"
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
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
              <p>
                You&rsquo;re about to send{' '}
                <strong>{recipientCount.toLocaleString()}</strong> personalized
                emails from <strong>{fromEmail}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-blue-500 shrink-0"
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
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p>
                Estimated send time:{' '}
                <strong>{estimatedDisplay}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation checkbox */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={isConfirmed}
            onChange={handleCheckboxChange}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
            I&rsquo;ve reviewed the previews &mdash; I&rsquo;m ready to send
          </span>
        </label>
      </div>
    </Card>
  );
};

export default SendChecklist;
