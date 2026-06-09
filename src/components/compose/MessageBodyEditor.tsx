import React from 'react';

/**
 * Props for the MessageBodyEditor component.
 */
export interface MessageBodyEditorProps {
  /** Current body text */
  value: string;
  /** Called whenever the body text changes */
  onChange: (value: string) => void;
  /** Called when the textarea receives focus */
  onFocus?: () => void;
}

/**
 * Email body textarea.
 *
 * A resizable textarea with accessible label and a minimum height of
 * 4 rows for comfortable editing.
 */
const MessageBodyEditor = React.forwardRef<
  HTMLTextAreaElement,
  MessageBodyEditorProps
>(({ value, onChange, onFocus }, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-1.5">
      <label
        htmlFor="message-body-editor"
        className="block text-sm font-medium text-gray-700"
      >
        Your Message
      </label>
      <textarea
        ref={ref}
        id="message-body-editor"
        value={value}
        onChange={handleChange}
        onFocus={onFocus}
        rows={10}
        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-y min-h-[6rem]"
        placeholder="Write your message here. Use placeholders to personalize..."
      />
    </div>
  );
});

MessageBodyEditor.displayName = 'MessageBodyEditor';

export default MessageBodyEditor;
