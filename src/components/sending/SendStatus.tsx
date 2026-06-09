// =========================================================================
// SendStatus — Live status indicator for the sending step
//
// Shows the current recipient being processed, a pulsing animation during
// active sending, and contextual messages for paused / recovering-auth /
// cancelled / completed states.
// =========================================================================

import React from 'react';
import type { SendStatus as SendStatusType } from '../../types';

// -------------------------------------------------------------------------
// Props
// -------------------------------------------------------------------------

export interface SendStatusProps {
  /** Full name of the recipient currently being sent to */
  currentRecipientName: string;
  /** Email address of the recipient currently being sent to */
  currentRecipientEmail: string;
  /** Overall send status */
  status: SendStatusType;
}

// =========================================================================
// Component
// =========================================================================

const SendStatus: React.FC<SendStatusProps> = ({
  currentRecipientName,
  currentRecipientEmail,
  status,
}) => {
  // ---- Idle ---------------------------------------------------------------
  if (status === 'idle') {
    return (
      <div className="flex items-center justify-center gap-3 py-6">
        <p className="text-sm font-medium text-rose-400">✨ Preparing your messages…</p>
      </div>
    );
  }

  // ---- Sending ------------------------------------------------------------
  if (status === 'sending') {
    return (
      <div
        className="flex flex-col items-center gap-4 py-6"
        role="status"
        aria-live="polite"
      >
        {/* Pulsing heart / sparkle indicator — respects reduced motion */}
        <div className="relative flex items-center justify-center" aria-hidden="true">
          <div className="absolute h-14 w-14 motion-safe:animate-ping rounded-full bg-rose-300 opacity-50" />
          <svg
            className="relative h-10 w-10 text-rose-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold text-rose-700">
            💕 Sending love to {currentRecipientName || '...'}
          </p>
          {currentRecipientEmail && (
            <p className="text-xs text-rose-400 mt-1">
              ({currentRecipientEmail})
            </p>
          )}
        </div>

        <p className="text-xs text-rose-300 font-medium motion-safe:animate-pulse">
          Sending one email at a time…
        </p>
      </div>
    );
  }

  // ---- Paused (future use) ------------------------------------------------
  if (status === 'paused') {
    return (
      <div
        className="flex flex-col items-center gap-3 py-6"
        role="status"
        aria-live="polite"
      >
        <svg
          className="h-10 w-10 text-amber-400"
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
            d="M15.75 5.25v13.5m-7.5-13.5v13.5"
          />
        </svg>
        <p className="text-sm font-semibold text-amber-700">
          ⏸️ Send paused
        </p>
      </div>
    );
  }

  // ---- Recovering auth ----------------------------------------------------
  if (status === 'recovering-auth') {
    return (
      <div
        className="flex flex-col items-center gap-3 py-6"
        role="alert"
        aria-live="assertive"
      >
        <svg
          className="h-8 w-8 text-orange-500"
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
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
        <p className="text-sm font-semibold text-orange-700">
          🔐 Session expired
        </p>
        <p className="text-xs text-orange-500 font-medium">
          Please sign in again to resume from where you left off.
        </p>
      </div>
    );
  }

  // ---- Cancelled ----------------------------------------------------------
  if (status === 'cancelled') {
    return (
      <div
        className="flex flex-col items-center gap-3 py-6"
        role="status"
        aria-live="polite"
      >
        <svg
          className="h-10 w-10 text-rose-400"
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        <p className="text-sm font-semibold text-rose-600">
          ❌ Sending cancelled
        </p>
        <p className="text-xs text-rose-400 font-medium">
          No more emails will be sent from this batch.
        </p>
      </div>
    );
  }

  // ---- Completed ----------------------------------------------------------
  if (status === 'completed') {
    return (
      <div
        className="flex flex-col items-center gap-3 py-6"
        role="status"
        aria-live="polite"
      >
        <svg
          className="h-10 w-10 text-emerald-400"
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
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm font-medium text-green-700">
          All emails processed
        </p>
      </div>
    );
  }

  // ---- Fallback (should never reach here) ---------------------------------
  return null;
};

export default SendStatus;
