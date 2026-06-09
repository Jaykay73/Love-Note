import React, { useCallback, useRef, useState } from 'react';
import type { PlaceholderKey } from '../../types';
import { getUnusedPlaceholderWarning } from '../../utils/templateEngine';
import { useSendFlow } from '../../hooks/useSendFlow';
import { useDebounce } from '../../hooks/useDebounce';
import SubjectField from './SubjectField';
import MessageBodyEditor from './MessageBodyEditor';
import PlaceholderButtons from './PlaceholderButtons';
import LivePreview from './LivePreview';
import NavigationButtons from '../layout/NavigationButtons';

/**
 * Props for the ComposeStep component.
 */
export interface ComposeStepProps {
  onNext: () => void;
  onPrev: () => void;
}

/**
 * Orchestrator for the compose screen.
 *
 * Left side: subject input, body textarea, and placeholder-insertion
 * buttons. Right side: live email preview. Stacked vertically on small
 * screens.
 *
 * Template changes are debounced (300 ms) before being passed to the
 * preview to avoid excessive re-renders.
 */
const ComposeStep: React.FC<ComposeStepProps> = ({ onNext, onPrev }) => {
  const { state, updateTemplate } = useSendFlow();
  const { template, recipients } = state;

  // Refs for cursor-position insertion
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [focusedField, setFocusedField] = useState<'subject' | 'body'>('body');

  // Debounced template for the live preview (300 ms)
  const debouncedTemplate = useDebounce(template, 300);

  // First valid recipient for preview
  const previewRecipient = recipients.length > 0 ? recipients[0] : null;

  // Warning about unused placeholders
  const placeholderWarning = getUnusedPlaceholderWarning(
    template,
    recipients.length,
  );

  // Next disabled when both subject and body are empty
  const isNextDisabled = !template.subject.trim() && !template.body.trim();

  // --- Insert placeholder at cursor position --------------------------------
  const handleInsertPlaceholder = useCallback(
    (key: PlaceholderKey) => {
      if (focusedField === 'subject' && subjectRef.current) {
        const input = subjectRef.current;
        const start = input.selectionStart ?? template.subject.length;
        const end = input.selectionEnd ?? start;
        const newValue =
          template.subject.slice(0, start) +
          key +
          template.subject.slice(end);

        updateTemplate({ subject: newValue });

        // Restore cursor position after the inserted text
        requestAnimationFrame(() => {
          const pos = start + key.length;
          input.setSelectionRange(pos, pos);
          input.focus();
        });
      } else if (focusedField === 'body' && bodyRef.current) {
        const textarea = bodyRef.current;
        const start = textarea.selectionStart ?? template.body.length;
        const end = textarea.selectionEnd ?? start;
        const newValue =
          template.body.slice(0, start) +
          key +
          template.body.slice(end);

        updateTemplate({ body: newValue });

        // Restore cursor position after the inserted text
        requestAnimationFrame(() => {
          const pos = start + key.length;
          textarea.setSelectionRange(pos, pos);
          textarea.focus();
        });
      }
    },
    [focusedField, template.subject, template.body, updateTemplate],
  );

  return (
    <div className="space-y-6">
      {/* Placeholder warning banner */}
      {placeholderWarning && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow-sm"
        >
          <span className="text-lg shrink-0">💡</span>
          <span className="font-medium">{placeholderWarning}</span>
        </div>
      )}

      {/* Main layout: side-by-side on desktop, stacked on mobile */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ---------- Left column: editor ---------- */}
        <div className="flex-1 space-y-5">
          <SubjectField
            ref={subjectRef}
            value={template.subject}
            onChange={(val) => updateTemplate({ subject: val })}
            onFocus={() => setFocusedField('subject')}
          />

          <MessageBodyEditor
            ref={bodyRef}
            value={template.body}
            onChange={(val) => updateTemplate({ body: val })}
            onFocus={() => setFocusedField('body')}
          />

          <PlaceholderButtons onInsert={handleInsertPlaceholder} />
        </div>

        {/* ---------- Right column: preview ---------- */}
        <div className="w-full lg:w-96 shrink-0">
          {previewRecipient ? (
            <LivePreview
              recipient={previewRecipient}
              template={debouncedTemplate}
            />
          ) : (
            <div className="flex items-center justify-center h-full min-h-[12rem] rounded-xl border-2 border-dashed border-rose-200 bg-rose-50/30 p-6 text-center">
              <p className="text-sm text-rose-400 font-medium">
                Upload a recipient list first to see a preview
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <NavigationButtons
        onNext={onNext}
        onPrev={onPrev}
        nextLabel="Review"
        nextDisabled={isNextDisabled}
      />
    </div>
  );
};

export default ComposeStep;
