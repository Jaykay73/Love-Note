// =========================================================================
// useAuth — Convenience hook for consuming AuthContext
//
// Throws a descriptive error if used outside of an AuthProvider, making
// misuse obvious during development.
// =========================================================================

import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from '../contexts/AuthContext';

/**
 * Access the current authentication state and actions.
 *
 * Must be called within an `<AuthProvider>` tree, otherwise an error
 * is thrown with a clear message.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
        'Wrap your component tree with <AuthProvider>.'
    );
  }
  return context;
}
