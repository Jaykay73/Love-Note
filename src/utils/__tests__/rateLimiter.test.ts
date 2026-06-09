import { describe, it, expect } from 'vitest';
import {
  calculateBackoff,
  checkQuotaWarning,
  getSendDelay,
  getGmailDailyLimit,
} from '../rateLimiter';

describe('calculateBackoff', () => {
  it('returns 1000 for attempt 0', () => {
    expect(calculateBackoff(0)).toBe(1000);
  });

  it('returns 2000 for attempt 1', () => {
    expect(calculateBackoff(1)).toBe(2000);
  });

  it('returns 4000 for attempt 2', () => {
    expect(calculateBackoff(2)).toBe(4000);
  });

  it('returns 8000 for attempt 3', () => {
    expect(calculateBackoff(3)).toBe(8000);
  });

  it('returns 16000 for attempt 4', () => {
    expect(calculateBackoff(4)).toBe(16000);
  });

  it('caps at 30000 for attempt 5', () => {
    expect(calculateBackoff(5)).toBe(30000);
  });

  it('caps at 30000 for attempts beyond 5', () => {
    expect(calculateBackoff(10)).toBe(30000);
    expect(calculateBackoff(100)).toBe(30000);
  });

  it('returns 1000 for negative attempt numbers', () => {
    expect(calculateBackoff(-1)).toBe(1000);
    expect(calculateBackoff(-5)).toBe(1000);
  });
});

describe('checkQuotaWarning', () => {
  it('allows sending when batch fits within remaining quota', () => {
    const result = checkQuotaWarning(10, 0);
    expect(result.canSendAll).toBe(true);
    expect(result.warning).toBeNull();
    expect(result.estimatedRemaining).toBe(500);
  });

  it('rejects sending when batch exceeds remaining quota', () => {
    const result = checkQuotaWarning(400, 200);
    expect(result.canSendAll).toBe(false);
    expect(result.warning).toContain('remain');
    expect(result.estimatedRemaining).toBe(300);
  });

  it('returns daily limit of 500', () => {
    expect(getGmailDailyLimit()).toBe(500);
  });

  it('returns canSendAll=false and warning when alreadySentToday >= dailyLimit', () => {
    const result = checkQuotaWarning(1, 500);
    expect(result.canSendAll).toBe(false);
    expect(result.warning).toContain('already sent');
    expect(result.estimatedRemaining).toBe(0);
  });

  it('returns canSendAll=false with warning when recipientCount is 0', () => {
    const result = checkQuotaWarning(0);
    expect(result.canSendAll).toBe(false);
    expect(result.warning).toBe('No recipients to send to.');
  });

  it('returns canSendAll=true with warning when approaching limit (<=10% remaining)', () => {
    const result = checkQuotaWarning(5, 455);
    expect(result.canSendAll).toBe(true);
    expect(result.warning).toContain('remain');
    expect(result.estimatedRemaining).toBe(45);
  });

  it('handles default alreadySentToday of 0', () => {
    const result = checkQuotaWarning(10);
    expect(result.canSendAll).toBe(true);
    expect(result.estimatedRemaining).toBe(500);
  });
});

describe('getSendDelay', () => {
  it('returns 200', () => {
    expect(getSendDelay()).toBe(200);
  });
});

describe('getGmailDailyLimit', () => {
  it('returns 500', () => {
    expect(getGmailDailyLimit()).toBe(500);
  });
});
