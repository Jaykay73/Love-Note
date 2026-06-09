// =========================================================================
// SendAnotherButton — Reset and start over button for the result screen
//
// A single primary button labelled "Send Another Batch" that resets the
// wizard and send-flow state so the user can begin a new send cycle.
// =========================================================================

import React from 'react';
import Button from '../common/Button';

// -------------------------------------------------------------------------
// Props
// -------------------------------------------------------------------------

export interface SendAnotherButtonProps {
  /** Called when the user clicks the button */
  onClick: () => void;
}

// =========================================================================
// Component
// =========================================================================

const SendAnotherButton: React.FC<SendAnotherButtonProps> = ({ onClick }) => {
  return (
    <div className="flex justify-center pt-2">
      <Button variant="primary" size="lg" onClick={onClick}>
        {/* Refresh icon */}
        <svg
          className="h-5 w-5"
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
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
          />
        </svg>
        Send Another Batch
      </Button>
    </div>
  );
};

export default SendAnotherButton;
