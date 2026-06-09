// =========================================================================
// WizardContext — State machine for wizard step navigation
//
// Uses useReducer with WizardState and WizardAction from the shared types.
// Tracks step history so that "back" navigation returns to the previous step.
// =========================================================================

import {
  createContext,
  useCallback,
  useReducer,
  type ReactNode,
} from 'react';
import type { WizardState, WizardAction, WizardStep } from '../types';

// -------------------------------------------------------------------------
// Types
// -------------------------------------------------------------------------

export interface WizardContextValue {
  /** Current wizard state */
  state: WizardState;
  /** Raw reducer dispatch (exposed for advanced use cases) */
  dispatch: React.Dispatch<WizardAction>;
  /** Advance to the next step in the wizard sequence */
  goToNextStep: () => void;
  /** Go back to the previous step (pop from history) */
  goToPrevStep: () => void;
  /** Jump to a specific step */
  goToStep: (step: WizardStep) => void;
  /** Reset the wizard to its initial state */
  reset: () => void;
}

// -------------------------------------------------------------------------
// Constants
// -------------------------------------------------------------------------

const STEP_ORDER: WizardStep[] = [
  'welcome',
  'upload',
  'compose',
  'review',
  'sending',
  'result',
];

const initialState: WizardState = {
  currentStep: 'welcome',
  direction: 'forward',
  history: [],
};

// -------------------------------------------------------------------------
// Reducer
// -------------------------------------------------------------------------

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'GO_TO_STEP': {
      const currentIdx = STEP_ORDER.indexOf(state.currentStep);
      const targetIdx = STEP_ORDER.indexOf(action.payload);

      if (targetIdx === -1) {
        return state;
      }

      return {
        currentStep: action.payload,
        direction: targetIdx >= currentIdx ? 'forward' : 'backward',
        history: [...state.history, state.currentStep],
      };
    }

    case 'NEXT_STEP': {
      const currentIdx = STEP_ORDER.indexOf(state.currentStep);

      if (currentIdx === -1 || currentIdx >= STEP_ORDER.length - 1) {
        return state;
      }

      return {
        currentStep: STEP_ORDER[currentIdx + 1],
        direction: 'forward',
        history: [...state.history, state.currentStep],
      };
    }

    case 'PREV_STEP': {
      if (state.history.length === 0) {
        return state;
      }

      const prevStep = state.history[state.history.length - 1];

      return {
        currentStep: prevStep,
        direction: 'backward',
        history: state.history.slice(0, -1),
      };
    }

    case 'RESET': {
      return initialState;
    }

    default:
      return state;
  }
}

// -------------------------------------------------------------------------
// Context
// -------------------------------------------------------------------------

export const WizardContext = createContext<WizardContextValue | null>(null);

// -------------------------------------------------------------------------
// Provider
// -------------------------------------------------------------------------

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  const goToNextStep = useCallback(() => {
    dispatch({ type: 'NEXT_STEP' });
  }, []);

  const goToPrevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);

  const goToStep = useCallback((step: WizardStep) => {
    dispatch({ type: 'GO_TO_STEP', payload: step });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const value: WizardContextValue = {
    state,
    dispatch,
    goToNextStep,
    goToPrevStep,
    goToStep,
    reset,
  };

  return (
    <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
  );
}
