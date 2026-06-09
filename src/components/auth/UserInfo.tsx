// =========================================================================
// UserInfo — Shows logged-in user's avatar, name, email, and sign-out
// button.
// =========================================================================

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

/**
 * Display the currently authenticated user's profile information.
 *
 * Renders nothing (returns `null`) when the user is not authenticated
 * or auth is still initialising.
 */
export default function UserInfo() {
  const { state, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (state.status !== 'authenticated' || !state.user) {
    return null;
  }

  const { user } = state;
  const initials = user.name
    ? user.name
        .split(' ')
        .map((part) => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('')
    : user.email.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      signOut();
    } catch {
      // signOut is synchronous / best-effort, but wrap to be safe
    } finally {
      setIsSigningOut(false);
    }
  };

  // Default avatar background colour derived from the email address
  const avatarBg = getColorFromEmail(user.email);

  return (
    <div className="flex items-center gap-4 rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-gray-200">
      {/* --- Avatar --- */}
      {user.picture ? (
        <img
          src={user.picture}
          alt={`${user.name}'s avatar`}
          className="h-10 w-10 rounded-full object-cover ring-2 ring-rose-200"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ring-2 ring-rose-200 shadow-sm"
          style={{ backgroundColor: avatarBg }}
        >
          {initials}
        </span>
      )}

      {/* --- Name & Email --- */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900">
          {user.name || 'Signed in'}
        </p>
        <p className="truncate text-xs text-gray-500">{user.email}</p>
      </div>

      {/* --- Sign out --- */}
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        aria-label="Sign out"
        className={`
          shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1
          ${
            isSigningOut
              ? 'cursor-not-allowed bg-red-50 text-red-300'
              : 'cursor-pointer bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200'
          }
        `}
      >
        {isSigningOut ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  );
}

// -------------------------------------------------------------------------
// Deterministic colour from a string (email) for the default avatar
// -------------------------------------------------------------------------

const AVATAR_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f43f5e', // rose
  '#14b8a6', // teal
  '#0ea5e9', // sky
  '#f59e0b', // amber
  '#84cc16', // lime
];

function getColorFromEmail(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}
