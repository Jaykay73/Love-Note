import React from 'react';
import type { Recipient, MessageTemplate } from '../../types';
import { interpolateTemplate } from '../../utils/templateEngine';
import Card from '../common/Card';

/**
 * Props for the PreviewCard component.
 */
export interface PreviewCardProps {
  /** The recipient for this preview */
  recipient: Recipient;
  /** The message template to interpolate */
  template: MessageTemplate;
  /** The from-email address shown in the preview */
  fromEmail: string;
}

/**
 * Full email preview for one recipient.
 *
 * Renders a complete email envelope (From, To, Subject) and the
 * personalized body content as a styled card. Long content is
 * scrollable within the card.
 */
const PreviewCard: React.FC<PreviewCardProps> = ({
  recipient,
  template,
  fromEmail,
}) => {
  const { subject, body } = interpolateTemplate(template, recipient);

  return (
    <Card padding="md" className="h-full">
      <div className="space-y-3">
        {/* Envelope header */}
        <div className="flex items-center gap-2 border-b border-sky-100 pb-3">
          <svg
            className="h-5 w-5 text-sky-400"
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
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
          </svg>
          <span className="text-sm font-semibold text-sky-600 truncate">
            To: {recipient.full_name || recipient.email}
          </span>
        </div>

        {/* Email details */}
        <div className="space-y-1.5 text-sm">
          <div className="flex gap-2">
            <span className="text-gray-500 font-medium w-14 shrink-0">From:</span>
            <span className="text-gray-900 break-all">
              {template.fromName || '(your name)'} &lt;{fromEmail}&gt;
            </span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 font-medium w-14 shrink-0">To:</span>
            <span className="text-gray-900 break-all">{recipient.email}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 font-medium w-14 shrink-0">Subject:</span>
            <span className="font-semibold text-gray-900 break-words">
              {subject || '(no subject)'}
            </span>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Body — scrollable for long content */}
        <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
          {body || '(empty body)'}
        </div>
      </div>
    </Card>
  );
};

export default PreviewCard;
