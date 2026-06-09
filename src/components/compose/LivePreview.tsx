import React from 'react';
import type { Recipient, MessageTemplate } from '../../types';
import { interpolateTemplate } from '../../utils/templateEngine';
import Card from '../common/Card';

/**
 * Props for the LivePreview component.
 */
export interface LivePreviewProps {
  /** The recipient to use for placeholder interpolation */
  recipient: Recipient;
  /** The current message template (subject + body + fromName) */
  template: MessageTemplate;
}

/**
 * Live email preview card.
 *
 * Renders a realistic email preview with From, To, Subject, and body,
 * updating in real-time as the user types in the compose fields.
 * Placeholders are interpolated against the provided recipient.
 *
 * Shows an empty state when both subject and body are empty, and a
 * subtle note when the recipient has no first name (falls back to
 * "friend").
 */
const LivePreview: React.FC<LivePreviewProps> = ({ recipient, template }) => {
  const isBodyEmpty = !template.subject.trim() && !template.body.trim();

  const interpolated = isBodyEmpty
    ? { subject: '', body: '' }
    : interpolateTemplate(template, recipient);

  const hasNoFirstName = !recipient.first_name || recipient.first_name.trim() === '';

  // Display fallback in the interpolated body when the recipient has no first name
  const displayBody = hasNoFirstName && template.body.includes('{{first_name}}')
    ? template.body.replace(/\{\{first_name\}\}/gi, 'friend')
    : interpolated.body;

  const displaySubject = hasNoFirstName && template.subject.includes('{{first_name}}')
    ? template.subject.replace(/\{\{first_name\}\}/gi, 'friend')
    : interpolated.subject;

  return (
    <Card padding="sm" className="h-full">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-rose-100 pb-2">
          <svg
            className="h-5 w-5 text-rose-400"
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
          <span className="text-sm font-semibold text-rose-600">Live Preview</span>
        </div>

        {isBodyEmpty ? (
          /* ----------------- Empty state ----------------- */
          <div className="flex flex-col items-center justify-center py-12 text-center">
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
                d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
              />
            </svg>
            <p className="text-sm text-rose-400 font-medium">
              ✍️ Start typing to see a preview
            </p>
          </div>
        ) : (
          /* ----------------- Email preview ----------------- */
          <div className="space-y-2 text-sm">
            {/* From */}
            <div className="flex gap-2">
              <span className="text-gray-500 font-medium w-12 shrink-0">From:</span>
              <span className="text-gray-900">
                {template.fromName || '(your name)'}
              </span>
            </div>

            {/* To */}
            <div className="flex gap-2">
              <span className="text-gray-500 font-medium w-12 shrink-0">To:</span>
              <span className="text-gray-900">{recipient.email}</span>
            </div>

            {/* Subject */}
            <div className="flex gap-2">
              <span className="text-gray-500 font-medium w-12 shrink-0">Subject:</span>
              <span className="font-semibold text-gray-900">
                {displaySubject || '(no subject)'}
              </span>
            </div>

            <hr className="border-gray-200 my-2" />

            {/* Body */}
            <div className="text-gray-800 whitespace-pre-wrap leading-relaxed min-h-[4rem]">
              {displayBody || '(empty body)'}
            </div>
          </div>
        )}

        {/* Fallback note */}
        {hasNoFirstName && !isBodyEmpty && (
          <p className="text-xs text-amber-600 font-medium italic border-t border-amber-100 pt-2">
            💡 Using &lsquo;friend&rsquo; as fallback for empty names
          </p>
        )}
      </div>
    </Card>
  );
};

export default LivePreview;
