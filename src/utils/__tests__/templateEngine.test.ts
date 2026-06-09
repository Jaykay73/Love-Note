import { describe, it, expect } from 'vitest';
import {
  interpolate,
  interpolateTemplate,
  hasPlaceholders,
  getUnusedPlaceholderWarning,
} from '../templateEngine';
import type { Recipient, MessageTemplate } from '../../types';

function makeRecipient(overrides: Partial<Recipient> = {}): Recipient {
  return {
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    full_name: 'John Doe',
    rowIndex: 0,
    ...overrides,
  };
}

function makeTemplate(overrides: Partial<MessageTemplate> = {}): MessageTemplate {
  return {
    subject: 'Hello {{first_name}}',
    body: 'Dear {{full_name}},\n\nThis is a test message for {{email}}.',
    fromName: 'Test Sender',
    ...overrides,
  };
}

describe('interpolate', () => {
  it('substitutes all 4 placeholders correctly', () => {
    const tpl = '{{first_name}} {{last_name}} ({{full_name}}) <{{email}}>';
    const recipient = makeRecipient();
    const result = interpolate(tpl, recipient);
    expect(result).toBe('John Doe (John Doe) <test@example.com>');
  });

  it('uses recipient first_name value verbatim (fallback handled upstream)', () => {
    const tpl = 'Hello {{first_name}}!';
    const recipient = makeRecipient({ first_name: 'friend' });
    const result = interpolate(tpl, recipient);
    expect(result).toBe('Hello friend!');
  });

  it('uses empty string for missing last_name', () => {
    const tpl = '{{first_name}} {{last_name}}';
    const recipient = makeRecipient({ last_name: '' });
    const result = interpolate(tpl, recipient);
    expect(result).toBe('John ');
  });

  it('uses computed full_name for {{full_name}}', () => {
    const tpl = 'Hello {{full_name}}';
    const recipient = makeRecipient({ full_name: 'John Doe' });
    const result = interpolate(tpl, recipient);
    expect(result).toBe('Hello John Doe');
  });

  it('uses recipient email for {{email}}', () => {
    const tpl = 'Contact: {{email}}';
    const recipient = makeRecipient({ email: 'user@church.org' });
    const result = interpolate(tpl, recipient);
    expect(result).toBe('Contact: user@church.org');
  });

  it('handles empty template string', () => {
    const recipient = makeRecipient();
    const result = interpolate('', recipient);
    expect(result).toBe('');
  });

  it('handles templates with special characters', () => {
    const tpl = 'Subject: "{{first_name}}" <{{email}}> & <{{last_name}}>';
    const recipient = makeRecipient({
      first_name: 'O\'Brien',
      last_name: 'Smith-Jones',
      email: 'ob@test.com',
    });
    const result = interpolate(tpl, recipient);
    expect(result).toBe('Subject: "O\'Brien" <ob@test.com> & <Smith-Jones>');
  });

  it('is case insensitive for placeholders', () => {
    const recipient = makeRecipient({ first_name: 'Jane' });
    expect(interpolate('{{First_Name}}', recipient)).toBe('Jane');
    expect(interpolate('{{FIRST_NAME}}', recipient)).toBe('Jane');
    expect(interpolate('{{first_name}}', recipient)).toBe('Jane');
  });

  it('leaves unknown placeholders unchanged', () => {
    const tpl = 'Hello {{first_name}} {{unknown}}';
    const recipient = makeRecipient();
    const result = interpolate(tpl, recipient);
    expect(result).toBe('Hello John {{unknown}}');
  });
});

describe('interpolateTemplate', () => {
  it('interpolates both subject and body', () => {
    const template = makeTemplate();
    const recipient = makeRecipient({ email: 'jane@test.com' });
    const result = interpolateTemplate(template, recipient);
    expect(result.subject).toBe('Hello John');
    expect(result.body).toContain('Dear John Doe');
    expect(result.body).toContain('jane@test.com');
  });

  it('returns empty subject and body when template is empty', () => {
    const template = makeTemplate({ subject: '', body: '' });
    const recipient = makeRecipient();
    const result = interpolateTemplate(template, recipient);
    expect(result.subject).toBe('');
    expect(result.body).toBe('');
  });
});

describe('hasPlaceholders', () => {
  it('returns true when subject has placeholders', () => {
    const template = makeTemplate({ subject: 'Hello {{first_name}}', body: 'Test' });
    expect(hasPlaceholders(template)).toBe(true);
  });

  it('returns true when body has placeholders', () => {
    const template = makeTemplate({ subject: 'Hello', body: 'Dear {{last_name}}' });
    expect(hasPlaceholders(template)).toBe(true);
  });

  it('returns false when no placeholders exist', () => {
    const template = makeTemplate({ subject: 'Hello', body: 'Just a plain message.' });
    expect(hasPlaceholders(template)).toBe(false);
  });

  it('returns false for empty template', () => {
    const template = makeTemplate({ subject: '', body: '' });
    expect(hasPlaceholders(template)).toBe(false);
  });
});

describe('getUnusedPlaceholderWarning', () => {
  it('returns null when template has no placeholders', () => {
    const template = makeTemplate({ subject: 'Hi', body: 'Just checking in.' });
    expect(getUnusedPlaceholderWarning(template, 20)).toBeNull();
  });

  it('returns null when recipientCount is 1 (single recipient is fine)', () => {
    const template = makeTemplate({ subject: 'Hello {{full_name}}', body: 'Hi!' });
    expect(getUnusedPlaceholderWarning(template, 1)).toBeNull();
  });

  it('returns null when {{first_name}} is present (already personalized)', () => {
    const template = makeTemplate({
      subject: 'Hello {{first_name}}',
      body: 'Just a note for {{full_name}}.',
    });
    expect(getUnusedPlaceholderWarning(template, 20)).toBeNull();
  });

  it('returns warning when no {{first_name}} but other placeholders exist with >10 recipients', () => {
    const template = makeTemplate({
      subject: 'Hello {{full_name}}',
      body: 'Your email is {{email}}.',
    });
    const warning = getUnusedPlaceholderWarning(template, 15);
    expect(warning).toContain('missing {{first_name}}');
  });

  it('returns null when only {{first_name}} exists (fully personalized)', () => {
    const template = makeTemplate({
      subject: 'Hi {{first_name}}',
      body: 'Thinking of you.',
    });
    expect(getUnusedPlaceholderWarning(template, 50)).toBeNull();
  });
});
