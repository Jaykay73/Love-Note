// =========================================================================
// SendFlowContext — React Context + Provider for send-flow business state
//
// Uses useReducer with SendFlowState / SendFlowAction from ../types.
// Holds all data that flows across the wizard steps: parsed file, column
// mapping, recipients, template, and send progress / results.
// =========================================================================

import {
  createContext,
  useCallback,
  useReducer,
  type ReactNode,
} from 'react';
import type {
  SendFlowState,
  SendFlowAction,
  MessageTemplate,
  Recipient,
  RecipientValidation,
} from '../types';

// -------------------------------------------------------------------------
// Types
// -------------------------------------------------------------------------

export interface SendFlowContextValue {
  /** Current send-flow state */
  state: SendFlowState;
  /** Raw reducer dispatch (exposed for advanced use-cases) */
  dispatch: React.Dispatch<SendFlowAction>;
  /** Merge a partial MessageTemplate into the current template */
  updateTemplate: (partial: Partial<MessageTemplate>) => void;
  /** Set recipients and validation, auto-generating preview indices */
  setRecipients: (
    recipients: Recipient[],
    validation: RecipientValidation,
  ) => void;
  /** Re-generate random preview indices from current recipients */
  generatePreviews: () => void;
  /** Reset all send-flow state back to defaults */
  resetSendFlow: () => void;
}

// -------------------------------------------------------------------------
// Constants
// -------------------------------------------------------------------------

const initialState: SendFlowState = {
  parsedFile: null,
  columnDetection: null,
  columnMapping: null,
  isMappingConfirmed: false,
  recipients: [],
  validation: null,
  skipInvalidRows: true,
  template: { subject: '', body: '', fromName: '' },
  sendProgress: {
    status: 'idle',
    sent: 0,
    failed: 0,
    total: 0,
    currentRecipientName: '',
    currentRecipientEmail: '',
    lastSuccessfullySentIndex: -1,
  },
  sendResults: [],
  recipientPreviewIndices: [],
};

// -------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------

/**
 * Randomly pick up to 3 indices from the recipients array.
 */
function generatePreviewIndices(recipients: Recipient[]): number[] {
  if (recipients.length === 0) return [];
  const count = Math.min(3, recipients.length);
  const indices = new Set<number>();
  while (indices.size < count) {
    indices.add(Math.floor(Math.random() * recipients.length));
  }
  return Array.from(indices);
}

// -------------------------------------------------------------------------
// Reducer
// -------------------------------------------------------------------------

function sendFlowReducer(
  state: SendFlowState,
  action: SendFlowAction,
): SendFlowState {
  switch (action.type) {
    case 'SET_PARSED_FILE':
      return { ...state, parsedFile: action.payload };

    case 'SET_COLUMN_DETECTION':
      return { ...state, columnDetection: action.payload };

    case 'SET_COLUMN_MAPPING':
      return { ...state, columnMapping: action.payload };

    case 'CONFIRM_MAPPING':
      return { ...state, isMappingConfirmed: true };

    case 'SET_RECIPIENTS':
      return {
        ...state,
        recipients: action.payload.recipients,
        validation: action.payload.validation,
        recipientPreviewIndices: generatePreviewIndices(
          action.payload.recipients,
        ),
      };

    case 'SET_SKIP_INVALID':
      return { ...state, skipInvalidRows: action.payload };

    case 'UPDATE_TEMPLATE':
      return {
        ...state,
        template: { ...state.template, ...action.payload },
      };

    case 'GENERATE_PREVIEW_INDICES':
      return {
        ...state,
        recipientPreviewIndices: generatePreviewIndices(state.recipients),
      };

    case 'SET_SEND_PROGRESS':
      return {
        ...state,
        sendProgress: { ...state.sendProgress, ...action.payload },
      };

    case 'ADD_SEND_RESULT':
      return {
        ...state,
        sendResults: [...state.sendResults, action.payload],
      };

    case 'SEND_COMPLETE':
      return {
        ...state,
        sendProgress: { ...state.sendProgress, status: 'completed' },
      };

    case 'RESET':
      return { ...initialState };

    default:
      return state;
  }
}

// -------------------------------------------------------------------------
// Context
// -------------------------------------------------------------------------

export const SendFlowContext = createContext<SendFlowContextValue | null>(null);

// -------------------------------------------------------------------------
// Provider
// -------------------------------------------------------------------------

export function SendFlowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sendFlowReducer, initialState);

  // --- Convenience helpers -------------------------------------------------

  const updateTemplate = useCallback(
    (partial: Partial<MessageTemplate>) => {
      dispatch({ type: 'UPDATE_TEMPLATE', payload: partial });
    },
    [],
  );

  const setRecipients = useCallback(
    (recipients: Recipient[], validation: RecipientValidation) => {
      dispatch({ type: 'SET_RECIPIENTS', payload: { recipients, validation } });
    },
    [],
  );

  const generatePreviews = useCallback(() => {
    dispatch({ type: 'GENERATE_PREVIEW_INDICES' });
  }, []);

  const resetSendFlow = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  // --- Context value -------------------------------------------------------

  const value: SendFlowContextValue = {
    state,
    dispatch,
    updateTemplate,
    setRecipients,
    generatePreviews,
    resetSendFlow,
  };

  return (
    <SendFlowContext.Provider value={value}>
      {children}
    </SendFlowContext.Provider>
  );
}
