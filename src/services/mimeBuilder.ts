// =========================================================================
// MIME Message Builder
//
// Constructs RFC 2822 compliant email message strings and encodes them
// as base64url for the Gmail API.
// =========================================================================

// -------------------------------------------------------------------------
// Types
// -------------------------------------------------------------------------

export interface MimeMessageParams {
  /** Display name shown in the From header */
  fromName: string;
  /** Email address shown in the From header */
  fromEmail: string;
  /** Recipient email address */
  to: string;
  /** Email subject line */
  subject: string;
  /** Plain-text email body */
  body: string;
}

// -------------------------------------------------------------------------
// Public API
// -------------------------------------------------------------------------

/**
 * Build an RFC 2822 MIME message string suitable for the Gmail API.
 *
 * The returned string uses CRLF (\r\n) line endings and includes the
 * standard email headers. The body is plain UTF-8 text.
 *
 * Example output:
 *
 *   From: "Pastor John" <pastor@church.org>
 *   To: member@example.com
 *   Subject: Thinking of you
 *   Content-Type: text/plain; charset="UTF-8"
 *
 *   Hello {name}, just wanted to let you know we care...
 */
export function buildMimeMessage(params: MimeMessageParams): string {
  const { fromName, fromEmail, to, subject, body } = params;

  const headerLines = [
    `From: "${fromName}" <${fromEmail}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    '',
    body,
  ];

  return headerLines.join('\r\n');
}

/**
 * Convert a UTF-8 string to base64url encoding.
 *
 * The standard base64 characters `+` and `/` are replaced with `-` and `_`
 * respectively, and trailing `=` padding is stripped, making the result
 * safe for use in URLs and the Gmail API `raw` parameter.
 */
export function encodeBase64Url(str: string): string {
  // Convert the UTF-8 string to a binary string, then to base64
  const binary = unescape(encodeURIComponent(str));
  const base64 = btoa(binary);
  // Convert to base64url
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
