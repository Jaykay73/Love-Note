// =========================================================================
// Gmail API Client
//
// Thin wrapper around the Gmail REST API using raw fetch().
// No external client library is required.
// =========================================================================

// -------------------------------------------------------------------------
// Types
// -------------------------------------------------------------------------

export interface SendEmailParams {
  /** OAuth 2.0 access token with https://www.googleapis.com/auth/gmail.send */
  accessToken: string;
  /** Recipient email address (informational — the MIME message holds the actual To) */
  to: string;
  /** Base64url-encoded RFC 2822 MIME message */
  raw: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  statusCode: number;
  error?: string;
}

// -------------------------------------------------------------------------
// Constants
// -------------------------------------------------------------------------

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

// -------------------------------------------------------------------------
// Public API
// -------------------------------------------------------------------------

/**
 * Send a single email message via the Gmail API.
 *
 * @param params.accessToken - OAuth access token
 * @param params.raw         - Base64url-encoded RFC 2822 MIME message
 * @returns A result object with success/failure information
 */
export async function sendEmail(
  params: SendEmailParams
): Promise<SendEmailResult> {
  try {
    const response = await fetch(`${GMAIL_API_BASE}/messages/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: params.raw }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        messageId: data.id as string,
        statusCode: response.status,
      };
    }

    // --- Error classification -------------------------------------------
    const statusCode = response.status;
    let errorMessage: string;
    try {
      const errorBody = await response.json();
      errorMessage =
        (errorBody.error as { message?: string })?.message ??
        `HTTP ${statusCode}`;
    } catch {
      errorMessage = `HTTP ${statusCode}`;
    }

    return {
      success: false,
      statusCode,
      error: errorMessage,
    };
  } catch (err) {
    return {
      success: false,
      statusCode: 0,
      error:
        err instanceof Error
          ? err.message
          : 'A network error occurred while sending the email',
    };
  }
}

/**
 * Retrieve the authenticated user's Gmail profile.
 *
 * @param accessToken - OAuth 2.0 access token
 * @returns The user's primary email address
 */
export async function getProfile(
  accessToken: string
): Promise<{ email: string }> {
  const response = await fetch(`${GMAIL_API_BASE}/profile`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    let message = `Failed to fetch Gmail profile: HTTP ${response.status}`;
    try {
      const errorBody = await response.json();
      message =
        (errorBody.error as { message?: string })?.message ?? message;
    } catch {
      // Use the default message
    }
    throw new Error(message);
  }

  const data = await response.json();
  return { email: data.emailAddress as string };
}
