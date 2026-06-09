// =========================================================================
// useWizard — Convenience hook for consuming WizardContext
//
// Throws a descriptive error if used outside of a WizardProvider, making
// misuse obvious during development.
// =========================================================================

import { useContext } from 'react';
import { WizardContext, type WizardContextValue } from '../contexts/WizardContext';

/**
 * Access the current wizard state and navigation actions.
 *
 * Must be called within a `<WizardProvider>` tree, otherwise an error
 * is thrown with a clear message.
 */
export function useWizard(): WizardContextValue {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error(
      'useWizard must be used within a WizardProvider. ' +
        'Wrap your component tree with <WizardProvider>.'
    );
  }
  return context;
}
