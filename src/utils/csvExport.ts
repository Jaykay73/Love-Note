import type { Recipient } from '../types';

/**
 * Escapes a CSV field value: wraps in quotes if it contains commas, quotes, or newlines,
 * and doubles any internal quotes.
 */
function escapeCsvField(value: string): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Builds a CSV string from an array of header names and rows of values.
 * Includes a UTF-8 BOM for Excel compatibility.
 */
function buildCsv(headers: string[], rows: string[][]): string {
  const bom = '﻿';
  const headerLine = headers.map(escapeCsvField).join(',');
  const dataLines = rows.map((row) =>
    row.map((cell) => escapeCsvField(cell)).join(',')
  );
  return [bom + headerLine, ...dataLines].join('\r\n');
}

/**
 * Triggers a browser download of the given CSV string with the specified filename.
 */
function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a CSV file containing failed recipients with their error details.
 */
export function exportFailedRecipients(
  failedItems: Array<{ email: string; first_name: string; last_name: string; error?: string }>
): void {
  if (failedItems.length === 0) return;

  const headers = ['Email', 'First Name', 'Last Name', 'Error'];
  const rows = failedItems.map((item) => [
    item.email,
    item.first_name,
    item.last_name,
    item.error ?? '',
  ]);

  const csvContent = buildCsv(headers, rows);
  downloadCsv(csvContent, 'failed-recipients.csv');
}

/**
 * Generates and downloads a CSV file containing recipients that were not sent to.
 */
export function exportUnsentRecipients(recipients: Recipient[]): void {
  if (recipients.length === 0) return;

  const headers = ['Email', 'First Name', 'Last Name', 'Full Name'];
  const rows = recipients.map((r) => [
    r.email,
    r.first_name,
    r.last_name,
    r.full_name,
  ]);

  const csvContent = buildCsv(headers, rows);
  downloadCsv(csvContent, 'unsent-recipients.csv');
}
