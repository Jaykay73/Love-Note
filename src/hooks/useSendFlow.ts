// =========================================================================
// useSendFlow — Convenience hook for consuming SendFlowContext
//
// Throws a descriptive error if used outside of a SendFlowProvider, making
// misuse obvious during development.
// =========================================================================

import { useContext } from 'react';
import {
  SendFlowContext,
  type SendFlowContextValue,
} from '../contexts/SendFlowContext';

/**
 * Access the current send-flow state and actions.
 *
 * Must be called within a `<SendFlowProvider>` tree, otherwise an error
 * is thrown with a clear message.
 */
export function useSendFlow(): SendFlowContextValue {
  const context = useContext(SendFlowContext);
  if (!context) {
    throw new Error(
      'useSendFlow must be used within a SendFlowProvider. ' +
        'Wrap your component tree with <SendFlowProvider>.',
    );
  }
  return context;
}
