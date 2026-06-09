import type { Recipient, MessageTemplate } from '../types';

/**
 * Placeholder pattern: matches {{first_name}}, {{last_name}}, {{full_name}}, {{email}}
 */
const PLACEHOLDER_REGEX = /\{\{(first_name|last_name|full_name|email)\}\}/gi;

/**
 * Interpolates a single template string by replacing {{placeholders}}
 * with the corresponding values from the recipient object.
 *
 * Unknown placeholders are left unchanged in the output.
 */
export function interpolate(template: string, recipient: Recipient): string {
  return template.replace(PLACEHOLDER_REGEX, (_match, key: string) => {
    switch (key.toLowerCase()) {
      case 'first_name':
        return recipient.first_name;
      case 'last_name':
        return recipient.last_name;
      case 'full_name':
        return recipient.full_name;
      case 'email':
        return recipient.email;
      default:
        return _match;
    }
  });
}

/**
 * Interpolates both subject and body of a MessageTemplate with recipient data.
 */
export function interpolateTemplate(
  template: MessageTemplate,
  recipient: Recipient
): { subject: string; body: string } {
  return {
    subject: interpolate(template.subject, recipient),
    body: interpolate(template.body, recipient),
  };
}

/**
 * Checks whether a MessageTemplate contains any placeholders.
 */
export function hasPlaceholders(template: MessageTemplate): boolean {
  return PLACEHOLDER_REGEX.test(template.subject) || PLACEHOLDER_REGEX.test(template.body);
}

/**
 * Returns a warning string if the template contains placeholders that might
 * be unexpected when sending to multiple recipients.
 *
 * Returns null if no warning is warranted.
 */
export function getUnusedPlaceholderWarning(
  template: MessageTemplate,
  recipientCount: number
): string | null {
  const combined = `${template.subject} ${template.body}`;
  const matches = combined.match(PLACEHOLDER_REGEX);

  if (!matches) {
    return null;
  }

  // If there's only one recipient but the template has placeholders, that's fine
  if (recipientCount <= 1) {
    return null;
  }

  // Warn only when there are no first_name placeholders (the most common one)
  // but other placeholders exist — this is a sign the user may have forgotten
  // to personalize properly
  const hasFirstName = /\{\{first_name\}\}/i.test(combined);

  if (!hasFirstName && matches.length > 0) {
    return 'Your template contains placeholders but is missing {{first_name}}. '
      + 'Consider personalizing your message with each recipient\'s first name.';
  }

  return null;
}
