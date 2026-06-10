// =========================================================================
// useSendQueue — Core Email Sending Engine
//
// Manages the entire asynchronous send loop: sequential delivery with
// rate-limit backoff, auth-expiry recovery, cancellation, progress
// tracking, and result collection.
//
// IMPORTANT: Uses useRef for mutable state read inside the async send
// loop so that cancellation and the last-successful index are always
// current, avoiding stale closures.
// =========================================================================

import { useState, useRef, useCallback } from 'react';
import type {
  Recipient,
  MessageTemplate,
  SendProgress,
  SendResult,
} from '../types';
import { buildMimeMessage, encodeBase64Url } from '../services/mimeBuilder';
import { sendEmail } from '../services/gmail';
import { calculateBackoff, getSendDelay } from '../utils/rateLimiter';
import { interpolate } from '../utils/templateEngine';

// -------------------------------------------------------------------------
// Constants
// -------------------------------------------------------------------------

const MAX_RETRY_ATTEMPTS = 5;

const INITIAL_PROGRESS: SendProgress = {
  status: 'idle',
  sent: 0,
  failed: 0,
  total: 0,
  currentRecipientName: '',
  currentRecipientEmail: '',
  lastSuccessfullySentIndex: -1,
};

// -------------------------------------------------------------------------
// Types
// -------------------------------------------------------------------------

export interface UseSendQueueReturn {
  /** Current send progress state — drives the UI */
  progress: SendProgress;
  /** Accumulated send results (one entry per processed recipient) */
  results: SendResult[];
  /**
   * Start (or resume) sending.
   *
   * When a previous send was aborted due to auth expiry, calling send()
   * again with a fresh token resumes from the last successfully sent
   * index + 1.  Call `reset()` first to start a completely new batch.
   */
  send: (params: SendParams) => Promise<void>;
  /** Set the cancellation flag. The loop stops at the next safe point. */
  cancel: () => void;
  /** Reset all progress, results, and refs to their initial state. */
  reset: () => void;
}

export interface SendParams {
  recipients: Recipient[];
  template: MessageTemplate;
  accessToken: string;
  fromEmail: string;
  fromName: string;
  /**
   * Called when the Gmail API returns 401.
   * Should attempt to silently refresh the token and return the new value.
   * Throw / reject to signal that the refresh failed — the send loop will
   * then pause and set status 'recovering-auth'.
   */
  onTokenExpired: () => Promise<string>;
}

// -------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------

/**
 * Map a Gmail API response to a friendly error type and message shown
 * in the result list.
 */
function classifyError(
  statusCode: number,
  errorMessage?: string,
): { errorType: SendResult['errorType']; message: string } {
  if (statusCode === 429) {
    return {
      errorType: 'rate-limit',
      message: errorMessage || 'Gmail rate limit reached',
    };
  }

  if (statusCode === 401) {
    return {
      errorType: 'auth-expired',
      message: errorMessage || 'Session expired',
    };
  }

  if (statusCode === 0) {
    return {
      errorType: 'network',
      message: errorMessage || 'Network error',
    };
  }

  if (statusCode === 403 || statusCode === 400) {
    const msg = (errorMessage || '').toLowerCase();
    if (
      msg.includes('quota') ||
      msg.includes('daily') ||
      msg.includes('limit')
    ) {
      return {
        errorType: 'quota-exceeded',
        message: errorMessage || 'Daily sending limit reached',
      };
    }
  }

  return {
    errorType: 'permanent',
    message: errorMessage || 'Email was rejected',
  };
}

// =========================================================================
// Hook
// =========================================================================

