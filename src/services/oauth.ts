// =========================================================================
// Google Identity Services (GIS) OAuth Wrapper
//
// The GIS library is loaded via <script> tag from
// https://accounts.google.com/gsi/client in index.html.
// =========================================================================

import type { UserProfile } from '../types';
import { getProfile } from './gmail';

// =========================================================================
// GIS Type Declarations (loaded from CDN, not via npm)
// =========================================================================

type TokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
  id_token?: string;
  scope?: string;
  expires_in?: number;
  token_type?: string;
};

type TokenClient = {
  requestAccessToken: (options?: { prompt?: string }) => void;
  callback: (response: TokenResponse) => void;
};

declare const google: {
  accounts: {
    oauth2: {
      initTokenClient: (config: {
        client_id: string;
        scope: string;
        callback: (response: TokenResponse) => void;
      }) => TokenClient;
      revoke: (token: string, done: () => void) => void;
    };
  };
};

// =========================================================================
// Module-level state
// =========================================================================

let tokenClient: TokenClient | null = null;
let currentAccessToken: string | null = null;
let currentUser: UserProfile | null = null;

// =========================================================================
// Helpers
// =========================================================================

function getClientId(): string {
  const id = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!id) {
    throw new Error(
      'VITE_GOOGLE_CLIENT_ID environment variable is not set. ' +
        'Copy .env.example to .env and add your Google OAuth client ID.'
    );
  }
  return id;
}

/**
 * Decode a Google-issued JWT (id_token) to extract the user profile.
 * The JWT has three dot-separated base64url-encoded parts:
 * header.payload.signature
 */
function decodeIdToken(idToken: string): UserProfile {
  try {
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      throw new Error('Unexpected JWT structure: expected 3 parts');
    }
    const payload = parts[1];
    // Convert base64url → base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    // Restore padding
    const remainder = base64.length % 4;
    const padded =
      remainder === 0 ? base64 : base64 + '='.repeat(4 - remainder);
    const decoded: Record<string, unknown> = JSON.parse(atob(padded));
    return {
      email: typeof decoded.email === 'string' ? decoded.email : '',
      name: typeof decoded.name === 'string' ? decoded.name : '',
      picture: typeof decoded.picture === 'string' ? decoded.picture : '',
    };
  } catch (err) {
    console.error('Failed to decode Google ID token:', err);
    return { email: '', name: '', picture: '' };
  }
}

/**
 * Wait for the GIS library to finish loading from the CDN.
 * Polls at 100ms intervals so calling code doesn't need to coordinate
 * with the script's `onload` event.
 */
function waitForGisLibrary(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof google !== 'undefined' && google.accounts?.oauth2) {
      resolve();
      return;
    }
    const poll = (): void => {
      if (typeof google !== 'undefined' && google.accounts?.oauth2) {
        resolve();
      } else {
        setTimeout(poll, 100);
      }
    };
    poll();
  });
}

/**
 * Internal helper that wraps the callback-based token client request in
 * a Promise. When `prompt` is omitted the consent popup is shown as needed;
 * when it is `''` (empty string) the library attempts a silent no-popup flow.
 */
function requestAccessTokenWithPrompt(
  prompt?: string
): Promise<{ accessToken: string; user: UserProfile }> {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(
        new Error(
          'Google Auth is not initialized. Call initializeGoogleAuth() first.'
        )
      );
      return;
    }

    tokenClient.callback = (response: TokenResponse) => {
      if (response.error) {
        reject(
          new Error(response.error_description ?? response.error)
        );
        return;
      }

      if (!response.access_token) {
        reject(new Error('No access token received from Google'));
        return;
      }

      currentAccessToken = response.access_token;

      // Derive user profile from the JWT id_token if available.
      let user: UserProfile;
      if (response.id_token) {
        user = decodeIdToken(response.id_token);
      } else {
        // Fall back to the previously cached profile (may be empty on first
        // call if the id_token was not returned).
        user = currentUser ?? { email: '', name: '', picture: '' };
      }
      currentUser = user;

      resolve({ accessToken: currentAccessToken as string, user });
    };

    if (prompt !== undefined) {
      tokenClient.requestAccessToken({ prompt });
    } else {
      tokenClient.requestAccessToken();
    }
  });
}

// =========================================================================
// Public API
// =========================================================================

/**
 * Initialise the GIS token client.
 * Must be called once before any other function in this module.
 */
export async function initializeGoogleAuth(): Promise<void> {
  await waitForGisLibrary();

  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: getClientId(),
    scope: 'https://www.googleapis.com/auth/gmail.send',
    // Default callback — replaced per-request below
    callback: () => {
      /* no-op */
    },
  });
}

/**
 * Request an access token from the user.
 *
 * On the first attempt the library tries a silent flow (no popup).
 * If that fails (e.g. consent has not been granted yet), the consent
 * popup is shown automatically.
 */
export async function requestAccessToken(): Promise<{
  accessToken: string;
  user: UserProfile;
}> {
  try {
    // Silent attempt — no popup
    const result = await requestAccessTokenWithPrompt('');
    return enrichUserProfile(result);
  } catch {
    // Retry with the consent popup
    const result = await requestAccessTokenWithPrompt();
    return enrichUserProfile(result);
  }
}

/**
 * Fills in the user's email from the Gmail API if the JWT id_token
 * decode didn't provide it. This is the most reliable way to get the
 * sender's email address.
 */
async function enrichUserProfile(result: {
  accessToken: string;
  user: UserProfile;
}): Promise<{ accessToken: string; user: UserProfile }> {
  if (result.user.email) {
    return result; // Already have the email from the JWT
  }

  try {
    const profile = await getProfile(result.accessToken);
    return {
      accessToken: result.accessToken,
      user: { ...result.user, email: profile.email },
    };
  } catch {
    // If the Gmail profile fetch fails, return whatever we have
    return result;
  }
}

/**
 * Silently refresh the access token without showing a popup.
 * Rejects if the user is not signed in or if consent was revoked.
 */
export async function refreshAccessToken(): Promise<string> {
  const result = await requestAccessTokenWithPrompt('');
  return result.accessToken;
}

/**
 * Revoke the current access token and clear in-memory state.
 */
export function revokeAccess(): void {
  if (currentAccessToken) {
    try {
      google.accounts.oauth2.revoke(currentAccessToken, () => {
        /* no-op */
      });
    } catch (err) {
      console.warn('Failed to revoke Google access token', err);
    }
    currentAccessToken = null;
    currentUser = null;
  }
}

/**
 * Return the current in-memory access token, or `null` if no token
 * has been obtained yet.
 */
export function getAccessToken(): string | null {
  return currentAccessToken;
}
