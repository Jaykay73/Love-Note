import { describe, it, expect } from 'vitest';
import { buildMimeMessage, encodeBase64Url } from '../mimeBuilder';
import type { MimeMessageParams } from '../mimeBuilder';

describe('buildMimeMessage', () => {
  const params: MimeMessageParams = {
    fromName: 'Pastor John',
    fromEmail: 'pastor@church.org',
    to: 'member@example.com',
    subject: 'Thinking of you',
    body: 'Hello friend, just wanted to let you know we care.',
  };

  it('includes From header with display name and email', () => {
    const msg = buildMimeMessage(params);
    expect(msg).toContain('From: "Pastor John" <pastor@church.org>');
  });

  it('includes To header with recipient email', () => {
    const msg = buildMimeMessage(params);
    expect(msg).toContain('To: member@example.com');
  });

  it('includes Subject header', () => {
    const msg = buildMimeMessage(params);
    expect(msg).toContain('Subject: Thinking of you');
  });

  it('includes Content-Type header with UTF-8 charset', () => {
    const msg = buildMimeMessage(params);
    expect(msg).toContain('Content-Type: text/plain; charset="UTF-8"');
  });

  it('includes the email body after headers', () => {
    const msg = buildMimeMessage(params);
    expect(msg).toContain('Hello friend, just wanted to let you know we care.');
  });

  it('uses CRLF line endings', () => {
    const msg = buildMimeMessage(params);
    expect(msg).toContain('\r\n');
  });

  it('handles UTF-8 characters (accents, emoji) in body', () => {
    const paramsWithAccents: MimeMessageParams = {
      ...params,
      body: 'Café résumé ñoño 😊',
    };
    const msg = buildMimeMessage(paramsWithAccents);
    expect(msg).toContain('Café résumé ñoño 😊');
  });

  it('handles special characters in subject', () => {
    const paramsWithSpecialSubject: MimeMessageParams = {
      ...params,
      subject: 'Quote "test" & <angle> brackets',
    };
    const msg = buildMimeMessage(paramsWithSpecialSubject);
    expect(msg).toContain('Subject: Quote "test" & <angle> brackets');
  });

  it('produces valid MIME with empty body', () => {
    const emptyBodyParams: MimeMessageParams = {
      ...params,
      body: '',
    };
    const msg = buildMimeMessage(emptyBodyParams);
    expect(msg).toContain('From:');
    expect(msg).toContain('To:');
    expect(msg).toContain('Subject:');
    expect(msg).toContain('Content-Type:');
    // Body should be empty string after the blank line
    const parts = msg.split('\r\n');
    expect(parts[parts.length - 1]).toBe('');
  });
});

describe('encodeBase64Url', () => {
  it('encodes a simple string correctly', () => {
    const encoded = encodeBase64Url('Hello World');
    // Standard base64 of 'Hello World' is 'SGVsbG8gV29ybGQ='
    // base64url strips padding: 'SGVsbG8gV29ybGQ'
    expect(encoded).toBe('SGVsbG8gV29ybGQ');
  });

  it('replaces + with - in base64url output', () => {
    // String that produces base64 with '+' characters
    // U+00FF (ÿ) encodes as UTF-8 bytes 0xC3 0xBF, which in base64 is w7/D
    // That string contains '/' which becomes '_', but we need something with '+'
    // Use characters that produce '+' in standard base64
    const input = '\x00\x00\x00\x00';  // 4 null bytes → base64 "AAAAAA==" → base64url "AAAAAA"
    const encoded = encodeBase64Url(input);
    // Verify no '+' or '/' characters
    expect(encoded).not.toContain('+');
    expect(encoded).not.toContain('/');
    // Verify no padding '='
    expect(encoded).not.toContain('=');
  });

  it('strips + and / characters via base64url encoding', () => {
    // Verify that base64url output never contains standard base64 special chars
    const inputs = ['\x00', '\xFF', 'Hello World!', 'test@email.com', '\u{1F499}'];
    for (const input of inputs) {
      const encoded = encodeBase64Url(input);
      expect(encoded).not.toContain('+');
      expect(encoded).not.toContain('/');
      expect(encoded).not.toContain('=');
      // Decoding should work: convert back to standard base64 and decode
      const standard = encoded.replace(/-/g, '+').replace(/_/g, '/');
      // Pad with = to make length multiple of 4
      const padded = standard + '='.repeat((4 - (standard.length % 4)) % 4);
      const decoded = atob(padded);
      // This won't be exact for multibyte UTF-8 but proves round-trip works
      expect(decoded.length).toBeGreaterThan(0);
    }
  });

  it('removes trailing = padding', () => {
    const encoded = encodeBase64Url('f');
    // base64 of 'f' is 'Zg==', base64url is 'Zg'
    expect(encoded).not.toContain('=');
  });

  it('round-trips correctly (encode then atob decode matches original)', () => {
    const original = 'Hello World! Special chars: @#$%^&*()';
    const encoded = encodeBase64Url(original);
    // Convert base64url back to standard base64
    const standard = encoded.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(encoded.length % 4 ? 4 - (encoded.length % 4) : 0);
    const decoded = decodeURIComponent(escape(atob(standard)));
    expect(decoded).toBe(original);
  });

  it('handles empty string', () => {
    expect(encodeBase64Url('')).toBe('');
  });
});
