/**
 * Calculates exponential backoff delay in milliseconds for a given attempt number.
 * Produces: 1000, 2000, 4000, 8000, 16000 for attempts 0-4.
 * For attempts >= 5, caps at 30000ms (30 seconds).
 */
export function calculateBackoff(attempt: number): number {
  if (attempt < 0) return 1000;

  const delay = 1000 * Math.pow(2, attempt);
  return Math.min(delay, 30000);
}

/**
 * Returns Gmail's daily sending limit.
 * Standard Gmail accounts are limited to 500 emails per day.
 */
export function getGmailDailyLimit(): number {
  return 500;
}

/**
 * Checks whether the intended recipient count can be sent within Gmail's daily limit.
 *
 * @param recipientCount - Number of recipients the user wants to send to.
 * @param alreadySentToday - Optional. How many emails have already been sent today (default 0).
 * @returns Object with:
 *   - canSendAll: whether all recipients can be sent
 *   - warning: a human-readable warning message, or null
 *   - estimatedRemaining: remaining sends available today
 */
export function checkQuotaWarning(
  recipientCount: number,
  alreadySentToday: number = 0
): { canSendAll: boolean; warning: string | null; estimatedRemaining: number } {
  const dailyLimit = getGmailDailyLimit();
  const estimatedRemaining = Math.max(0, dailyLimit - alreadySentToday);

  if (recipientCount <= 0) {
    return {
      canSendAll: false,
      warning: 'No recipients to send to.',
      estimatedRemaining,
    };
  }

  if (alreadySentToday >= dailyLimit) {
    return {
      canSendAll: false,
      warning: `You have already sent ${alreadySentToday} emails today, which meets or exceeds Gmail's daily limit of ${dailyLimit}. Please wait until tomorrow to send more.`,
      estimatedRemaining: 0,
    };
  }

  if (recipientCount > estimatedRemaining) {
    return {
      canSendAll: false,
      warning: `You are attempting to send to ${recipientCount} recipient(s), but only ${estimatedRemaining} send(s) remain today (Gmail limit: ${dailyLimit}). Consider sending in batches over multiple days.`,
      estimatedRemaining,
    };
  }

  // All can be sent, but warn if approaching the limit
  if (estimatedRemaining <= Math.round(dailyLimit * 0.1)) {
    return {
      canSendAll: true,
      warning: `You have ${estimatedRemaining} send(s) remaining today. You may hit Gmail's daily limit.`,
      estimatedRemaining,
    };
  }

  return {
    canSendAll: true,
    warning: null,
    estimatedRemaining,
  };
}

/**
 * Returns the delay in milliseconds between sending individual emails.
 * Used to avoid triggering Gmail's rate limiting.
 */
export function getSendDelay(): number {
  return 200;
}
