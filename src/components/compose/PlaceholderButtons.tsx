import React from 'react';
import type { PlaceholderKey } from '../../types';

/**
 * Props for the PlaceholderButtons component.
 */
export interface PlaceholderButtonsProps {
  /**
   * Called when a placeholder button is clicked.
   * Receives the full placeholder key (e.g. `'{{first_name}}'`)
   * that should be inserted at the cursor position.
   */
  onInsert: (key: PlaceholderKey) => void;
}

/**
 * Mapping from PlaceholderKey to user-friendly label and description.
 */
const PLACEHOLDER_BUTTONS: Array<{
  key: PlaceholderKey;
  label: string;
  description: string;
}> = [
  {
    key: '{{first_name}}',
    label: '{first_name}',
    description: "Inserts the recipient's first name",
  },
  {
    key: '{{last_name}}',
    label: '{last_name}',
    description: "Inserts the recipient's last name",
  },
  {
    key: '{{full_name}}',
    label: '{full_name}',
    description: "Inserts the recipient's full name",
  },
  {
    key: '{{email}}',
    label: '{email}',
    description: "Inserts the recipient's email address",
  },
];

/**
 * Row of subtle pill buttons for inserting placeholders into the
 * subject or body fields.
 *
 * Each button has a tooltip describing what it inserts.
 */
const PlaceholderButtons: React.FC<PlaceholderButtonsProps> = ({ onInsert }) => {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-violet-500 uppercase tracking-wide">
        Insert Placeholder
      </p>
      <div className="flex flex-wrap gap-2">
        {PLACEHOLDER_BUTTONS.map(({ key, label, description }) => (
          <button
            key={key}
            type="button"
            title={description}
            aria-label={description}
            onClick={() => onInsert(key)}
            className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-600 hover:bg-violet-100 hover:text-violet-700 hover:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-1 transition-all active:scale-95 shadow-sm"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PlaceholderButtons;
