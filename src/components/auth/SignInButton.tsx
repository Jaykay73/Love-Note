// =========================================================================
// SignInButton — "Sign in with Google" button
//
// Shows a prominent blue/white button styled after Google's branding.
// Displays a loading spinner during authentication and an error message
// if sign-in fails.
// =========================================================================

import { useAuth } from '../../hooks/useAuth';

/**
 * A self-contained Google sign-in button.
 *
 * Renders nothing when the user is already authenticated — the parent
 * component should use AuthGuard to conditionally show this button only
 * when needed.
 */
export default function SignInButton() {
  const { state, signIn } = useAuth();

  const isBusy = state.status === 'loading' && !state.isInitialized;
  const isSigningIn = state.status === 'loading' && state.isInitialized;
  const isLoading = isBusy || isSigningIn;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* --- Button --- */}
      <button
        type="button"
        onClick={signIn}
        disabled={isLoading}
        aria-label={isLoading ? 'Signing in…' : 'Sign in with Google'}
        className={`
          flex items-center gap-3 rounded-lg border border-gray-300 px-8 py-3
          text-sm font-semibold shadow-sm transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${
            isLoading
              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
              : 'cursor-pointer bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md active:scale-[0.98]'
          }
        `}
      >
        {/* Google "G" logo */}
        <svg
          aria-hidden="true"
          className="h-5 w-5 shrink-0"
          viewBox="0 0 48 48"
        >
          <path
            fill="#4285F4"
            d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
          />
          <path
            fill="#34A853"
            d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
          />
          <path
            fill="#FBBC05"
            d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34A23.04 23.04 0 0 0 1 24c0 3.77.9 7.34 3.34 10.48l7.35-6.3z"
          />
          <path
            fill="#EA4335"
            d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 13.52l7.35 6.3c1.73-5.2 6.58-9.07 12.31-9.07z"
          />
        </svg>

        {isLoading ? (
          <span className="flex items-center gap-2">
            <Spinner />
            {isSigningIn ? 'Signing in…' : 'Initializing…'}
          </span>
        ) : (
          'Sign in with Google'
        )}
      </button>

      {/* --- Error --- */}
      {state.error && state.status === 'unauthenticated' && (
        <p
          role="alert"
          className="max-w-sm rounded-md bg-red-50 px-4 py-2 text-center text-sm text-red-700"
        >
          {state.error}
        </p>
      )}
    </div>
  );
}

// -------------------------------------------------------------------------
// Spinner — small animated loading indicator
// -------------------------------------------------------------------------

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}
