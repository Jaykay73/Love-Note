// =========================================================================
// CancelDialog — Confirmation modal for stopping an active send
//
// Warns the user how many emails have already been sent and asks them to
// confirm or dismiss the cancellation.
// =========================================================================

import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

// -------------------------------------------------------------------------
// Props
// -------------------------------------------------------------------------

export interface CancelDialogProps {
  /** Whether the dialog is visible */
  isOpen: boolean;
  /** Called when the user confirms cancellation */
  onConfirm: () => void;
  /** Called when the user dismisses the dialog */
  onDismiss: () => void;
  /** Number of emails already sent so far */
  alreadySent: number;
}

// =========================================================================
// Component
// =========================================================================

const CancelDialog: React.FC<CancelDialogProps> = ({
  isOpen,
  onConfirm,
  onDismiss,
  alreadySent,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onDismiss}
      title="Stop sending?"
      actions={
        <>
          <Button variant="secondary" onClick={onDismiss}>
            Keep Sending
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Stop Sending
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-gray-700">
          {alreadySent > 0
            ? `${alreadySent.toLocaleString()} email${alreadySent !== 1 ? 's' : ''} ha${alreadySent !== 1 ? 've' : 's'} already been sent. The remaining email${alreadySent !== 1 ? 's' : ''} won't be delivered.`
            : 'No emails have been sent yet. All remaining emails won\'t be delivered.'}
        </p>
        <p className="text-sm text-gray-500">
          You can download a list of unsent recipients from the results
          screen.
        </p>
      </div>
    </Modal>
  );
};

export default CancelDialog;
