// =========================================================================
// SendingStep — Orchestrator for the "sending" wizard screen
//
// On mount it starts the send queue, syncing progress and results back
// to the shared send-flow state so that the ResultStep can read them.
//
// Handles:
//  - Auto-start sending when the component mounts
//  - Live progress bar + status display
//  - Cancel with confirmation dialog
//  - Auth-expiry recovery (re-sign-in prompt)
//  - Automatic navigation to the result step on completion
// =========================================================================

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useSendQueue, type SendParams } from '../../hooks/useSendQueue';
import { useSendFlow } from '../../hooks/useSendFlow';
import { useWizard } from '../../hooks/useWizard';
import { useAuth } from '../../hooks/useAuth';
import * as oauth from '../../services/oauth';
import ProgressBar from './ProgressBar';
import SendStatus from './SendStatus';
import CancelDialog from './CancelDialog';
import Button from '../common/Button';
import Card from '../common/Card';

// =========================================================================
// Component
// =========================================================================

const SendingStep: React.FC = () => {
  const { progress, results, send, cancel } = useSendQueue();
  const { state: sendFlowState, dispatch: sendFlowDispatch } = useSendFlow();
  const { state: authState, dispatch: authDispatch, signIn } = useAuth();
  const wizard = useWizard();

  // ---- Local state -------------------------------------------------------
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  // Ensures we only auto-start the send once per mount (not on re-renders).
  const hasStartedRef = useRef(false);

  // Keep a ref of the original send params so we can resume after auth
  // recovery without re-reading context (which may be stale in closures).
  const sendParamsRef = useRef<SendParams | null>(null);

  // We also need a stable ref to the current access token for the
  // onTokenExpired callback (which is created once but invoked later).
  const tokenRef = useRef<string | null>(authState.accessToken);
  useEffect(() => {
    tokenRef.current = authState.accessToken;
  }, [authState.accessToken]);

  // -----------------------------------------------------------------------
  // Manual start helper (also called by the auto-start effect)
  // -----------------------------------------------------------------------

  const startSending = useCallback(() => {
    console.log('[SendingStep] startSending called');
    console.log('[SendingStep] hasStartedRef:', hasStartedRef.current);
    console.log('[SendingStep] recipients.length:', sendFlowState.recipients.length);
    console.log('[SendingStep] accessToken exists:', !!authState.accessToken);
    console.log('[SendingStep] user.email:', authState.user?.email);

    if (hasStartedRef.current) {
      console.log('[SendingStep] BAILED: already started');
      return;
    }
    if (sendFlowState.recipients.length === 0) {
      console.log('[SendingStep] BAILED: no recipients');
      return;
    }
    if (!authState.accessToken || !authState.user?.email) {
      console.log('[SendingStep] BAILED: no access token or email');
      console.log('[SendingStep] accessToken:', authState.accessToken);
      console.log('[SendingStep] user:', authState.user);
      return;
    }

    console.log('[SendingStep] All checks passed, starting send...');
    hasStartedRef.current = true;

    const params: SendParams = {
      recipients: sendFlowState.recipients,
      template: sendFlowState.template,
      accessToken: authState.accessToken,
      fromEmail: authState.user.email,
      fromName: sendFlowState.template.fromName,
      onTokenExpired: async () => {
        const newToken = await oauth.refreshAccessToken();
        authDispatch({ type: 'TOKEN_REFRESHED', payload: newToken });
        return newToken;
      },
    };

    sendParamsRef.current = params;
    send(params);
  }, [
    send,
    sendFlowState.recipients,
    sendFlowState.template,
    authState.accessToken,
    authState.user?.email,
    authDispatch,
  ]);

  // -----------------------------------------------------------------------
  // Auto-start sending on mount
  // -----------------------------------------------------------------------

  useEffect(() => {
    startSending();
  }, [startSending]);

  // -----------------------------------------------------------------------
  // Sync progress to send-flow state
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (progress.status !== 'idle') {
      sendFlowDispatch({
        type: 'SET_SEND_PROGRESS',
        payload: progress,
      });
    }
  }, [progress, sendFlowDispatch]);

  // -----------------------------------------------------------------------
  // Sync results to send-flow state
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (results.length > 0) {
      const latestResult = results[results.length - 1];
      sendFlowDispatch({
        type: 'ADD_SEND_RESULT',
        payload: latestResult,
      });
    }
  }, [results, sendFlowDispatch]);

  // -----------------------------------------------------------------------
  // Navigate to result step when send completes or is cancelled
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (progress.status === 'completed' || progress.status === 'cancelled') {
      // Give React a tick to flush the dispatched send-flow updates
      const id = requestAnimationFrame(() => {
        wizard.goToNextStep();
      });
      return () => cancelAnimationFrame(id);
    }
  }, [progress.status, wizard]);

  // -----------------------------------------------------------------------
  // Cancel handlers
  // -----------------------------------------------------------------------

  const handleOpenCancelDialog = useCallback(() => {
    setIsCancelDialogOpen(true);
  }, []);

  const handleDismissCancel = useCallback(() => {
    setIsCancelDialogOpen(false);
  }, []);

  const handleConfirmCancel = useCallback(() => {
    cancel();
    setIsCancelDialogOpen(false);
  }, [cancel]);

  // -----------------------------------------------------------------------
  // Auth-recovery handler
  // -----------------------------------------------------------------------

  const handleReAuth = useCallback(async () => {
    try {
      // Open the Google sign-in popup
      await signIn();

      // After sign-in completes, the oauth module holds the new token
      const newToken = oauth.getAccessToken();
      if (newToken && sendParamsRef.current) {
        // Sync the token into React context
        authDispatch({ type: 'TOKEN_REFRESHED', payload: newToken });

        // Resume sending with the refreshed token
        send({
          ...sendParamsRef.current,
          accessToken: newToken,
        });
      }
    } catch {
      // signIn() already handles its own errors — nothing extra to do.
    }
  }, [signIn, authDispatch, send]);

  // ---- Derive display helpers -------------------------------------------

  // Use the larger of the two totals: what the send-queue knows about
  // (progress.total, set when send() is called) versus what is stored in the
  // send-flow context (set by UploadStep and ReviewStep).
  const displayTotal =
    progress.total > 0
      ? progress.total
      : sendFlowState.recipients.length > 0
        ? sendFlowState.recipients.length
        : sendFlowState.sendProgress.total;

  // True while the send loop is actively delivering (not idle/completed/etc.)
  const isActive =
    progress.status === 'sending' || progress.status === 'recovering-auth';
  const isFinalState =
    progress.status === 'completed' || progress.status === 'cancelled';

  // True if we genuinely have nothing to send (both sources are empty)
  const hasNoRecipients = displayTotal === 0;

  // ---- Render -----------------------------------------------------------

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <div className="space-y-6">
          {/* ---- Title ---- */}
          <h2 className="text-lg font-semibold text-gray-800 text-center">
            {progress.status === 'sending' && 'Sending Emails...'}
            {progress.status === 'recovering-auth' && 'Authentication Needed'}
            {progress.status === 'cancelled' && 'Send Cancelled'}
            {progress.status === 'completed' && 'Send Complete'}
            {progress.status === 'idle' && 'Preparing...'}
          </h2>

          {/* ---- Progress Bar ---- */}
          <ProgressBar
            sent={progress.sent}
            failed={progress.failed}
            total={displayTotal}
          />

          {/* ---- Status Message ---- */}
          <SendStatus
            currentRecipientName={progress.currentRecipientName}
            currentRecipientEmail={progress.currentRecipientEmail}
            status={progress.status}
          />

          {/* ---- No recipients fallback ---- */}
          {hasNoRecipients && (
            <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-rose-200 bg-rose-50/30 p-6 text-center">
              <p className="text-sm font-medium text-rose-600">
                No recipients loaded for this send.
              </p>
              <p className="text-xs text-rose-400">
                Go back to the Upload step and upload your contact list first.
              </p>
              <Button variant="secondary" onClick={wizard.goToPrevStep}>
                Go Back
              </Button>
            </div>
          )}

          {/* ---- Manual start button (shown when idle with recipients but auto-start didn't fire) ---- */}
          {progress.status === 'idle' && !hasNoRecipients && (
            <div className="flex flex-col items-center gap-3 pt-2">
              <Button variant="primary" size="lg" onClick={startSending}>
                💌 Start Sending Now
              </Button>
              <p className="text-xs text-gray-400">
                {sendFlowState.recipients.length} recipient{sendFlowState.recipients.length !== 1 ? 's' : ''} ready
              </p>
            </div>
          )}

          {/* ---- Actions ---- */}
          <div className="flex justify-center gap-3 pt-2">
            {/* Cancel button — visible during active sending */}
            {isActive && progress.status !== 'recovering-auth' && (
              <Button
                variant="secondary"
                onClick={handleOpenCancelDialog}
              >
                Cancel Sending
              </Button>
            )}

            {/* Re-auth button — visible when session expired */}
            {progress.status === 'recovering-auth' && (
              <Button variant="primary" onClick={handleReAuth}>
                Sign In Again
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* ---- Hidden spinner shown briefly at the very end ---- */}
      {isFinalState && (
        <p className="text-center text-xs text-gray-400 motion-safe:animate-pulse">
          Preparing results...
        </p>
      )}

      {/* ---- Cancel Confirmation Dialog ---- */}
      <CancelDialog
        isOpen={isCancelDialogOpen}
        onConfirm={handleConfirmCancel}
        onDismiss={handleDismissCancel}
        alreadySent={progress.sent}
      />
    </div>
  );
};

export default SendingStep;
