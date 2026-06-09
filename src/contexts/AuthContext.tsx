// =========================================================================
// AuthContext — React Context + Provider for authentication state
//
// Uses useReducer with the AuthState / AuthAction types from ../types.
// Wraps the oauth service functions so that components only interact
// with React context.
// =========================================================================

import {
  createContext,
  useCallback,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react';
import type { AuthState, AuthAction } from '../types';
import * as oauth from '../services/oauth';

// -------------------------------------------------------------------------
// Types
// -------------------------------------------------------------------------

export interface AuthContextValue {
  /** Current authentication state */
  state: AuthState;
  /** Raw reducer dispatch (exposed for advanced use cases) */
  dispatch: React.Dispatch<AuthAction>;
  /** Open the Google sign-in / consent popup */
  signIn: () => Promise<void>;
  /** Sign the user out and revoke the access token */
  signOut: () => void;
  /** Silently refresh the access token */
  refreshToken: () => Promise<void>;
}

// -------------------------------------------------------------------------
// Constants
// -------------------------------------------------------------------------

const initialState: AuthState = {
  status: 'loading',
  accessToken: null,
  user: null,
  error: null,
  isInitialized: false,
};

// -------------------------------------------------------------------------
// Reducer
// -------------------------------------------------------------------------

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, status: 'loading', error: null };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        status: 'authenticated',
        accessToken: action.payload.accessToken,
        user: action.payload.user,
        error: null,
      };

    case 'AUTH_ERROR':
      return {
        ...state,
        status: 'unauthenticated',
        accessToken: null,
        user: null,
        error: action.payload,
      };

    case 'TOKEN_REFRESHED':
      return { ...state, accessToken: action.payload };

    case 'LOGOUT':
      return {
        ...state,
        status: 'unauthenticated',
        accessToken: null,
        user: null,
        error: null,
      };

    case 'SET_INITIALIZED':
      return {
        ...state,
        isInitialized: true,
        status: state.status === 'loading' ? 'unauthenticated' : state.status,
      };

    default:
      return state;
  }
}

// -------------------------------------------------------------------------
// Context
// -------------------------------------------------------------------------

export const AuthContext = createContext<AuthContextValue | null>(null);

// -------------------------------------------------------------------------
// Provider
// -------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // --- Initialise GIS on mount ------------------------------------------
  useEffect(() => {
    oauth
      .initializeGoogleAuth()
      .then(() => {
        dispatch({ type: 'SET_INITIALIZED' });
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : 'Failed to initialize Google authentication';
        console.error('Google Auth initialisation error:', message);
        dispatch({ type: 'AUTH_ERROR', payload: message });
        // Still mark as initialised so the UI transitions out of loading
        dispatch({ type: 'SET_INITIALIZED' });
      });
  }, []);

  // --- Convenience actions ----------------------------------------------

  const signIn = useCallback(async () => {
    dispatch({ type: 'AUTH_START' });
    try {
      const { accessToken, user } = await oauth.requestAccessToken();
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { accessToken, user },
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Sign in failed';
      dispatch({ type: 'AUTH_ERROR', payload: message });
    }
  }, []);

  const signOut = useCallback(() => {
    oauth.revokeAccess();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const accessToken = await oauth.refreshAccessToken();
      dispatch({ type: 'TOKEN_REFRESHED', payload: accessToken });
    } catch (error: unknown) {
      // Silent refresh failed — the user probably needs to sign in again.
      const message =
        error instanceof Error ? error.message : 'Token refresh failed';
      console.warn('Token refresh failed, signing out:', message);
      oauth.revokeAccess();
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  // --- Context value ----------------------------------------------------

  const value: AuthContextValue = {
    state,
    dispatch,
    signIn,
    signOut,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