export function useSendQueue(): UseSendQueueReturn {
  const [progress, setProgress] = useState<SendProgress>(INITIAL_PROGRESS);
  const [results, setResults] = useState<SendResult[]>([]);

  // ---- Refs (mutable across renders, read inside the async loop) --------

  /** Set true by cancel(); checked each loop iteration. */
  const cancelledRef = useRef(false);

  /** Guards against concurrent send() calls. */
  const isSendingRef = useRef(false);

  /** Tracks the last index that was delivered successfully. */
  const lastSuccessfullySentRef = useRef(-1);

  // -----------------------------------------------------------------------
  // send()
  // -----------------------------------------------------------------------

  const send = useCallback(
    async (params: SendParams): Promise<void> => {
      // Guard: already sending
      if (isSendingRef.current) return;

      // Guard: cancelled before start
      if (cancelledRef.current) return;

      isSendingRef.current = true;

      const {
        recipients,
        template,
        accessToken,
        fromEmail,
        fromName,
        onTokenExpired,
      } = params;

      const total = recipients.length;

      // Compute resume point from the ref (persisted across calls).
      const startIndex = Math.max(0, lastSuccessfullySentRef.current + 1);

      // Update progress — carry over any previously-sent counts from
      // the current React state (important for auth-recovery resume).
      setProgress((prev) => ({
        ...prev,
        status: 'sending',
        total,
        currentRecipientName: '',
        currentRecipientEmail: '',
      }));

      // ---- Main send loop ------------------------------------------------

      let currentToken = accessToken;
      let tokenRefreshed = false;

      for (let i = startIndex; i < total; i++) {
        // Check cancellation at the start of each iteration
        if (cancelledRef.current) break;

        const recipient = recipients[i];

        // Update current recipient info so the UI stays responsive
        setProgress((prev) => ({
          ...prev,
          currentRecipientName: recipient.full_name,
          currentRecipientEmail: recipient.email,
        }));

        // Interpolate placeholders for this specific recipient
        const personalizedSubject = interpolate(template.subject, recipient);
        const personalizedBody = interpolate(template.body, recipient);

        // Build the MIME message once per recipient
        const mimeMessage = buildMimeMessage({
          fromName,
          fromEmail,
          to: recipient.email,
          subject: personalizedSubject,
          body: personalizedBody,
        });
        const raw = encodeBase64Url(mimeMessage);

        let lastError: {
          errorType: SendResult['errorType'];
          message: string;
        } | null = null;
        let sent = false;

        // ---- Retry loop --------------------------------------------------
        for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
          if (cancelledRef.current) break;

          // Perform the API call
          const response = await sendEmail({
            accessToken: currentToken,
            to: recipient.email,
            raw,
          });

          if (cancelledRef.current) break;

          // ---- Success ---------------------------------------------------
          if (response.success) {
            sent = true;
            lastSuccessfullySentRef.current = i;

            setProgress((prev) => ({
              ...prev,
              sent: prev.sent + 1,
              lastSuccessfullySentIndex: i,
            }));

            setResults((prev) => [
              ...prev,
              {
                recipient,
                status: 'sent',
                messageId: response.messageId,
              },
            ]);

            break; // Exit retry loop for this recipient
          }

          // ---- HTTP 429 — Rate limit -------------------------------------
          if (response.statusCode === 429 && attempt < MAX_RETRY_ATTEMPTS - 1) {
            const delay = calculateBackoff(attempt);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue; // Retry
          }

          // ---- HTTP 401 — Auth expired -----------------------------------
          if (response.statusCode === 401 && !tokenRefreshed) {
            try {
              currentToken = await onTokenExpired();
              tokenRefreshed = true;
              // Do not increment attempt — retry immediately with fresh token
              continue;
            } catch {
              // Token refresh failed — pause the entire send
              lastError = {
                errorType: 'auth-expired',
                message:
                  'Session expired. Please sign in again and resume.',
              };
              setProgress((prev) => ({
                ...prev,
                status: 'recovering-auth' as const,
              }));
              isSendingRef.current = false;
              return; // Exit send() entirely
            }
          }

          // ---- Permanent / non-retryable error ---------------------------
          lastError = classifyError(response.statusCode, response.error);
          break; // Exit retry loop for this recipient
        }

        // If cancelled, stop processing further recipients
        if (cancelledRef.current) break;

        // ---- Record failure (if not sent) --------------------------------
        if (!sent && lastError) {
          setProgress((prev) => ({
            ...prev,
            failed: prev.failed + 1,
          }));

          setResults((prev) => [
            ...prev,
            {
              recipient,
              status: 'failed',
              error: lastError.message,
              errorType: lastError.errorType,
            },
          ]);
        }

        // ---- Inter-send delay ---------------------------------------------
        if (i < total - 1 && !cancelledRef.current) {
          await new Promise((resolve) => setTimeout(resolve, getSendDelay()));
        }
      }

      // ---- Completion -----------------------------------------------------
      if (cancelledRef.current) {
        setProgress((prev) => ({ ...prev, status: 'cancelled' }));
      } else {
        setProgress((prev) => ({ ...prev, status: 'completed' }));
      }

      isSendingRef.current = false;
    },
    // Stable refs and state-setters — no render-to-render dependencies.
    [],
  );

  // -----------------------------------------------------------------------
  // cancel()
  // -----------------------------------------------------------------------

  const cancel = useCallback(() => {
    cancelledRef.current = true;
  }, []);

  // -----------------------------------------------------------------------
  // reset()
  // -----------------------------------------------------------------------

  const reset = useCallback(() => {
    // Prevent resetting while a send is in flight.
    if (isSendingRef.current) return;

    cancelledRef.current = false;
    lastSuccessfullySentRef.current = -1;
    setProgress(INITIAL_PROGRESS);
    setResults([]);
  }, []);

  // -----------------------------------------------------------------------
  // Return
  // -----------------------------------------------------------------------

  return { progress, results, send, cancel, reset };
}
