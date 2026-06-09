// =========================================================================
// AuthGuard — Conditional wrapper that gates content behind authentication
//
// - Loading   → spinner showing "Initializing…"
// - Unauthenticated → welcome / landing content with SignInButton
// - Authenticated   → render children
// =========================================================================

import type { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import SignInButton from './SignInButton';

export interface AuthGuardProps {
  children: ReactNode;
}

/**
 * Protect a portion of the UI behind authentication.
 *
 * Usage:
 *   <AuthGuard>
 *     <SpreadsheetUploader />
 *   </AuthGuard>
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const { state } = useAuth();

  // --- Loading ---
  if (!state.isInitialized) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Spinner />
        <p className="text-sm text-gray-400">Initializing authentication…</p>
      </div>
    );
  }

  // --- Unauthenticated ---
  if (state.status !== 'authenticated') {
    return <WelcomeScreen />;
  }

  // --- Authenticated ---
  return <>{children}</>;
}

// -------------------------------------------------------------------------
// Welcome Screen — Shown when the user is not authenticated
// -------------------------------------------------------------------------

function WelcomeScreen() {
  const { state } = useAuth();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        {/* Illustration / icon */}
        <div
          aria-hidden="true"
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100"
        >
          <svg
            className="h-8 w-8 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
            />
          </svg>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Love Note
        </h1>
        <p className="mb-1 text-base text-gray-600">
          Send personalized caring emails to your church family using your own
          Gmail account.
        </p>

        {state.error && (
          <p
            role="alert"
            className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {state.error}
          </p>
        )}

        <div className="mt-2">
          <SignInButton />
        </div>

        <p className="mt-6 text-xs leading-relaxed text-gray-400">
          Your data stays in your browser. Nothing is stored on any server.
          We only ask for permission to send email on your behalf.
        </p>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// Spinner
// -------------------------------------------------------------------------

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500"
    />
  );
}
