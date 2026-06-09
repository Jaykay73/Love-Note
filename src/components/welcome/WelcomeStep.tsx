// =========================================================================
// WelcomeStep — The landing screen for the Love Note wizard
//
// Shows the app branding, a description, and either a Sign In button
// (for unauthenticated users) or a "Get Started" button (for authenticated
// users) that advances to the Upload step.
// =========================================================================

import { useAuth } from '../../hooks/useAuth';
import { useWizard } from '../../hooks/useWizard';
import SignInButton from '../auth/SignInButton';
import Button from '../common/Button';

/**
 * Welcome screen — the first step of the wizard.
 *
 * Handles three states:
 * - Loading: spinner while auth initializes
 * - Unauthenticated: branding + SignInButton
 * - Authenticated: branding + Get Started button
 */
export default function WelcomeStep() {
  const { state: authState } = useAuth();
  const { goToNextStep } = useWizard();

  // --- Loading: auth is still initializing ---
  if (!authState.isInitialized) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4" role="status" aria-live="polite">
        <div
          aria-hidden="true"
          className="h-10 w-10 motion-safe:animate-spin rounded-full border-[3px] border-rose-200 border-t-rose-500"
        />
        <p className="text-sm text-rose-400 font-medium">Warming up the love…</p>
      </div>
    );
  }

  const isAuthenticated = authState.status === 'authenticated';

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-lg text-center">
        {/* --- App logo / icon --- */}
        <div
          aria-hidden="true"
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-rose-100 ring-4 ring-rose-200/50"
        >
          <span className="text-5xl">💌</span>
        </div>

        {/* --- Title --- */}
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-rose-600">
          Love Note
        </h1>

        {/* --- Subtitle --- */}
        <p className="mb-8 text-lg text-rose-500/80 font-medium">
          Send personalized caring emails to your church family
        </p>

        {/* --- Description --- */}
        <div className="mb-8 space-y-3 text-left text-sm leading-relaxed">
          <p className="text-sky-700 bg-sky-50 rounded-lg px-4 py-2.5 border border-sky-100">
            💡{' '}
            <strong className="font-semibold">How it works:</strong>{' '}
            Upload an Excel or CSV file with your contact list, map the columns,
            write a personalized message with <code className="bg-sky-100 px-1.5 py-0.5 rounded text-sky-800 text-xs font-mono">{'{first_name}'}</code>,{' '}
            review your recipients, and send with one click using your own Gmail account.
          </p>
          <p className="text-green-700 bg-green-50 rounded-lg px-4 py-2.5 border border-green-100">
            🔒{' '}
            <strong className="font-semibold">Privacy first:</strong>{' '}
            All processing happens entirely in your browser. Your data is
            never uploaded to any server — it stays on your machine from start
            to finish.
          </p>
        </div>

        {/* --- Auth error --- */}
        {authState.error && !isAuthenticated && (
          <p
            role="alert"
            className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {authState.error}
          </p>
        )}

        {/* --- CTA: Sign in or Get started --- */}
        <div className="flex justify-center">
          {isAuthenticated ? (
            <Button size="lg" onClick={goToNextStep}>
              Get Started
              <svg
                className="h-5 w-5 ml-1"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Button>
          ) : (
            <SignInButton />
          )}
        </div>

        {/* --- Footer note --- */}
        <p className="mt-8 text-xs leading-relaxed text-rose-400">
          💕 Your data stays in your browser. Nothing is stored on any server.
          We only ask for permission to send email on your behalf.
        </p>
      </div>
    </div>
  );
}
