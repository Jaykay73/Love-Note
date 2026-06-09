import React from 'react';

/**
 * Props for the SubjectField component.
 */
export interface SubjectFieldProps {
  /** Current subject value */
  value: string;
  /** Called whenever the subject changes */
  onChange: (value: string) => void;
  /** Optional placeholder text displayed inside the input */
  placeholder?: string;
  /** Called when the input receives focus */
  onFocus?: () => void;
}

/**
 * Subject line input with placeholder support.
 *
 * Displays a label, a text input for the subject line, and a gentle
 * character-count hint below the field.
 */
const SubjectField = React.forwardRef<HTMLInputElement, SubjectFieldProps>(
  ({ value, onChange, placeholder, onFocus }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    };

    return (
      <div className="space-y-1.5">
        <label
          htmlFor="subject-field"
          className="block text-sm font-medium text-gray-700"
        >
          Subject
        </label>
        <input
          ref={ref}
          id="subject-field"
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={onFocus}
          placeholder={placeholder ?? 'e.g. Thinking of you, {{first_name}}!'}
          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
        />
        <p className="text-xs text-gray-400">Keep it short and personal</p>
      </div>
    );
  },
);

SubjectField.displayName = 'SubjectField';

export default SubjectField;
